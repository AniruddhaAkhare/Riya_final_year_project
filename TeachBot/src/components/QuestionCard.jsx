import React, { useState } from "react";
import { motion } from "framer-motion";

export default function QuestionCard({ question, index }) {
  const [expanded, setExpanded] = useState(false);
  const e = question.evaluation || {};

  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
    >
      <h3 className="font-bold mb-2">
        Q{index}: {question.question.length > 80 ? question.question.slice(0, 80) + "..." : question.question}
      </h3>
      <p className="italic mb-2">
        {question.answer.length > 100 ? question.answer.slice(0, 100) + "..." : question.answer}
      </p>

      {expanded && (
        <div className="mt-2 space-y-1 text-sm">
          <p><strong>Accuracy:</strong> {e.accuracy || "N/A"}</p>
          <p><strong>Completeness:</strong> {e.completeness || "N/A"}</p>
          <p><strong>Clarity:</strong> {e.clarity || "N/A"}</p>
          <p><strong>Grammar:</strong> {e.grammar || "N/A"}</p>
          <p><strong>Depth:</strong> {e.depth || "N/A"}</p>
          <p><strong>Suggested Answer:</strong> {e.suggested_answer || "N/A"}</p>
          <p><strong>Improvements:</strong> {e.improvement || "N/A"}</p>
          <p><strong>Score:</strong> {question.score || 0}/10</p>
        </div>
      )}
    </motion.div>
  );
}
