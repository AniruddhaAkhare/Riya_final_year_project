import os
import json
import re
import tempfile
import traceback
import fitz  # PyMuPDF
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, PermissionDenied
from paddleocr import PaddleOCR
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_jwt_extended import JWTManager
from auth import auth_bp
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_jwt_extended.exceptions import NoAuthorizationError
from database import get_db_connection, init_db
import json
from flask_jwt_extended import get_jwt_identity
from datetime import datetime

# ================== APP CONFIG ==================
app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "*"}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this"
jwt = JWTManager(app)


@jwt.unauthorized_loader
def custom_unauthorized_response(err_str):
    print("JWT Unauthorized:", err_str)
    return jsonify({"error": "JWT missing or invalid", "details": err_str}), 401

@jwt.invalid_token_loader
def custom_invalid_token_response(err_str):
    print("JWT Invalid:", err_str)
    return jsonify({"error": "JWT invalid", "details": err_str}), 422

@jwt.expired_token_loader
def custom_expired_token_response(jwt_header, jwt_payload):
    print("JWT Expired")
    return jsonify({"error": "JWT expired"}), 401

app.register_blueprint(auth_bp)


# ================== GEMINI CONFIG ==================
# os.environ["GEMINI_API_KEY"] = "AIzaSyDc8-ekj89YBcq3jopvbz2czQcBUioKIJM"
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.5-flash"


# ================== ASSIGNMENT GRADER SETUP ==================
ocr_model = PaddleOCR(use_textline_orientation=True, lang='en')

def convert_pdf_to_images(pdf_path):
    image_paths = []
    temp_dir = os.path.join(tempfile.gettempdir(), "assignment_images")
    os.makedirs(temp_dir, exist_ok=True)
    try:
        doc = fitz.open(pdf_path)
        for i, page in enumerate(doc):
            pix = page.get_pixmap(dpi=300)
            temp_image_path = os.path.join(temp_dir, f"page_{i}.png")
            pix.save(temp_image_path)
            image_paths.append(temp_image_path)
    except Exception as e:
        print(f"Error converting PDF to images: {e}")
    return image_paths

def cleanup_images(image_paths):
    for img in image_paths:
        try:
            os.remove(img)
        except Exception as e:
            print(f"Warning: could not delete {img}: {e}")

def extract_text_from_pdf(pdf_path):
    extracted_text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                page_text = page.get_text().strip()
                if page_text:
                    extracted_text += page_text + "\n"
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return ""

    if not extracted_text.strip():
        print("No digital text found, using OCR...")
        image_paths = convert_pdf_to_images(pdf_path)
        for img_path in image_paths:
            try:
                result = ocr_model.predict(img_path)
                for line in result[0]:
                    extracted_text += line[1][0] + " "
                extracted_text += "\n"
            except Exception as e:
                print(f"OCR error on {img_path}: {e}")
        cleanup_images(image_paths)

    return extracted_text.strip()


def calculate_text_similarity(text1, text2):
    try:
        docs = [text1, text2]
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(docs)
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(similarity * 100, 2)
    except Exception as e:
        print("Similarity calculation error:", e)
        return 0


def split_into_qa_pairs(text):
    if not text.strip():
        return [{"question": "Full Assignment", "answer": "No text extracted"}]

    pattern = re.compile(r"(?:Q\d+\.|Question\s*\d+|^\d+\.)", re.IGNORECASE | re.MULTILINE)
    parts = pattern.split(text)
    questions = pattern.findall(text)
    qa_pairs = []

    try:
        for i, q in enumerate(questions):
            question_text = q + " " + parts[i + 1].strip() if i + 1 < len(parts) else parts[i].strip()
            ans_split = re.split(r"(?:Answer:|Ans:)", question_text, flags=re.IGNORECASE)
            if len(ans_split) > 1:
                question = ans_split[0].strip()
                answer = ans_split[1].strip()
            else:
                question = question_text.strip()
                answer = "Not clearly found."
            qa_pairs.append({"question": question, "answer": answer})
    except Exception as e:
        print(f"Error splitting into Q&A: {e}")
        qa_pairs = [{"question": "Full Assignment", "answer": text}]

    if not qa_pairs:
        qa_pairs.append({"question": "Full Assignment", "answer": text})

    return qa_pairs

