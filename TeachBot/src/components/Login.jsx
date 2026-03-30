import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext"; // <-- import the UserContext hook

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useUser(); // <-- use context to update logged-in user

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await axios.post("https://teachbot-backend.onrender.com/auth/login", {
      email,
      password,
    });

    const { token, role: userRole } = res.data;

    localStorage.setItem("token", token);

    // fetch user info
    const userRes = await axios.get("https://teachbot-backend.onrender.com/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = userRes.data;

    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
    });

    if (userRole === "student") navigate("/student-dashboard");
    else if (userRole === "teacher") navigate("/teacher-dashboard");
    else navigate("/parent-dashboard");

  } catch (err) {
    setError(err.response?.data?.error || "Login failed");
  } finally {
    setLoading(false);
  }
};
  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "30px",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#ffffff",
        fontFamily: "'Roboto', sans-serif",
        textAlign: "center",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; background-color: #f9f9f9; }
        `}
      </style>

      <h2
        style={{
          marginBottom: "24px",
          color: "#333",
          fontWeight: "700",
          fontSize: "1.8rem",
        }}
      >
        Login
      </h2>

      {error && (
        <div
          style={{
            backgroundColor: "#fee8e8",
            color: "#d32f2f",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ffcdd2",
            marginBottom: "16px",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="email"
          style={{
            display: "block",
            textAlign: "left",
            marginTop: "16px",
            marginBottom: "6px",
            color: "#555",
            fontWeight: "500",
            fontSize: "0.95rem",
          }}
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "1rem",
            outline: "none",
            transition: "border 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 2px rgba(16, 163, 127, 0.2)")
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />

        <label
          htmlFor="password"
          style={{
            display: "block",
            textAlign: "left",
            marginTop: "16px",
            marginBottom: "6px",
            color: "#555",
            fontWeight: "500",
            fontSize: "0.95rem",
          }}
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "1rem",
            outline: "none",
            transition: "border 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 2px rgba(16, 163, 127, 0.2)")
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "16px",
            gap: "10px",
          }}
        >
          {["student", "teacher", "parent"].map((userRole) => (
            <label
              key={userRole}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                fontWeight: "500",
                color: "#444",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              <input
                type="radio"
                name="role"
                value={userRole}
                checked={role === userRole}
                onChange={() => setRole(userRole)}
                style={{ marginRight: "6px" }}
              />
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "12px",
            backgroundColor: "#10a37f",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#0c8063")}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = "#10a37f")}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p
        style={{
          marginTop: "20px",
          fontSize: "0.9rem",
          color: "#666",
        }}
      >
        Don't have an account?{" "}
        <a
          href="/signup"
          style={{
            color: "#10a37f",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Create a new account here.
        </a>
      </p>
    </div>
  );
};

export default Login;
