import os
import json
import re
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, PermissionDenied

# ================== APP CONFIG ==================
app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "*"}}
)

# ================== GEMINI CONFIG ==================
# ⚠️ Move to .env in production
# os.environ["GEMINI_API_KEY"] = "AIzaSyAcxspUd2yA4TNLPYeqRP7EBKMyYDv5InE"
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.5-flash"

# ================== SAFE JSON HANDLER ==================
def safe_json_from_ai(text):
    try:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return None

        json_text = match.group(0)

        # Fix common Gemini issues
        json_text = json_text.replace("'", '"')
        json_text = re.sub(r",\s*}", "}", json_text)
        json_text = re.sub(r",\s*]", "]", json_text)

        return json.loads(json_text)

    except Exception as e:
        print("❌ JSON PARSE FAILED")
        print("🔴 RAW AI OUTPUT:\n", text)
        print("ERROR:", e)
        return None

# =====================================================
# =============== RESUME BUILDER ======================
# =====================================================
@app.route("/build-resume", methods=["POST", "OPTIONS"])
def build_resume():

    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Invalid JSON body"}), 400

        model = genai.GenerativeModel(MODEL_NAME)

        prompt = f"""
You are a professional resume writer.

Candidate Details:
{json.dumps(data, indent=2)}

STRICT RULES:
- Respond ONLY in valid JSON
- No markdown
- No explanation

JSON FORMAT:
{{
  "summary": "",
  "skills": [],
  "experience": [],
  "projects": [],
  "education": {{
    "degree": "",
    "institution": ""
  }}
}}
"""

        response = model.generate_content(prompt)
        result = safe_json_from_ai(response.text)

        if not result:
            return jsonify({"error": "Invalid AI resume response"}), 500

        return jsonify(result), 200

    except ResourceExhausted:
        return jsonify({"error": "Gemini quota exceeded"}), 429
    except PermissionDenied:
        return jsonify({"error": "Gemini permission denied"}), 403
    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Resume generation failed"}), 500

# =====================================================
# =============== ATS SCORE ANALYZER ==================
# =====================================================
@app.route("/analyze-ats", methods=["POST", "OPTIONS"])
def analyze_ats():

    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json(silent=True)
        resume = data.get("resume")
        role = data.get("preferredRole")

        model = genai.GenerativeModel(MODEL_NAME)

        prompt = f"""
Analyze ATS compatibility for role: {role}

Resume:
{json.dumps(resume, indent=2)}

Return ONLY JSON:
{{
  "ats_score": 0,
  "strengths": [],
  "weaknesses": []
}}
"""

        response = model.generate_content(prompt)
        result = safe_json_from_ai(response.text)

        if not result:
            return jsonify({"error": "Invalid ATS response"}), 500

        return jsonify(result), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "ATS analysis failed"}), 500

# =====================================================
# =============== SKILL GAP ANALYZER ==================
# =====================================================
@app.route("/skill-gap", methods=["POST", "OPTIONS"])
def skill_gap():

    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json(silent=True)
        skills = data.get("skills")
        role = data.get("preferredRole")

        model = genai.GenerativeModel(MODEL_NAME)

        prompt = f"""
Compare candidate skills with role: {role}

Candidate Skills:
{skills}

Respond ONLY in JSON:
{{
  "missing_skills": [],
  "recommended_skills": [],
  "learning_suggestions": []
}}
"""

        response = model.generate_content(prompt)
        result = safe_json_from_ai(response.text)

        if not result:
            return jsonify({
                "error": "Malformed AI response",
                "raw": response.text
            }), 500

        return jsonify(result), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Skill gap analysis failed"}), 500

# ================== RUN ==================
if __name__ == "__main__":
    app.run(debug=True, port=5000)