def assess_with_gemini_text(subject, qa_pairs):
    model = genai.GenerativeModel(MODEL_NAME)
    qa_block = ""
    for i, pair in enumerate(qa_pairs, 1):
        qa_block += f"""
Question {i}: {pair['question']}
Answer {i}: {pair['answer']}
"""

    prompt = f"""
You are an expert university assignment evaluator in {subject}.

Evaluate EACH question separately.

For every question, return the following fields exactly:
Accuracy:
Completeness:
Clarity:
Grammar:
Depth:
Suggested Answer:
Improvement:
Score (0-10):

Respond strictly in this format:

Q1:
Accuracy: ...
Completeness: ...
Clarity: ...
Grammar: ...
Depth: ...
Suggested Answer: ...
Improvement: ...
Score: ...

Q2:
...

DO NOT add extra explanations.

QUESTIONS AND ANSWERS:
{qa_block}
"""
    try:
        response = model.generate_content(prompt)
        assessment_text = response.text.strip()
    except Exception as e:
        print("Gemini API error:", e)
        traceback.print_exc()
        return {"questions": [], "overall_score": 0, "result": "Fail"}

    results = []
    total_score = 0
    question_blocks = re.split(r"\nQ\d+:\n", "\n" + assessment_text)[1:]

    for idx, block in enumerate(question_blocks):
        evaluation = {}
        fields = ["accuracy", "completeness", "clarity", "grammar", "depth", "suggested answer", "improvement", "score"]
        for f in fields:
            m = re.search(f"{f}\\s*:\\s*(.+)", block, re.IGNORECASE)
            evaluation[f.replace(" ", "_")] = m.group(1).strip() if m else "N/A"
        try:
            score = float(evaluation.get("score", 0))
            score = max(0, min(10, score))
        except:
            score = 0
        total_score += score
        results.append({
            "question": qa_pairs[idx]["question"],
            "answer": qa_pairs[idx]["answer"],
            "evaluation": evaluation,
            "score": score
        })

    overall_score = round((total_score / (len(results) * 10)) * 100, 2) if results else 0
    result_status = "Pass" if overall_score >= 50 else "Fail"

    return {"questions": results, "overall_score": overall_score, "result": result_status}

# ================== SAFE JSON HANDLER FOR RESUME ==================
def safe_json_from_ai(text):
    try:
        text = text.strip()

        # Remove markdown code fences if present
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        # First attempt: try parsing directly (BEST CASE)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass  # fall back to cleanup

        # Extract JSON object
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return None

        json_text = match.group(0)

        # Minimal safe cleanup (DO NOT touch quotes)
        json_text = re.sub(r",\s*}", "}", json_text)
        json_text = re.sub(r",\s*]", "]", json_text)

        return json.loads(json_text)

    except Exception as e:
        print("❌ JSON PARSE FAILED")
        print("🔴 RAW AI OUTPUT:\n", text)
        print("ERROR:", e)
        return None



# ================== HELPER FOR JSON EXTRACTION ==================
def extract_json(text):
    match = re.search(r"\{[\s\S]*\}", text)
    return match.group(0) if match else None


@app.before_request
def log_request_info():
    print("=== Incoming Request ===")
    print("Method:", request.method)
    print("Path:", request.path)
    print("Headers:", dict(request.headers))
    print("Data:", request.get_data())  # raw body


