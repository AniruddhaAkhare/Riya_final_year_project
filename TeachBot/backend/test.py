import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

models = genai.list_models()
print("Available models:")
for m in models:
    print(m["name"], "-", m.get("description", ""))
