import os
import tempfile
import fitz  # PyMuPDF
from paddleocr import PaddleOCR
from flask import Flask, request, jsonify
import google.generativeai as genai
import re
import traceback
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Set your Gemini API Key
# os.environ["GEMINI_API_KEY"] = "AIzaSyAcxspUd2yA4TNLPYeqRP7EBKMyYDv5InE"
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

ocr_model = PaddleOCR(use_textline_orientation=True, lang='en')

# ==========================================================
# HELPER FUNCTIONS (UNCHANGED)
# ==========================================================

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
        doc = fitz.open(pdf_path)
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

# ==========================================================
# FIXED GEMINI ASSESSMENT (RATE-LIMIT SAFE)
# ==========================================================

def assess_with_gemini_text(subject, qa_pairs):
    model = genai.GenerativeModel("gemini-2.5-flash")

    # Build ONE prompt for ALL questions
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

# ==========================================================
# ROUTES (UNCHANGED)
# ==========================================================

@app.route("/evaluate", methods=["POST"])
def evaluate():
    try:
        if "file" not in request.files or "subject" not in request.form:
            return jsonify({"error": "Missing file or subject name"}), 400

        file = request.files["file"]
        subject = request.form["subject"]

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
            file.save(tmp_pdf.name)

        extracted_text = extract_text_from_pdf(tmp_pdf.name)
        qa_pairs = split_into_qa_pairs(extracted_text)
        assessment_result = assess_with_gemini_text(subject, qa_pairs)

        try:
            os.remove(tmp_pdf.name)
        except:
            pass

        return jsonify(assessment_result), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