# ================== ROUTES ==================
# ----- ASSIGNMENT GRADER -----
@app.route("/evaluate", methods=["POST", "OPTIONS"])
@jwt_required()
def evaluate():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    tmp1 = tmp2 = None

    try:
        if "file1" not in request.files or "file2" not in request.files or "subject" not in request.form:
            return jsonify({"error": "Two assignment files and subject are required"}), 400

        subject = request.form["subject"]
        file1 = request.files["file1"]
        file2 = request.files["file2"]

        # Save PDFs temporarily
        tmp1 = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        tmp2 = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        file1.save(tmp1.name)
        file2.save(tmp2.name)

        # Extract text
        text1 = extract_text_from_pdf(tmp1.name)
        text2 = extract_text_from_pdf(tmp2.name)

        # Split Q&A
        qa1 = split_into_qa_pairs(text1)
        qa2 = split_into_qa_pairs(text2)

        # Evaluate
        def run_gemini(qa_pairs):
            try:
                return assess_with_gemini_text(subject, qa_pairs)
            except Exception as e:
                if "Quota exceeded" in str(e) or "429" in str(e):
                    time.sleep(60)
                    return assess_with_gemini_text(subject, qa_pairs)
                else:
                    raise e

        result1 = run_gemini(qa1)
        result2 = run_gemini(qa2)

        # Calculate similarity
        assignment_similarity = calculate_text_similarity(text1, text2)
        plagiarism_risk = (
            "High" if assignment_similarity > 70
            else "Medium" if assignment_similarity > 40
            else "Low"
        )

        # ============================
        # 🔥 SAVE TO DATABASE (assignment_evaluations)
        # ============================
        user_id = get_jwt_identity()
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO assignment_evaluations (
                user_id,
                subject,
                assignment_1,
                assignment_2,
                similarity_percent,
                plagiarism_risk
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            subject,
            json.dumps(result1),  # Full detailed JSON from model
            json.dumps(result2),
            assignment_similarity,
            plagiarism_risk
        ))

        conn.commit()
        conn.close()
        # ============================

        return jsonify({
            "assignment_1": result1,
            "assignment_2": result2,
            "similarity_analysis": {
                "assignment_to_assignment_similarity_percent": assignment_similarity,
                "plagiarism_risk": plagiarism_risk,
                "interpretation": "Similarity based on textual overlap using TF-IDF analysis"
            }
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        # Cleanup temporary PDF files
        try:
            if tmp1:
                tmp1.close()
                os.remove(tmp1.name)
            if tmp2:
                tmp2.close()
                os.remove(tmp2.name)
        except Exception as e:
            print("Cleanup error:", e)


# ----- QUIZ GENERATION & ASSESSMENT -----
@app.route("/generate-quiz", methods=["POST", "OPTIONS"])
def generate_quiz():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json or {}
        subject = data.get("subject")
        num_questions = int(data.get("num_questions", 5))
        difficulty = data.get("difficulty", "medium")

        if not subject:
            return jsonify({"error": "Subject is required"}), 400

        model = genai.GenerativeModel(MODEL_NAME)

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

        # ✅ FIX: remove markdown fences if present
        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        try:
            quiz = json.loads(raw_text)
        except json.JSONDecodeError:
            print("❌ Invalid JSON from Gemini:\n", raw_text)
            return jsonify({"error": "Invalid JSON from Gemini"}), 500

        return jsonify({"quiz": quiz}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/assess-quiz", methods=["POST", "OPTIONS"])
@jwt_required()
def assess_quiz():
    if request.method == "OPTIONS":
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

        model = genai.GenerativeModel(MODEL_NAME)

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
    {{"question": "...", "student_answer": "...", "correct_answer": "...", "correct": true, "explanation": "...", "score": 1}}
  ],
  "total_score": 5,
  "percentage": 80.0,
  "result": "Pass"
}}
"""

        response = model.generate_content(assessment_prompt)
        assessment = safe_json_from_ai(response.text.strip())

        if not assessment:
            return jsonify({"error": "Invalid JSON from Gemini"}), 500

        question_wise = assessment.get("questions", [])
        total_score = assessment.get("total_score", 0)
        percentage = assessment.get("percentage", 0)
        result_status = assessment.get("result", "Fail")

        # ===========================
        # 🔥 SAVE TO SQLITE
        # ===========================
        user_id = get_jwt_identity()
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO quiz_attempts (
                user_id,
                subject,
                quiz_json,
                student_answers,
                question_wise,
                total_score,
                percentage,
                result
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            subject,
            json.dumps(quiz),               # full quiz JSON
            json.dumps(student_answers),    # student answers JSON
            json.dumps(question_wise),      # question-wise evaluation JSON
            total_score,
            percentage,
            result_status
        ))

        conn.commit()
        conn.close()
        # ===========================

        return jsonify({
            "total_score": total_score,
            "percentage": percentage,
            "result": result_status,
            "question_wise": question_wise
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
  
# ----- skill gap--------#
@app.route("/analyze", methods=["POST", "OPTIONS"])
@jwt_required()
def analyze():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    model = genai.GenerativeModel(MODEL_NAME)

    try:
        data = request.get_json() or {}

        # 🔐 Get user from JWT (SECURE)
        user_id = get_jwt_identity()

        skills = data.get("skills", "")
        career_goal = data.get("goal", "")
        education_level = data.get("education_level", "")
        experience_years = data.get("experience_years", "")
        current_job_title = data.get("current_job_title", "")
        preferred_learning_style = data.get("preferred_learning_style", "")
        available_hours_per_week = data.get("available_hours_per_week", "")
        location = data.get("location", "")
        interests = data.get("interests", "")
        certifications = data.get("certifications", "")

        if not skills or not career_goal:
            return jsonify({
                "error": "Fields 'skills' and 'goal' are required."
            }), 400

        prompt = f"""
