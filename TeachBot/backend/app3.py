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

# ✅ Enable CORS for React
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ================== GEMINI CONFIG ==================
# os.environ["GEMINI_API_KEY"] = "AIzaSyAcxspUd2yA4TNLPYeqRP7EBKMyYDv5InE"
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.5-flash"

# ================== HELPERS ==================
def extract_json(text):
    """
    Safely extract JSON object from Gemini response
    """
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return None
    return match.group(0)

# ================== ROUTES ==================
@app.route("/predict-jobs", methods=["POST", "OPTIONS"])
def predict_jobs():

    # ✅ CORS preflight handler (VERY IMPORTANT)
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight OK"}), 200

    try:
        # ✅ Ensure JSON request
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Invalid or missing JSON body"}), 400

        education_level = data.get("educationLevel")
        branch = data.get("branch")
        preferred_role = data.get("preferredRole")
        location = data.get("location")
        job_type = data.get("jobType")
        skills = data.get("skills", "")

        if not all([education_level, branch, preferred_role, location, job_type]):
            return jsonify({"error": "Missing required fields"}), 400

        model = genai.GenerativeModel(MODEL_NAME)

        prompt = f"""
You are an expert career counselor for engineering students.

Candidate profile:
- Education Level: {education_level}
- Branch: {branch}
- Preferred Role: {preferred_role}
- Location: {location}
- Job Type: {job_type}
- Skills: {skills}

Generate 10–12 realistic job predictions.

STRICT RULES:
- Output ONLY valid JSON
- No markdown
- No explanation
- No text outside JSON

FORMAT:
{{
  "predictions": [
    {{
      "company": "Company Name",
      "role": "Job Role",
      "location": "{location}",
      "job_type": "{job_type}",
      "salary": "₹X - ₹Y LPA",
      "experience": "0-2 years",
      "skills": ["Skill1", "Skill2", "Skill3"]
    }}
  ]
}}
"""

        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        print("\n========= RAW GEMINI RESPONSE =========")
        print(raw_text)
        print("======================================\n")

        json_text = extract_json(raw_text)
        if not json_text:
            return jsonify({"error": "Invalid response format from AI"}), 500

        parsed = json.loads(json_text)

        # ✅ SAFETY: Ensure predictions array always exists
        if "predictions" not in parsed or not isinstance(parsed["predictions"], list):
            return jsonify({"error": "AI response missing predictions"}), 500

        return jsonify(parsed), 200

    # ================== ERROR HANDLING ==================
    except ResourceExhausted:
        return jsonify({
            "error": "Gemini API quota exceeded. Please wait and retry."
        }), 429

    except PermissionDenied:
        return jsonify({
            "error": "Gemini API key invalid or disabled."
        }), 403

    except json.JSONDecodeError:
        return jsonify({
            "error": "Failed to parse Gemini response."
        }), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ================== RUN ==================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
