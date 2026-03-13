import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,
  Settings,
  AlertCircle,
  Search,
} from "lucide-react";

import Overview from "../../pages/Overview";
import TeacherInsights from "../../pages/TeacherInsights";

function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [studentOverview, setStudentOverview] = useState(null);

  // ================= FETCH Teacher profile =================

  const fetchTeacherProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/teacher/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.name) {
        setTeacherName(data.name);
      }
    } catch (error) {
      console.error("Teacher fetch error", error);
    }
  };

  // ================= FETCH STUDENTS =================

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/teacher/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.students) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTeacherProfile();
  }, []);

  // ================= FETCH STUDENT STATS =================

  const fetchStudentStats = async (student) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/teacher/student/${student.id}/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setSelectedStudent(student);
      setStudentStats(data);
    } catch (error) {
      console.error("Stats error", error);
    }
  };

  // ================= FETCH STUDENT OVERVIEW =================

  const fetchStudentOverview = async (student) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/teacher/student-overview/${student.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setSelectedStudent(student);
      setStudentOverview(data.overview);
      setActiveSection("studentOverview");
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SEARCH FILTER =================

  const filteredStudents = students.filter((student) => {
    const value = searchTerm.toLowerCase();

    return (
      student.name?.toLowerCase().includes(value) ||
      student.email?.toLowerCase().includes(value) ||
      student.mobile?.toLowerCase().includes(value) ||
      student.college?.toLowerCase().includes(value) ||
      student.branch?.toLowerCase().includes(value) ||
      student.year?.toLowerCase().includes(value) ||
      student.semester?.toLowerCase().includes(value)
    );
  });

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

        <nav className="flex-1 p-4 space-y-4">

          <button
            onClick={() => setActiveSection("overview")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeSection === "overview"
                ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Overview
          </button>

          <button
  onClick={() => setActiveSection("analytics")}
  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
    activeSection === "analytics"
      ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
      : "text-gray-600 hover:bg-gray-100"
  }`}
>
  <BarChart3 className="h-5 w-5" />
  Teacher Insights
</button>

          <button
            onClick={() => setActiveSection("students")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeSection === "students"
                ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="h-5 w-5" />
            Students
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            <Calendar className="h-5 w-5" />
            Schedule
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            <MessageSquare className="h-5 w-5" />
            Messages
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            <Settings className="h-5 w-5" />
            Settings
          </button>

        </nav>

        {/* Teacher Profile */}

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">

            <div className="w-9 h-9 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">T</span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">
                {teacherName || "Teacher"}
              </p>
              <p className="text-xs text-gray-500">Teacher Panel</p>
            </div>

          </div>
        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="ml-64 flex-1 min-h-screen p-8">

        {/* ================= OVERVIEW ================= */}

        {activeSection === "overview" && (

          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white p-6 rounded-xl shadow border">
                <p className="text-sm text-gray-500">Total Students</p>
                <h3 className="text-3xl font-bold">{students.length}</h3>
              </div>

              <div className="bg-white p-6 rounded-xl shadow border">
                <p className="text-sm text-gray-500">Classes</p>
                <h3 className="text-3xl font-bold">--</h3>
              </div>

              <div className="bg-white p-6 rounded-xl shadow border">
                <p className="text-sm text-gray-500">Assignments</p>
                <h3 className="text-3xl font-bold">--</h3>
              </div>

            </div>
          </div>

        )}

        {/* ================= TEACHER INSIGHTS ================= */}

{activeSection === "analytics" && (

  <div>

    <h2 className="text-2xl font-bold mb-6">
      Teacher Insights
    </h2>

    <TeacherInsights />

  </div>

)}

        {/* ================= STUDENTS ================= */}

        {activeSection === "students" && (

          <div>

            <h2 className="text-2xl font-bold mb-6">Student List</h2>

            {/* SEARCH */}

            <div className="mb-5 relative max-w-md">
              <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />

              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <div className="bg-white rounded-xl shadow border overflow-hidden">

              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                  <AlertCircle />
                  No students found
                </div>
              ) : (

                <table className="min-w-full">

                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">Student</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">College</th>
                      <th className="px-6 py-3 text-left">Branch</th>
                      <th className="px-6 py-3 text-left">Year</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredStudents.map((student) => (

                      <tr
                        key={student.id}
                        onClick={() => fetchStudentOverview(student)}
                        className="border-b hover:bg-teal-50 cursor-pointer"
                      >

                        <td className="px-6 py-4 font-medium">
                          {student.name}
                        </td>

                        <td className="px-6 py-4">
                          {student.email}
                        </td>

                        <td className="px-6 py-4">
                          {student.college}
                        </td>

                        <td className="px-6 py-4">
                          {student.branch}
                        </td>

                        <td className="px-6 py-4">
                          {student.year}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              )}

            </div>

          </div>

        )}

        {/* ================= STUDENT OVERVIEW ================= */}

        {activeSection === "studentOverview" && studentOverview && (

          <div>

            <h2 className="text-2xl font-bold mb-6">
              {selectedStudent?.name} - Overview
            </h2>

            <Overview overview={studentOverview} />

          </div>

        )}

      </main>

    </div>
  );
}

export default TeacherDashboard;