A user has the following background and is seeking career guidance. Address the user as 'you'.

Career Goal: {career_goal}
Skills: {skills}
Education Level: {education_level}
Experience: {experience_years} years
Current Job Title: {current_job_title}
Interests: {interests}
Certifications: {certifications}
Preferred Learning Style: {preferred_learning_style}
Available Hours Per Week: {available_hours_per_week}
Location: {location}

Tasks:
1. Analyze their current skillset.
2. Identify key skill gaps related to their goal.
3. Suggest improvement roadmap.
"""

        response = model.generate_content(prompt)

        if not response or not response.text:
            return jsonify({"error": "Empty response from AI model"}), 500

        analysis_text = response.text.strip()

        # ==========================
        # 🔥 SAVE TO SQLITE DATABASE
        # ==========================
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1️⃣ Save Career Analysis
        cursor.execute("""
            INSERT INTO career_analysis (
                user_id,
                career_goal,
                skills,
                education_level,
                experience_years,
                current_job_title,
                interests,
                certifications,
                analysis
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            career_goal,
            skills,
            education_level,
            experience_years,
            current_job_title,
            interests,
            certifications,
            analysis_text
        ))

        # 2️⃣ Save Skill Gap Analysis
        cursor.execute("""
            INSERT INTO skill_gap_analysis (
                user_id,
                preferred_role,
                skills_input,
                missing_skills,
                recommended_skills,
                learning_suggestions
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            career_goal,              # preferred_role
            skills,                   # skills_input
            json.dumps([]),           # missing_skills placeholder
            json.dumps([]),           # recommended_skills placeholder
            analysis_text             # AI suggestion
        ))

        conn.commit()
        conn.close()
        # ==========================

        return jsonify({
            "status": "success",
            "analysis": analysis_text
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# ----- JOB PREDICTION -----
@app.route("/predict-jobs", methods=["POST", "OPTIONS"])
def predict_jobs():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight OK"}), 200
    try:
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
        json_text = extract_json(raw_text)
        if not json_text:
            return jsonify({"error": "Invalid response format from AI"}), 500
        parsed = json.loads(json_text)
        if "predictions" not in parsed or not isinstance(parsed["predictions"], list):
            return jsonify({"error": "AI response missing predictions"}), 500
        return jsonify(parsed), 200
    except ResourceExhausted:
        return jsonify({"error": "Gemini API quota exceeded"}), 429
    except PermissionDenied:
        return jsonify({"error": "Gemini API key invalid or disabled."}), 403
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse Gemini response."}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ----- AI TUTOR -----
@app.route("/ai-tutor", methods=["POST"])
def ai_tutor():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400
        message = data.get("message")
        mode = data.get("mode")
        history = data.get("history", [])
        if not message or not mode:
            return jsonify({"error": "Missing message or mode"}), 400
        model = genai.GenerativeModel(MODEL_NAME)
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
    except ResourceExhausted:
        return jsonify({"error": "Gemini quota exceeded"}), 429
    except PermissionDenied:
        return jsonify({"error": "Gemini API not enabled"}), 403
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ----- RESUME BUILDER -----
@app.route("/build-resume", methods=["POST", "OPTIONS"])
@jwt_required()
def build_resume():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        # ==================== GET JSON DATA ====================
        data = request.get_json(silent=True)
        print("=== /build-resume Request Received ===")
        print("Full request headers:", dict(request.headers))
        print("JSON body received:", data)

        if not data:
            print("Error: No JSON body received")
            return jsonify({"error": "Invalid JSON body"}), 400

        user_id = get_jwt_identity()
        if not user_id:
            print("Error: Invalid user_id from JWT")
            return jsonify({"error": "Invalid user"}), 401

        # ==================== AI RESUME GENERATION ====================
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
        print("AI response:", response.text)

        result = safe_json_from_ai(response.text)
        print("Parsed AI JSON result:", result)

        if not result or not isinstance(result, dict):
            print("Error: AI resume returned invalid JSON")
            return jsonify({"error": "Invalid AI resume response"}), 500

        # ==================== SAFE DB INSERT ====================
        resume_title = str(data.get("title", "My Resume"))
        resume_json = json.dumps(result)

        print("Saving resume to DB")
        print("user_id:", user_id)
        print("resume_title:", resume_title)
        print("resume_json:", resume_json)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO resumes (user_id, resume_title, resume_json)
            VALUES (?, ?, ?)
            """,
            (user_id, resume_title, resume_json)
        )
        resume_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "resume_id": resume_id,
            "resume": result
        }), 200

    except Exception as e:
        # ==================== FULL ERROR LOG ====================
        import traceback
        print("=== Exception occurred in /build-resume ===")
        traceback.print_exc()
        return jsonify({
            "error": "Resume generation failed",
            "details": str(e)
        }), 500




