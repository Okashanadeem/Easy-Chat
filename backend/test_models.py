import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

embedding_model = "models/gemini-embedding-001"
chat_model_name = "gemini-flash-latest"

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
    model = genai.GenerativeModel(chat_model_name)
    response = model.generate_content("Say 'System Online'", generation_config={"max_output_tokens": 10})
    print(f"✅ SUCCESS: AI Response: '{response.text.strip()}'")
except Exception as e:
    print(f"❌ FAILED: Generation - {str(e)}")

print("\n--- Test Complete ---")
