import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function TeacherStudentOverview() {
  const { id } = useParams();
  const [overview, setOverview] = useState(null);

  const fetchOverview = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/teacher/student/${id}/overview`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setOverview(data.overview);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (!overview) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">
        Student Overview
      </h2>

      <p>Total Resumes: {overview.resumes.length}</p>
      <p>Total ATS Analysis: {overview.ats_analysis.length}</p>
      <p>Total Skill Gap Reports: {overview.skill_gap_analysis.length}</p>
      <p>Total Career Analysis: {overview.career_analysis.length}</p>
      <p>Total Assignments: {overview.assignment_evaluations.length}</p>
      <p>Total Quizzes: {overview.quiz_attempts.length}</p>
    </div>
  );
}

export default TeacherStudentOverview;