@app.route("/analyze-ats", methods=["POST", "OPTIONS"])
@jwt_required()
def analyze_ats():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json(silent=True)
        resume = data.get("resume")
        role = data.get("preferredRole")
        if not resume or not role:
            return jsonify({"error": "Resume and preferredRole required"}), 400

        user_id = get_jwt_identity()
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

        conn = get_db_connection()
        cursor = conn.cursor()

        # Link to latest resume of this user
        cursor.execute("""
            SELECT id FROM resumes
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (user_id,))
        latest_resume = cursor.fetchone()
        resume_id = latest_resume["id"] if latest_resume else None

        cursor.execute("""
            INSERT INTO ats_analysis (
                user_id,
                resume_id,
                preferred_role,
                ats_score,
                strengths,
                weaknesses
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            resume_id,
            role,
            result.get("ats_score", 0),
            json.dumps(result.get("strengths", [])),
            json.dumps(result.get("weaknesses", []))
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "ats_analysis": result,
            "linked_resume_id": resume_id
        }), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "ATS analysis failed"}), 500

@app.route("/skill-gap", methods=["POST", "OPTIONS"])
@jwt_required()
def skill_gap():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json(silent=True)
        skills = data.get("skills")
        role = data.get("preferredRole")
        if not skills or not role:
            return jsonify({"error": "Skills and preferredRole required"}), 400

        user_id = get_jwt_identity()
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
            return jsonify({"error": "Malformed AI response", "raw": response.text}), 500

        conn = get_db_connection()
        cursor = conn.cursor()

        # Link to latest resume
        cursor.execute("""
            SELECT id FROM resumes
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (user_id,))
        latest_resume = cursor.fetchone()
        resume_id = latest_resume["id"] if latest_resume else None

        cursor.execute("""
            INSERT INTO skill_gap_analysis (
                user_id,
                resume_id,
                preferred_role,
                skills_input,
                missing_skills,
                recommended_skills,
                learning_suggestions
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            resume_id,
            role,
            skills,
            json.dumps(result.get("missing_skills", [])),
            json.dumps(result.get("recommended_skills", [])),
            json.dumps(result.get("learning_suggestions", []))
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "skill_gap_analysis": result,
            "linked_resume_id": resume_id
        }), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Skill gap analysis failed"}), 500

