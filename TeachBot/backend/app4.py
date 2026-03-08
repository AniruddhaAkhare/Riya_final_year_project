import os
import json
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, PermissionDenied

# ================== APP CONFIG ==================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ================== GEMINI CONFIG ==================
# os.environ["GEMINI_API_KEY"] = "AIzaSyAcxspUd2yA4TNLPYeqRP7EBKMyYDv5InE"
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.5-flash"

# ================== ROUTE ==================
@app.route("/ai-tutor", methods=["POST"])
def ai_tutor():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        message = data.get("message")
        mode = data.get("mode")  # ANSWER or QUESTION
        history = data.get("history", [])

        if not message or not mode:
            return jsonify({"error": "Missing message or mode"}), 400

        model = genai.GenerativeModel(MODEL_NAME)

        # ========== PROMPT ENGINE ==========
        if mode == "ANSWER":
            system_prompt = f"""
You are an AI tutor.

Answer the student's question clearly and concisely.
Explain in simple language.
Avoid unnecessary verbosity.

Student question:
{message}
"""
        else:
            system_prompt = f"""
You are an AI tutor using the Socratic method.

RULES:
- DO NOT give direct answers
- Ask only ONE guiding question at a time
- Help the student reason step by step
- Encourage thinking
- When the student reaches the answer, summarize briefly

Conversation so far:
{history}

Student's question or response:
{message}
"""

        response = model.generate_content(system_prompt)
        reply = response.text.strip()

        return jsonify({"reply": reply}), 200

    # ========== ERROR HANDLING ==========
    except ResourceExhausted:
        return jsonify({"error": "Gemini quota exceeded"}), 429

    except PermissionDenied:
        return jsonify({"error": "Gemini API not enabled"}), 403

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ================== RUN ==================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
