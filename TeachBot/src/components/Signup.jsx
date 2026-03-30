import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");
  const [childName, setChildName] = useState("");
  const [childEmail, setChildEmail] = useState("");

  const branches = [
    "Computer Science Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Electronics & Communication",
    "Information Technology",
    "Chemical Engineering",
    "Aerospace Engineering",
  ];

  const semesterOptions = {
    "1st Year": ["Semester 1", "Semester 2"],
    "2nd Year": ["Semester 3", "Semester 4"],
    "3rd Year": ["Semester 5", "Semester 6"],
    "4th Year": ["Semester 7", "Semester 8"],
  };

  const [availableSemesters, setAvailableSemesters] = useState([]);

  useEffect(() => {
    if (year) {
      setAvailableSemesters(semesterOptions[year] || []);
      setSemester("");
    } else {
      setAvailableSemesters([]);
      setSemester("");
    }
  }, [year]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const formData = {
    name,
    college,
    email,
    mobile,
    password,
    role,
    branch,
    year,
    semester,
    department,
    childName,
    childEmail,
  };

  try {
    await axios.post("https://teachbot-backend.onrender.com/auth/register", formData);
    alert("Account created successfully!");
    navigate("/login");
  } catch (err) {
    alert(err.response?.data?.error || "Registration failed");
  }
};


  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
          width: "80%",
          maxWidth: "900px",
          margin: "auto",
          animation: "fadeIn 0.5s ease-in-out",
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .form-label {
            font-weight: 600;
            color: #2563eb;
          }
          .form-input, .form-select {
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 0.6rem 1rem;
            width: 100%;
            font-size: 0.95rem;
            transition: box-shadow 0.2s ease;
          }
          .form-input:focus, .form-select:focus {
            border-color: #2563eb;
            outline: none;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
          }
          .form-button {
            background-color: #10a37f;
            color: white;
            font-weight: 600;
            padding: 0.8rem 1rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            width: 100%;
            transition: background 0.3s ease;
          }
          .form-button:hover {
            background-color: #;
          }
        `}</style>

        <h2 className="text-center text-2xl font-bold text-blue-600 mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: "name", label: "Full Name", value: name, set: setName },
              { id: "college", label: "College", value: college, set: setCollege },
              { id: "email", label: "Email ID", value: email, set: setEmail, type: "email" },
              { id: "mobile", label: "Mobile Number", value: mobile, set: setMobile, type: "tel" },
              { id: "password", label: "Password", value: password, set: setPassword, type: "password" },
              { id: "confirmPassword", label: "Confirm Password", value: confirmPassword, set: setConfirmPassword, type: "password" },
            ].map(({ id, label, value, set, type = "text" }) => (
              <div key={id}>
                <label htmlFor={id} className="form-label block mb-1">{label}</label>
                <input
                  id={id}
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="form-input"
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  required
                />
              </div>
            ))}
          </div>

          {/* Role Select */}
          <div>
            <label className="form-label block mb-1">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select w-full"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          {/* Student Fields */}
          {role === "student" && (
            <div>
              <div>
                <label className="form-label block mb-1">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="form-select w-full"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label block mb-1">Year of Study</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="form-select w-full"
                >
                  <option value="">Select Year</option>
                  {Object.keys(semesterOptions).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label block mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  disabled={!year}
                  className="form-select w-full"
                >
                  <option value="">Select Semester</option>
                  {availableSemesters.map((sem, i) => (
                    <option key={i} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Teacher Fields */}
          {role === "teacher" && (
            <div>
              <label className="form-label block mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-select w-full"
              >
                <option value="">Select Department</option>
                {branches.map((b, i) => (
                  <option key={i} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {/* Parent Fields */}
          {role === "parent" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label block mb-1">Child's Full Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="form-input"
                  placeholder="Enter child's name"
                />
              </div>

              <div>
                <label className="form-label block mb-1">Child's Email</label>
                <input
                  type="email"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter child's email"
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" className="form-button w-full">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;