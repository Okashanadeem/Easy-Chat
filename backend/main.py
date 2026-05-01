import os
import re
import traceback
import uvicorn
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import db
from utils import chunk_text, extract_text_from_pdf, cosine_similarity
from models import ChatRequest

load_dotenv(override=True)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in environment variables!")
else:
    print(f"✅ GEMINI_API_KEY loaded: {api_key[:5]}...{api_key[-5:]}")

genai.configure(api_key=api_key)
embedding_model = "models/gemini-embedding-001"

# Safety Settings to avoid "Violation" blocks for academic content
from google.generativeai.types import HarmCategory, HarmBlockThreshold
safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

chat_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    safety_settings=safety_settings
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI(title="Easy Chat API")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"❌ VALIDATION ERROR: {exc.errors()}")
    return JSONResponse(
        status_code=400,
        content={"detail": exc.errors(), "body": str(exc)},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Easy Chat API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

def get_retry_seconds(e: Exception) -> int:
    """Aggressive retry time extraction from Gemini errors."""
    error_msg = str(e)
    
    # 1. Try to find 'retry_delay' attribute (Common in SDK errors)
    try:
        if hasattr(e, 'retry_delay'):
            return int(e.retry_delay.seconds)
    except: pass

    # 2. Search for common patterns in the error message string
    # Pattern: "retry in 59.2s" or "seconds: 60"
    match = re.search(r"(?:retry in|seconds:)\s*([\d\.]+)", error_msg)
    if match:
        try:
            return int(float(match.group(1)))
        except: pass

    # 3. Last Resort: Check if there is any mention of 429/Quota and return a safe default
    if "429" in error_msg or "quota" in error_msg.lower():
        return 60 # Default to 1 minute if we can't find exact time
        
    return 0

async def sync_embeddings(doc_id: str, title: str, description: str, user_type: str, content: str):
    # 1. Embed the Document Description for the Router
    # Boost Notice Board keywords in embedding
    desc_text = f"{user_type} {title} {description} announcement updates important current" if user_type == "Notice Board" else f"{user_type} {title} {description}"
    desc_result = genai.embed_content(model=embedding_model, content=desc_text, task_type="retrieval_document")
    await db.documents.update_one(
        {"_id": ObjectId(doc_id)}, 
        {"$set": {"description_embedding": desc_result['embedding']}}
    )

    # 2. Embed the Chunks
    await db.embeddings.delete_many({"metadata.document_id": doc_id})
    if not content.strip(): return
    chunks = chunk_text(content)
    print(f"DEBUG: Syncing {len(chunks)} chunks for {user_type}")
    for i, chunk in enumerate(chunks):
        enriched_text = f"DOMAIN: {user_type}\nDESCRIPTION: {description}\nCONTENT: {chunk}"
        result = genai.embed_content(model=embedding_model, content=enriched_text, task_type="retrieval_document", title=title)
        await db.embeddings.insert_one({
            "text": chunk,
            "embedding": result['embedding'],
            "metadata": {
                "document_id": doc_id,
                "source": title,
                "description": description,
                "category": user_type,
                "timestamp": datetime.now(),
                "priority": 1 if user_type == "Notice Board" else 0
            }
        })

@app.get("/admin/documents")
async def list_documents():
    docs = await db.documents.find().to_list(length=100)
    for d in docs: d["_id"] = str(d["_id"])
    return docs

@app.post("/admin/documents")
async def upsert_document(
    title: str = Form(...),
    description: str = Form(...),
    user_type: str = Form(...),
    text_content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    try:
        # Clear Cache on Update
        global chat_cache
        chat_cache = {}
        
        existing = await db.documents.find_one({"user_type": user_type})
        
        # Determine new content
        new_content = None
        if file:
            filename = file.filename.lower()
            file_bytes = await file.read()
            
            if filename.endswith(".pdf"):
                new_content = extract_text_from_pdf(file_bytes)
            elif filename.endswith(".md") or filename.endswith(".txt"):
                new_content = file_bytes.decode("utf-8", errors="ignore")
            else:
                # Default fallback or error
                raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, MD, or TXT.")
        elif text_content is not None:
            new_content = text_content

        doc_data = {
            "title": title, 
            "description": description, 
            "user_type": user_type, 
            "updated_at": datetime.now()
        }
        
        # Only update content if new content was actually provided
        if new_content is not None:
            doc_data["content"] = new_content
        elif existing:
            # Keep old content if we are updating but no new file/text sent
            new_content = existing.get("content", "")

        if existing:
            await db.documents.update_one({"_id": existing["_id"]}, {"$set": doc_data})
            doc_id = str(existing["_id"])
        else:
            doc_data["created_at"] = datetime.now()
            # If it's a new doc and no content provided, use empty string
            if "content" not in doc_data: doc_data["content"] = ""
            result = await db.documents.insert_one(doc_data)
            doc_id = str(result.inserted_id)
            new_content = doc_data["content"]

        # Only sync embeddings if content changed or if we are forced to
        # For simplicity, we sync if new_content was provided or it's a new doc
        if new_content is not None or not existing:
            await sync_embeddings(doc_id, title, description, user_type, new_content or "")
            
        return {"message": f"Successfully updated {user_type}"}
    except Exception as e:
        print(f"UPSERT ERROR: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/admin/documents/{doc_id}")
async def delete_document(doc_id: str):
    # Clear Cache on Delete
    global chat_cache
    chat_cache = {}
    
    await db.documents.delete_one({"_id": ObjectId(doc_id)})
    await db.embeddings.delete_many({"metadata.document_id": doc_id})
    return {"message": "Deleted successfully."}

# Simple In-Memory Cache
chat_cache = {}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        search_query = request.message.strip().lower()
        history = request.history or []

        # 0. Handle Slash Commands
        if search_query.startswith("/"):
            if search_query == "/help":
                help_text = """
### 🤖 Zeno Command Guide
I'm here to help you navigate BSSE Fall 2025! Here are the commands you can use:

- `/help` - Show this guide
- `/drive` - Quick link to our Class Google Drive
- `/leave` - Apply for Leave (Leave Portal)
- `/links` - Open the SMIU Links Hub
- `/clear` - (Frontend) Clear your chat history

**How to use me:**
Just ask questions in English or Roman Urdu! For example: *"Jani, DLD ki assignment kab tak deni hai?"* or *"When is the next holiday?"*
                """
                return {"role": "assistant", "content": help_text}
            
            elif search_query == "/drive":
                return {"role": "assistant", "content": "📂 **Class Google Drive:** [Access Materials Here](https://drive.google.com/drive/folders/your_folder_id)\n\nYou can find all slides, assignments, and notes here."}
            
            elif search_query == "/leave":
                return {"role": "assistant", "content": "📝 **Leave Application Portal:** [Submit your leave here](https://easy-chat-api-one.vercel.app)\n\nPlease ensure you provide a valid reason for your leave request."}
            
            elif search_query == "/links":
                return {"role": "assistant", "content": "🔗 **SMIU Links Hub:** [Explore Links](https://linksmiu.netlify.app)\n\nOne-stop shop for all SMIU related websites."}

        # 0. Check Cache First (Only for fresh queries with no meaningful history)
        # We consider history of length 1 (just the assistant intro) as a fresh start
        if len(history) <= 1 and search_query in chat_cache:
            print(f"DEBUG: Serving from cache: {search_query}")
            return chat_cache[search_query]

        # 1. Embed Query
        try:
            query_embedding_result = genai.embed_content(model=embedding_model, content=search_query, task_type="retrieval_query")
            query_embedding = query_embedding_result['embedding']
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                return {"role": "assistant", "content": "Zeno isn't available currently, please try again later.", "retry_after": get_retry_seconds(e)}
            raise e
        
        # 2. MATCHING DATASET (The "Router")
        all_docs = await db.documents.find().to_list(length=100)
        best_doc = None
        highest_doc_score = 0
        
        for doc in all_docs:
            doc_embedding = doc.get("description_embedding")
            if doc_embedding:
                score = cosine_similarity(query_embedding, doc_embedding)
            else:
                desc_text = f"{doc['user_type']} {doc['title']} {doc['description']}"
                desc_res = genai.embed_content(model=embedding_model, content=desc_text, task_type="retrieval_document")
                score = cosine_similarity(query_embedding, desc_res['embedding'])
                await db.documents.update_one({"_id": doc["_id"]}, {"$set": {"description_embedding": desc_res['embedding']}})
                
            if score > highest_doc_score:
                highest_doc_score = score
                best_doc = doc

        # 3. RETRIEVAL
        relevant_chunks = []
        filter_query = {}
        if best_doc and highest_doc_score > 0.45:
            filter_query = {"metadata.document_id": str(best_doc["_id"])}

        try:
            # Construct pipeline cleanly
            vector_search = {
                "index": "vector_index", 
                "path": "embedding", 
                "queryVector": query_embedding, 
                "numCandidates": 100, 
                "limit": 8
            }
            if filter_query:
                vector_search["filter"] = filter_query
            
            pipeline = [{"$vectorSearch": vector_search}]
            cursor = db.embeddings.aggregate(pipeline)
            relevant_chunks = await cursor.to_list(length=8)
        except Exception as e:
            print(f"VECTOR SEARCH ERROR (Falling back to manual): {e}")
            query = {"metadata.document_id": str(best_doc["_id"])} if best_doc and highest_doc_score > 0.55 else {}
            all_embeddings = await db.embeddings.find(query).to_list(length=1000)
            scored = []
            for chunk in all_embeddings:
                chunk["score"] = cosine_similarity(query_embedding, chunk["embedding"])
                scored.append(chunk)
            scored.sort(key=lambda x: x["score"], reverse=True)
            relevant_chunks = [c for c in scored if c.get("score", 0) > 0.2][:10]

        if best_doc and len(relevant_chunks) < 3:
            doc_chunks = await db.embeddings.find({"metadata.document_id": str(best_doc["_id"])}).to_list(length=8)
            existing_texts = {c["text"] for c in relevant_chunks}
            for dc in doc_chunks:
                if dc["text"] not in existing_texts:
                    relevant_chunks.append(dc)

        if not relevant_chunks and not (best_doc and highest_doc_score > 0.5):
            return {"role": "assistant", "content": "Hmm, I couldn't find that in my records. Yaar, maybe try checking the [SMIU Links Hub](https://linksmiu.netlify.app)?"}

        # 4. Assembly
        context_str = ""
        sources = set()
        
        # Always inject Notice Board as high-priority context if it exists and has content
        notice_board = next((d for d in all_docs if d["user_type"] == "Notice Board"), None)
        if notice_board and notice_board.get('content', '').strip():
            context_str += f"### IMPORTANT ANNOUNCEMENTS (NOTICE BOARD):\n{notice_board.get('content', '')}\n\n---\n"
            sources.add("Notice Board")

        if best_doc and best_doc["user_type"] != "Notice Board":
            context_str += f"### DATASET: {best_doc['user_type']}\n### GUIDANCE: {best_doc['description']}\n\n"
            sources.add(best_doc['user_type'])

        for chunk in relevant_chunks:
            meta = chunk.get('metadata', {})
            cat = meta.get('category', 'General')
            sources.add(cat)
            context_str += f"[{cat}]: {chunk['text']}\n---\n"

        # Reconstruct Conversation History
        history_str = ""
        for msg in history:
            role = "Student" if msg["role"] == "user" else "Assistant"
            content = msg["content"].replace("Answer: ", "")
            history_str += f"{role}: {content}\n"

        system_instruction = f"""
        You are Zeno, the Class AI Assistant for BSSE Fall 2025 at SMIU. 
        Developed by Okasha Nadeem (CR).
        
        Your Goal: Be a friendly, helpful academic co-pilot.
        
        Communication Style:
        - **Language Adaptation**: Respond in the same language/style as the student. 
        - **English Queries**: If the student asks in proper English, your response MUST be in clear, professional English.
        - **Roman Urdu/Hinglish**: If the student uses Roman Urdu or mixed language, respond in a friendly bilingual mix (Hinglish).
        - **Tone**: Use friendly student slang like "Jani", "Yaar", "Scene kya hai" for casual or mixed queries.
        - **Conciseness**: Don't repeat your full introduction or developer credits after the first greeting.
        
        Rules:
        1. Identify yourself as Zeno if asked.
        2. Use the [CONTEXT] to provide direct answers based on class data.
        3. Always check the [CONVERSATION HISTORY] to understand the context.
        4. Links MUST be clickable: [Title](URL).
        5. If you don't know the answer, fallback to: [SMIU Links Hub](https://linksmiu.netlify.app).
        
        [CONTEXT]
        {context_str}
        """
        
        full_prompt = f"{system_instruction}\n\n[CONVERSATION HISTORY]\n{history_str}\nStudent: {request.message}\nAssistant:"

        # 5. Generate with Automatic Retry
        for attempt in range(2):
            try:
                response = chat_model.generate_content(full_prompt)
                
                # Check if the response was blocked by safety filters
                try:
                    clean_content = response.text.strip().replace('Answer: ', '').replace('Assistant: ', '')
                except ValueError:
                    # Handle blocked response
                    return {
                        "role": "assistant",
                        "content": "I'm sorry, but that request triggered my safety filters. Yaar, let's keep it academic! Try rephrasing your question.",
                        "source": "Safety Filter"
                    }

                result = {
                    "role": "assistant", 
                    "content": clean_content,
                    "source": ", ".join(list(sources)) if sources else None
                }
                
                # Only cache if it's a first-turn query to avoid context contamination
                if len(history) <= 1:
                    chat_cache[search_query] = result
                return result
            except Exception as e:
                if ("429" in str(e) or "quota" in str(e).lower()) and attempt == 0:
                    import asyncio
                    await asyncio.sleep(2)
                    continue
                raise e

    except Exception as e:
        print(f"FATAL ERROR: {traceback.format_exc()}")
        is_quota = "429" in str(e) or "quota" in str(e).lower()
        return {
            "role": "assistant",
            "content": "Zeno isn't available currently, please try again later." if is_quota else "Zeno encountered a slight hiccup, please try again in a bit!",
            "retry_after": get_retry_seconds(e) if is_quota else 0
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
