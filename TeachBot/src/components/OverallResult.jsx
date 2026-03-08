import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function OverallResult({ overall }) {
  const pass = overall.result === "Pass";

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl mt-6 ${
        pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      <div>
        <h2 className="text-xl font-bold">Overall Score: {overall.overall_score}/10</h2>
        <p className="text-lg font-medium">Result: {overall.result}</p>
      </div>
      <div className="text-4xl">
        {pass ? <FaCheckCircle /> : <FaTimesCircle />}
      </div>
    </div>
  );
}