## IKIGAI ---------------------------##
@app.route("/api/ikigai/analyze", methods=["POST", "OPTIONS"])
@jwt_required()
def analyze_ikigai():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json or {}

        love = [v.strip() for k, v in data.items() if k.startswith("love") and v.strip()]
        good = [v.strip() for k, v in data.items() if k.startswith("good") and v.strip()]
        world = [v.strip() for k, v in data.items() if k.startswith("world") and v.strip()]
        paid = [v.strip() for k, v in data.items() if k.startswith("paid") and v.strip()]

        if not (love or good or world or paid):
            return jsonify({"error": "At least one Ikigai input required"}), 400

        prompt = f"""
You are an expert career counselor and Ikigai practitioner.

Using the Ikigai philosophy, analyze the following user reflections
and produce a PROFESSIONAL, INSIGHTFUL, and PURPOSE-DRIVEN response.

Maintain a calm, reflective tone.
Avoid generic advice.
Ground insights strictly in the user's inputs.

USER INPUTS:

WHAT THEY LOVE:
{love}

WHAT THEY ARE GOOD AT:
{good}

WHAT THE WORLD NEEDS:
{world}

WHAT THEY CAN BE PAID FOR:
{paid}

OUTPUT FORMAT (STRICT JSON):

{{
  "passion": {{
    "title": "Passion (What You Love + What You're Good At)",
    "summary": "2–3 professional sentences"
  }},
  "profession": {{
    "title": "Profession (What You're Good At + What You Can Be Paid For)",
    "summary": "2–3 professional sentences"
  }},
  "vocation": {{
    "title": "Vocation (What The World Needs + What You Can Be Paid For)",
    "summary": "2–3 professional sentences"
  }},
  "mission": {{
    "title": "Mission (What You Love + What The World Needs)",
    "summary": "2–3 professional sentences"
  }}
}}
Return ONLY valid JSON. No markdown. No extra text.
"""
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        result = safe_json_from_ai(response.text.strip())

        if not result:
            return jsonify({"error": "Invalid JSON from AI", "raw": response.text.strip()}), 500

        user_id = get_jwt_identity()

        # 🔥 SAVE IKIGAI TO SQLITE
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO ikigai_analysis (
                user_id,
                love_inputs,
                good_at_inputs,
                world_needs_inputs,
                paid_for_inputs,
                passion_summary,
                profession_summary,
                vocation_summary,
                mission_summary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            json.dumps(love),
            json.dumps(good),
            json.dumps(world),
            json.dumps(paid),
            result.get("passion", {}).get("summary", ""),
            result.get("profession", {}).get("summary", ""),
            result.get("vocation", {}).get("summary", ""),
            result.get("mission", {}).get("summary", "")
        ))

        conn.commit()
        conn.close()

        return jsonify({"status": "success", "ikigai_analysis": result}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to generate Ikigai analysis", "details": str(e)}), 500


@app.route("/overview", methods=["GET"])
@jwt_required()
def overview():
    try:
        user_id = get_jwt_identity()
        conn = get_db_connection()
        cursor = conn.cursor()

        # -------- RESUME --------
        cursor.execute("""
            SELECT id, resume_title, target_role, resume_json, created_at
            FROM resumes
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        resumes = [dict(r) for r in cursor.fetchall()]

        # -------- ATS ANALYSIS --------
        cursor.execute("""
            SELECT id, resume_id, preferred_role, ats_score, strengths, weaknesses, created_at
            FROM ats_analysis
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        ats = [dict(a) for a in cursor.fetchall()]

        # -------- SKILL GAP --------
        cursor.execute("""
            SELECT id, resume_id, preferred_role, skills_input, missing_skills, recommended_skills, learning_suggestions, created_at
            FROM skill_gap_analysis
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        skill_gaps = [dict(s) for s in cursor.fetchall()]

        # -------- IKIGAI --------
        cursor.execute("""
            SELECT id, love_inputs, good_at_inputs, world_needs_inputs, paid_for_inputs,
                   passion_summary, profession_summary, vocation_summary, mission_summary, created_at
            FROM ikigai_analysis
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        ikigai = [dict(k) for k in cursor.fetchall()]

        # -------- CAREER ANALYSIS --------
        cursor.execute("""
            SELECT id, career_goal, skills, education_level, experience_years, current_job_title,
                   interests, certifications, analysis, created_at
            FROM career_analysis
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        career_analysis = [dict(c) for c in cursor.fetchall()]

        # -------- ASSIGNMENT EVALUATIONS --------
        cursor.execute("""
            SELECT id, subject, assignment_1, assignment_2, similarity_percent, plagiarism_risk, created_at
            FROM assignment_evaluations
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        assignments = [dict(a) for a in cursor.fetchall()]

        # -------- QUIZ ATTEMPTS --------
        cursor.execute("""
            SELECT id, subject, quiz_json, student_answers, question_wise, total_score, percentage, result, created_at
            FROM quiz_attempts
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        quizzes = [dict(q) for q in cursor.fetchall()]

        conn.close()

        return jsonify({
            "status": "success",
            "overview": {
                "resumes": resumes,
                "ats_analysis": ats,
                "skill_gap_analysis": skill_gaps,
                "ikigai_analysis": ikigai,
                "career_analysis": career_analysis,
                "assignment_evaluations": assignments,
                "quiz_attempts": quizzes
            }
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500
    
# ================== TEACHER DASHBOARD ==================
@app.route("/teacher/students", methods=["GET"])
@jwt_required()
def get_students_for_teacher():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                id,
                name,
                email,
                mobile,
                college,
                branch,
                year,
                semester
            FROM users
            WHERE role = 'student'
            ORDER BY name ASC
        """)

        rows = cursor.fetchall()
        conn.close()

        students = []

        for r in rows:
            students.append({
                "id": r["id"],
                "name": r["name"],
                "email": r["email"],
                "mobile": r["mobile"],
                "college": r["college"],
                "branch": r["branch"],
                "year": r["year"],
                "semester": r["semester"]
            })

        return jsonify({
            "students": students
        }), 200

    except Exception as e:
        print("Error fetching students:", e)
        return jsonify({"error": "Failed to fetch students"}), 500
    

init_db()


# ================== RUN APP ================== 
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
