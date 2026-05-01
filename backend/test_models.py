import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in environment!")
else:
    print(f"✅ Key loaded: {api_key[:5]}...{api_key[-5:]}")

genai.configure(api_key=api_key)

embedding_model = "models/gemini-embedding-001"
chat_model_name = "gemini-flash-latest"

from google.generativeai.types import HarmCategory, HarmBlockThreshold
safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

print(f"--- Testing RAG Pipeline Models ---")

# 1. Test Embedding
try:
    print(f"Testing Embedding ({embedding_model})...")
    res = genai.embed_content(model=embedding_model, content="Hello World", task_type="retrieval_query")
    print(f"✅ SUCCESS: Embedding generated (Length: {len(res['embedding'])})")
except Exception as e:
    print(f"❌ FAILED: Embedding - {str(e)}")

# 2. Test Generation
try:
    print(f"\nTesting Generation ({chat_model_name})...")
    model = genai.GenerativeModel(chat_model_name, safety_settings=safety_settings)
    response = model.generate_content("Hello")
    print(f"DEBUG: Full Response: {response}")
    print(f"✅ SUCCESS: AI Response: '{response.text.strip()}'")
except Exception as e:
    print(f"❌ FAILED: Generation - {str(e)}")

print("\n--- Test Complete ---")
