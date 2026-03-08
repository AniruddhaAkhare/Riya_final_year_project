import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

function AssignmentGrader() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");
    setResult(null);

   try {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("User not logged in");
    return;
  }

  const res = await axios.post(
    "http://localhost:5000/evaluate",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  


      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const renderQuestions = (assignment) => {
    if (!assignment || !assignment.questions) {
      return (
        <p className="text-center text-gray-500">
          No question-wise data available.
        </p>
      );
    }

    return assignment.questions.map((q, idx) => {
      const percentage = Math.round((q.score / q.max_score) * 100);

      return (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              Q{idx + 1}. {q.question}
            </h3>

            {q.is_correct ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Correct
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                <XCircle className="w-4 h-4" />
                Incorrect
              </span>
            )}
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Score</span>
              <span>
                {q.score} / {q.max_score}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  q.is_correct ? "bg-green-500" : "bg-orange-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-700 mb-1">Your Answer</p>
              <p className="text-gray-600">
                {q.student_answer || "Not answered"}
              </p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-medium text-green-700 mb-1">
                Expected Answer
              </p>
              <p className="text-green-800">{q.correct_answer}</p>
            </div>
          </div>

          {q.feedback && (
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>AI Feedback:</strong> {q.feedback}
              </p>
            </div>
          )}
        </motion.div>
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
            <FileText className="text-teal-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              AI Assignment Grader
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload assignments and receive detailed AI-powered evaluation
            </p>
          </div>
        </div>
      </div>

      {/* UPLOAD */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Upload Assignment
        </h2>

        <UploadForm onSubmit={handleSubmit} loading={loading} />

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-teal-600 font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            Evaluating assignment...
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-red-600 font-medium">
            {error}
          </p>
        )}
      </div>

      {/* RESULTS */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* SIMILARITY ANALYSIS */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Similarity Analysis
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Similarity %</p>
                <p className="text-xl font-bold text-gray-900">
                  {result.similarity_analysis?.assignment_to_assignment_similarity_percent}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Plagiarism Risk</p>
                <p className="text-xl font-bold text-gray-900">
                  {result.similarity_analysis?.plagiarism_risk}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Interpretation</p>
                <p className="text-sm text-gray-900">
                  {result.similarity_analysis?.interpretation}
                </p>
              </div>
            </div>
          </div>

          {/* ASSIGNMENT 1 */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Assignment 1
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Overall Score</p>
                <p className="text-xl font-bold text-gray-900">
                  {result.assignment_1.overall_score}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Result</p>
                <p className="text-xl font-bold text-gray-900">
                  {result.assignment_1.result}
                </p>
              </div>
            </div>

            {renderQuestions(result.assignment_1)}
          </div>

          {/* ASSIGNMENT 2 */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Assignment 2
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Overall Score</p>
                <p className="text-xl font-bold text-gray-900">
                  {result.assignment_2.overall_score}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Result</p>
                <p className="text-xl font-bold text-gray-900">
                  {result.assignment_2.result}
                </p>
              </div>
            </div>

            {renderQuestions(result.assignment_2)}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default AssignmentGrader;
