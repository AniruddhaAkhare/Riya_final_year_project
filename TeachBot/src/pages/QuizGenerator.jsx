import React, { useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const QuizGenerator = () => {
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    difficulty: "Easy",
    numQuestions: 5,
  });

  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const COLORS = ["#22c55e", "#ef4444"];

  // ================= GENERATE QUIZ =================
  const generateQuiz = async () => {
    try {
  setLoading(true);

  const token = localStorage.getItem("token"); // get JWT token
  if (!token) {
    alert("User not logged in");
    return;
  }

  const res = await axios.post(
    "https://teachbot-backend.onrender.com/generate-quiz",
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

      let extractedQuestions = null;

      if (Array.isArray(res.data?.quiz)) {
        extractedQuestions = res.data.quiz;
      } else if (Array.isArray(res.data?.questions)) {
        extractedQuestions = res.data.questions;
      }

      if (!extractedQuestions) {
        alert("Invalid quiz format from backend");
        setLoading(false);
        return;
      }

      const normalized = extractedQuestions.map((q) => ({
        question: q.question,
        options: q.options,
        correct: q.answer,
      }));

      setQuiz(normalized);
      setAnswers({});
      setResult(null);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz");
      setLoading(false);
    }
  };

  // ================= SUBMIT QUIZ =================
  const submitQuiz = async () => {
    try {
    const studentAnswersArray = quiz.map(
      (_, index) => answers[index] || ""
    );

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not logged in");
      return;
    }

    const res = await axios.post(
      "https://teachbot-backend.onrender.com/assess-quiz",
      {
        subject: form.subject,
        quiz: quiz,
        student_answers: studentAnswersArray,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

      setResult(res.data);
    } catch (err) {
      console.error("Submit error:", err.response?.data || err);
    }
  };

  // ================= PIE DATA =================
  const chartData = result
    ? [
        { name: "Correct", value: result.total_score },
        { name: "Wrong", value: quiz.length - result.total_score },
      ]
    : [];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-5xl mx-auto mt-6">

      {/* ================= FORM ================= */}
      {!quiz.length && !result && (
        <>
          <h2 className="text-3xl font-bold mb-6">Quiz Generator</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Subject"
              className="border p-2 rounded"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />

            <input
              placeholder="Topic"
              className="border p-2 rounded"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />

            <select
              className="border p-2 rounded"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            <input
              type="number"
              min={1}
              max={50}
              className="border p-2 rounded"
              value={form.numQuestions}
              onChange={(e) =>
                setForm({ ...form, numQuestions: e.target.value })
              }
            />
          </div>

          <button
            onClick={generateQuiz}
            className="mt-6 bg-teal-600 text-white px-6 py-3 rounded"
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </>
      )}

      {/* ================= QUIZ ================= */}
      {quiz.length > 0 && !result && (
        <>
          <h2 className="text-3xl font-bold mb-6">Answer the Quiz</h2>

          {quiz.map((q, idx) => (
            <div key={idx} className="mb-6 border p-4 rounded">
              <p className="font-semibold mb-2">
                {idx + 1}. {q.question}
              </p>

              {Object.entries(q.options).map(([key, value]) => (
                <label key={key} className="block">
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    checked={answers[idx] === key}
                    onChange={() =>
                      setAnswers({ ...answers, [idx]: key })
                    }
                  />{" "}
                  {key}. {value}
                </label>
              ))}
            </div>
          ))}

          <button
            onClick={submitQuiz}
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Submit Quiz
          </button>
        </>
      )}

      {/* ================= RESULT ================= */}
      {result && (
        <>
          <h2 className="text-3xl font-bold mb-4">Quiz Result</h2>

          <div className="mb-4 border p-4 rounded bg-gray-50">
            <p><b>Score:</b> {result.total_score} / {quiz.length}</p>
            <p><b>Percentage:</b> {result.percentage}%</p>
            <p><b>Result:</b> {result.result}</p>
          </div>

          <div className="flex justify-center mb-8">
            <PieChart width={300} height={300}>
              <Pie data={chartData} dataKey="value" outerRadius={100} label>
                <Cell fill={COLORS[0]} />
                <Cell fill={COLORS[1]} />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          {/* ================= QUESTION-WISE ASSESSMENT ================= */}
          <h3 className="text-2xl font-bold mb-4">Question-wise Analysis proficiency:</h3>

          {result.question_wise?.map((q, idx) => (
            <div
              key={idx}
              className={`mb-4 p-4 rounded border ${
                q.is_correct ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p className="font-semibold mb-2">
                {idx + 1}. {q.question}
              </p>

              <p>
                <b>Your Answer:</b>{" "}
                <span className={q.is_correct ? "text-green-700" : "text-red-700"}>
                  {q.student_answer || "Not Answered"}
                </span>
              </p>

              {!q.is_correct && (
                <p>
                  <b>Correct Answer:</b>{" "}
                  <span className="text-green-700">
                    {q.correct_answer}
                  </span>
                </p>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              setQuiz([]);
              setResult(null);
            }}
            className="mt-6 bg-teal-600 text-white px-6 py-3 rounded"
          >
            Generate New Quiz
          </button>
        </>
      )}
    </div>
  );
};

export default QuizGenerator;
