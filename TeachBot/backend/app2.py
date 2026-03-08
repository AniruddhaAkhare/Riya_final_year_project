import os
import json
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# ================== CONFIG ==================
app = Flask(__name__)

# ✅ Proper global CORS (IMPORTANT)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

# Set your Gemini API Key
# os.environ["GEMINI_API_KEY"] = "AIzaSyAcxspUd2yA4TNLPYeqRP7EBKMyYDv5InE"
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ================== ROUTES ==================

# ---------- GENERATE QUIZ ----------
@app.route("/generate-quiz", methods=["POST", "OPTIONS"])
def generate_quiz():
    if request.method == "OPTIONS":
        # ✅ Preflight response
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json or {}
        subject = data.get("subject")
        num_questions = int(data.get("num_questions", 5))
        difficulty = data.get("difficulty", "medium")

        if not subject:
            return jsonify({"error": "Subject is required"}), 400

        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""
Generate a {num_questions}-question multiple-choice quiz for engineering students on {subject}.
Difficulty level: {difficulty}.

STRICT RULES:
- Each question must have EXACTLY 4 options
- Label options as A, B, C, D
- Provide the correct answer letter
- Output ONLY valid JSON (no markdown, no explanation)

JSON FORMAT:
[
  {{
    "question": "Question text",
    "options": {{
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    }},
    "answer": "A"
  }}
]
"""

        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        if not raw_text:
            return jsonify({"error": "Empty response from Gemini"}), 500

        try:
            quiz = json.loads(raw_text)
        except json.JSONDecodeError:
            print("❌ Invalid JSON from Gemini:\n", raw_text)
            return jsonify({"error": "Invalid JSON from Gemini"}), 500

        return jsonify({"quiz": quiz}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ---------- ASSESS QUIZ ----------
@app.route("/assess-quiz", methods=["POST", "OPTIONS"])
def assess_quiz():
    if request.method == "OPTIONS":
        # ✅ Preflight response
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json or {}

        subject = data.get("subject")
        quiz = data.get("quiz")
        student_answers = data.get("student_answers")

        if not subject or not quiz or not student_answers:
            return jsonify({"error": "Missing subject, quiz, or student_answers"}), 400

        if len(quiz) != len(student_answers):
            return jsonify({"error": "Answer count mismatch"}), 400

        model = genai.GenerativeModel("gemini-2.5-flash")

        assessment_prompt = f"""
You are an expert university examiner in {subject}.

Evaluate the quiz answers.

Quiz:
{json.dumps(quiz)}

Student Answers:
{json.dumps(student_answers)}

STRICT OUTPUT JSON ONLY:
{{
  "questions": [
    {{
      "question": "...",
      "student_answer": "...",
      "correct_answer": "...",
      "correct": true,
      "explanation": "...",
      "score": 1
    }}
  ],
  "total_score": 5,
  "percentage": 80.0,
  "result": "Pass"
}}
"""

        response = model.generate_content(assessment_prompt)
        raw_text = response.text.strip()

        if not raw_text:
            return jsonify({"error": "Empty response from Gemini"}), 500

        try:
            assessment = json.loads(raw_text)
        except json.JSONDecodeError:
            print("❌ Invalid JSON from Gemini:\n", raw_text)
            return jsonify({"error": "Invalid JSON from Gemini"}), 500

        return jsonify(assessment), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ================== RUN APP ==================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
