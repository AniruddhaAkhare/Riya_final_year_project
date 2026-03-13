import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Context
import { UserProvider } from "./context/UserContext";

// Auth
import Login from "./components/Login";
import Signup from "./components/Signup";

// Pages
import Teachbot from "./pages/Teachbot";

// Dashboards
import TeacherDashboard from "./components/TeacherDashboard/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard/StudentDashboard";
import ParentDashboard from "./components/ParentDashboard/ParentDashboard";

// Assignment Grader Page
import AssignmentGrader from "./pages/AssignmentGrader";

// Quiz Generator Page
import QuizGenerator from "./pages/QuizGenerator";

// Job Prediction Page
import JobPrediction from "./pages/JobPrediction";

// AI Tutor Page
import AITutor from "./pages/AITutor";

// Resume Builder Page
import ResumeBuilder from "./pages/ResumeBuilder";

// Settings Page
import SettingsPage from "./pages/SettingsPage";

// skill gap page
import Workforce from "./pages/Workforce";

// ikigai framework
import IkigaiPage from "./pages/IkigaiPage";

// overview page
import Overview from "./pages/Overview";

import TeacherStudentOverview from "./pages/TeacherStudentOverview";
import TeacherInsights from "./pages/TeacherInsights";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>

          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/" element={<Teachbot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ===== DASHBOARDS ===== */}
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />


          {/* ===== TEACHER VIEW STUDENT OVERVIEW ===== */}
          <Route
            path="/teacher/student/:id"
            element={<TeacherStudentOverview />}
          />

          <Route path="/teacher/insights" element={<TeacherInsights />} />

          {/* ===== STUDENT DASHBOARD LAYOUT ===== */}
          <Route path="/student-dashboard" element={<StudentDashboard />}>
            <Route index element={<h2 className="text-xl">Welcome Student 👋</h2>} />
            <Route path="assignment-grader" element={<AssignmentGrader />} />
            <Route path="quiz-generator" element={<QuizGenerator/>} />
            <Route path="job-prediction" element={<JobPrediction />} />
            <Route path="ai-tutor" element={<AITutor />} />
            <Route path="resume-builder" element={<ResumeBuilder />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="workforce" element={<Workforce />} />
            <Route path="ikigai" element={<IkigaiPage />} />
            <Route path="overview" element={<Overview/>} />

          </Route>

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
