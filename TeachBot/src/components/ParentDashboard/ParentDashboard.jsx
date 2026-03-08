"use client"

import { useState } from "react"

const ParentDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview")
  const [selectedChild, setSelectedChild] = useState("Emma Johnson")
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Ms. Sarah Wilson",
      message: "Emma did excellent work on her science project!",
      time: "2 hours ago",
      type: "teacher",
    },
    {
      id: 2,
      sender: "You",
      message: "Thank you for the update. How is she doing in math?",
      time: "1 hour ago",
      type: "parent",
    },
    {
      id: 3,
      sender: "Mr. David Chen",
      message: "Emma is improving in algebra. I recommend extra practice with linear equations.",
      time: "30 mins ago",
      type: "teacher",
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  // Sample data for the child
  const childData = {
    name: "Emma Johnson",
    grade: "10th Grade",
    overallGrade: "A-",
    attendance: "96%",
    assignments: { pending: 2, completed: 15, overdue: 0 },
    subjects: [
      { name: "Mathematics", grade: "B+", progress: 78, teacher: "Mr. David Chen", trend: "improving" },
      { name: "Science", grade: "A", progress: 92, teacher: "Ms. Sarah Wilson", trend: "excellent" },
      { name: "English", grade: "A-", progress: 88, teacher: "Mrs. Lisa Brown", trend: "stable" },
      { name: "History", grade: "B", progress: 82, teacher: "Mr. James Miller", trend: "improving" },
      { name: "Art", grade: "A+", progress: 95, teacher: "Ms. Maria Garcia", trend: "excellent" },
    ],
    recentGrades: [
      { subject: "Science", assignment: "Chemistry Lab Report", grade: "A", date: "2024-01-15" },
      { subject: "Math", assignment: "Algebra Quiz", grade: "B+", date: "2024-01-14" },
      { subject: "English", assignment: "Essay: Climate Change", grade: "A-", date: "2024-01-12" },
      { subject: "History", assignment: "World War II Project", grade: "B+", date: "2024-01-10" },
    ],
    upcomingAssignments: [
      { subject: "Math", title: "Linear Equations Problem Set", dueDate: "2024-01-18", priority: "high" },
      { subject: "English", title: "Book Report: To Kill a Mockingbird", dueDate: "2024-01-20", priority: "medium" },
    ],
    alerts: [
      { type: "warning", message: "Math assignment due tomorrow", time: "1 hour ago" },
      { type: "info", message: "Parent-teacher conference scheduled for Jan 25", time: "2 hours ago" },
      { type: "success", message: "Emma received an A on her Science project", time: "1 day ago" },
    ],
  }

  const StatCard = ({ title, value, subtitle, icon, trend, color = "teal" }) => {
    const getColorClasses = (color) => {
      switch (color) {
        case "blue":
          return {
            bg: "bg-blue-50",
            text: "text-blue-600",
            icon: "text-blue-500",
          }
        case "green":
          return {
            bg: "bg-green-50",
            text: "text-green-600",
            icon: "text-green-500",
          }
        case "orange":
          return {
            bg: "bg-orange-50",
            text: "text-orange-600",
            icon: "text-orange-500",
          }
        case "purple":
          return {
            bg: "bg-purple-50",
            text: "text-purple-600",
            icon: "text-purple-500",
          }
        default:
          return {
            bg: "bg-teal-50",
            text: "text-teal-600",
            icon: "text-teal-500",
          }
      }
    }

    const colors = getColorClasses(color)

    return (
      <div className={`${colors.bg} p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={`p-2 ${colors.bg} rounded-lg ${colors.icon}`}>{icon}</div>
        </div>
        <div className={`text-3xl font-bold ${colors.text} mb-2`}>{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{subtitle}</p>
          {trend && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                trend.type === "up"
                  ? "bg-green-100 text-green-600"
                  : trend.type === "down"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
    )
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        sender: "You",
        message: newMessage,
        time: "Just now",
        type: "parent",
      }
      setChatMessages([...chatMessages, message])
      setNewMessage("")
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Child Selector */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="Emma Johnson">Emma Johnson - 10th Grade</option>
          <option value="Alex Johnson">Alex Johnson - 8th Grade</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Grade"
          value={childData.overallGrade}
          subtitle="Current semester"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          trend={{ type: "up", value: "+2% from last month" }}
          color="teal"
        />
        <StatCard
          title="Attendance"
          value={childData.attendance}
          subtitle="This semester"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          trend={{ type: "up", value: "Excellent" }}
          color="green"
        />
        <StatCard
          title="Assignments"
          value={childData.assignments.completed}
          subtitle={`${childData.assignments.pending} pending`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          trend={{ type: "stable", value: "On track" }}
          color="blue"
        />
        <StatCard
          title="Study Hours"
          value="28h"
          subtitle="This week"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          trend={{ type: "up", value: "+3h from last week" }}
          color="purple"
        />
      </div>

      {/* Recent Alerts */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {childData.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.type === "warning"
                  ? "bg-yellow-50 border-yellow-400"
                  : alert.type === "success"
                    ? "bg-green-50 border-green-400"
                    : "bg-blue-50 border-blue-400"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-gray-800">{alert.message}</p>
                <span className="text-xs text-gray-500">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h3>
        <div className="space-y-4">
          {childData.subjects.map((subject, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{subject.name}</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subject.grade.startsWith("A")
                        ? "bg-green-100 text-green-600"
                        : subject.grade.startsWith("B")
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {subject.grade}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Teacher: {subject.teacher}</span>
                  <span
                    className={`${
                      subject.trend === "excellent"
                        ? "text-green-600"
                        : subject.trend === "improving"
                          ? "text-blue-600"
                          : "text-gray-600"
                    }`}
                  >
                    {subject.trend}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{subject.progress}% progress</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Recent Grades */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Grades</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Assignment</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Grade</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {childData.recentGrades.map((grade, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{grade.subject}</td>
                  <td className="py-3 px-4">{grade.assignment}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        grade.grade.startsWith("A")
                          ? "bg-green-100 text-green-600"
                          : grade.grade.startsWith("B")
                            ? "bg-blue-100 text-blue-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {grade.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{grade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Assignments</h3>
        <div className="space-y-4">
          {childData.upcomingAssignments.map((assignment, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                assignment.priority === "high"
                  ? "bg-red-50 border-red-400"
                  : assignment.priority === "medium"
                    ? "bg-yellow-50 border-yellow-400"
                    : "bg-green-50 border-green-400"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                  <p className="text-sm text-gray-600">{assignment.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">Due: {assignment.dueDate}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      assignment.priority === "high"
                        ? "bg-red-100 text-red-600"
                        : assignment.priority === "medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {assignment.priority} priority
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Analytics Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Trends</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-600">Performance analytics chart would be displayed here</p>
            <p className="text-sm text-gray-500 mt-2">Showing grade trends over time</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCommunication = () => (
    <div className="space-y-6">
      {/* Teacher Chat */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 bg-teal-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Teacher Communication</h3>
          <p className="text-sm text-gray-600">Chat with your child's teachers</p>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "parent" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === "parent" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm font-medium mb-1">{message.sender}</p>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${message.type === "parent" ? "text-teal-100" : "text-gray-500"}`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-4">Schedule Parent-Teacher Conference</h4>
          <p className="text-gray-600 mb-4">Book a meeting with your child's teachers</p>
          <button className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
            Schedule Meeting
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-4">Request Progress Report</h4>
          <p className="text-gray-600 mb-4">Get detailed academic progress report</p>
          <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Request Report
          </button>
        </div>
      </div>
    </div>
  )

  const renderResources = () => (
    <div className="space-y-6">
      {/* Learning Resources */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Learning Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">Mathematics Support</h4>
            <p className="text-sm text-blue-600 mb-3">Extra practice materials for algebra</p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Resources →</button>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h4 className="font-medium text-green-800 mb-2">Science Lab Videos</h4>
            <p className="text-sm text-green-600 mb-3">Interactive chemistry experiments</p>
            <button className="text-green-600 hover:text-green-800 text-sm font-medium">Watch Videos →</button>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="font-medium text-purple-800 mb-2">Reading Comprehension</h4>
            <p className="text-sm text-purple-600 mb-3">Improve English reading skills</p>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">Start Reading →</button>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <h4 className="font-medium text-orange-800 mb-2">Study Techniques</h4>
            <p className="text-sm text-orange-600 mb-3">Effective study methods guide</p>
            <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">Learn More →</button>
          </div>
        </div>
      </div>

      {/* Progress Reports */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Reports</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Monthly Progress Report - January</h4>
              <p className="text-sm text-gray-600">Comprehensive academic performance summary</p>
            </div>
            <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
              Download PDF
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Skill Development Report</h4>
              <p className="text-sm text-gray-600">Analysis of strengths and improvement areas</p>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              View Report
            </button>
          </div>
        </div>
      </div>

      {/* Study Tips */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Study Tips for Parents</h3>
        <div className="space-y-3">
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <h4 className="font-medium text-yellow-800 mb-1">Create a Study Schedule</h4>
            <p className="text-sm text-yellow-700">Help your child establish consistent study times</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h4 className="font-medium text-green-800 mb-1">Encourage Active Learning</h4>
            <p className="text-sm text-green-700">Promote discussion and practical application of concepts</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-800 mb-1">Monitor Screen Time</h4>
            <p className="text-sm text-blue-700">Balance digital learning with offline activities</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCareerInsights = () => (
    <div className="space-y-6">
      {/* Career Readiness Overview */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Career Readiness Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600">85%</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">STEM Aptitude</h4>
            <p className="text-sm text-gray-600">Strong in mathematics and science</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600">78%</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Communication</h4>
            <p className="text-sm text-gray-600">Good verbal and written skills</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-purple-600">92%</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Creativity</h4>
            <p className="text-sm text-gray-600">Excellent artistic abilities</p>
          </div>
        </div>
      </div>

      {/* Career Predictions */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Career Predictions</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">Software Engineer</h4>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">95% Match</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Strong analytical skills and mathematical aptitude</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">Problem Solving</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">Mathematics</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">Logic</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">Biomedical Engineer</h4>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">88% Match</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Combines science knowledge with creative problem-solving</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">Biology</span>
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">Innovation</span>
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">Research</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">UX/UI Designer</h4>
              <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                82% Match
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Creative skills combined with technical understanding</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">Creativity</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">Design</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">Technology</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Development Recommendations */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Development Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <h4 className="font-medium text-yellow-800 mb-2">Strengthen Areas</h4>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li>• Public speaking and presentation skills</li>
              <li>• Advanced mathematics (calculus)</li>
              <li>• Leadership and teamwork</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h4 className="font-medium text-green-800 mb-2">Leverage Strengths</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Participate in science fairs</li>
              <li>• Join coding competitions</li>
              <li>• Explore art and design projects</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Future Planning */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Future Planning Roadmap</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-teal-600 font-bold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">High School (Current)</h4>
              <p className="text-sm text-gray-600">
                Focus on STEM subjects, maintain high GPA, participate in extracurriculars
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">College Preparation</h4>
              <p className="text-sm text-gray-600">
                Consider engineering or computer science programs, build portfolio
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-bold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Career Development</h4>
              <p className="text-sm text-gray-600">Internships, networking, skill specialization in chosen field</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const sidebarItems = [
    {
      section: "DASHBOARD",
      items: [
        { id: "overview", label: "Overview", icon: "🏠" },
        { id: "performance", label: "Performance Tracking", icon: "📊" },
        { id: "communication", label: "Teacher Communication", icon: "💬" },
      ],
    },
    {
      section: "RESOURCES",
      items: [
        { id: "resources", label: "Learning Resources", icon: "📚" },
        { id: "career", label: "Career Insights", icon: "🎯" },
      ],
    },
    {
      section: "SUPPORT",
      items: [{ id: "settings", label: "Settings", icon: "⚙️" }],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TB</span>
            </div>
            <span className="text-xl font-bold text-gray-800">TeachBot</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {sidebarItems.map((section) => (
            <div key={section.section}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{section.section}</h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? "bg-teal-50 text-teal-600 border-r-2 border-teal-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-semibold">JS</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">John Smith</p>
              <p className="text-sm text-gray-500">Parent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
              <p className="text-gray-600">Monitor and support your child's academic journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM9 7h6m0 0V1m0 6L9 1"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {activeSection === "overview" && renderOverview()}
          {activeSection === "performance" && renderPerformance()}
          {activeSection === "communication" && renderCommunication()}
          {activeSection === "resources" && renderResources()}
          {activeSection === "career" && renderCareerInsights()}
          {activeSection === "settings" && (
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
              <p className="text-gray-600">Parent dashboard settings and preferences would be displayed here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ParentDashboard
