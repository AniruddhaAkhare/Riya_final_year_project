import React from "react";
import {
  BookOpen,
  FileCheck,
  User,
  Bot,
  ClipboardList,
  CalendarCheck,
  Brain,
  BarChart3,
} from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { useUser } from "../../context/UserContext";


function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const sidebarItems = [
    {
      category: "Academics",
      items: [
        {
          id: "overview",
          label: "Overview",
          icon: BarChart3,
          route: "overview",
        },
        {
          id: "assignment-grader",
          label: "Assignment Grading System",
          icon: FileCheck,
          route: "assignment-grader",
        },
        {
          id: "career-chatbot",
          label: "Career Guidance Bot",
          icon: CalendarCheck,
          external: true,
          url: "https://aspiration-ai-37836ea7.base44.app",
        },
      ],
    },
    {
      category: "AI Tools",
      items: [
        {
          id: "ai-tutor",
          label: "AI Tutor",
          icon: Brain,
          route: "ai-tutor",
        },
        {
          id: "mock-interview",
          label: "Mock Interview",
          icon: User,
          external: true,
          url: "https://aspiration-ai-copy-b79a711d.base44.app/",
        },
        {
          id: "quiz-generator",
          label: "Quiz Generator",
          icon: ClipboardList,
          route: "quiz-generator",
        },
      ],
    },
    {
      category: "Career",
      items: [
        {
          id: "resume",
          label: "Resume Builder",
          icon: FileCheck,
          route: "resume-builder",
        },
        {
          id: "job-prediction",
          label: "Job Prediction",
          icon: BookOpen,
          route: "job-prediction",
        },
        {
          id: "skill-gap",
          label: "Skill Gap Analyzer",
          icon: FileCheck,
          route: "workforce",
        },
        {
          id: "ikigai",
          label: "IKIGAI FrameWork",
          icon: Brain,
          route: "ikigai",
        },
      ],
    },
    {
      category: "System",
      items: [
        {
          id: "settings",
          label: "Settings",
          icon: User,
          route: "settings",
        },
      ],
    },
  ];

  const handleNavigation = (item) => {
    if (item.external) {
      window.open(item.url, "_blank");
      return;
    }
    navigate(item.route);
  };

  const isActiveRoute = (route) => {
    if (route === "") {
      return location.pathname === "/student-dashboard";
    }
    return location.pathname.startsWith(
      `/student-dashboard/${route}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ================= SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm z-40 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              TeachBot
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {sidebarItems.map((section, index) => (
            <div key={index}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.category}
              </h3>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(item.route);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                JS
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || "Student"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="ml-64 flex-1 min-h-screen p-8">
        <Outlet />
      </main>

      {/* ================= FLOATING AI TUTOR ================= */}
      <button
        onClick={() => navigate("ai-tutor")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition z-50 flex items-center justify-center"
        title="AI Tutor"
      >
        <Bot className="h-6 w-6" />
      </button>
    </div>
  );
}

export default StudentDashboard;
