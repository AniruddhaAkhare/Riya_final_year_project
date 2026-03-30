import React, { useState } from "react";
import axios from "axios";

export default function Workforce() {
  const [formData, setFormData] = useState({
    skills: "",
    goal: "",
    education_level: "",
    experience_years: "",
    current_job_title: "",
    interests: "",
    certifications: "",
  });

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatAnalysisText = (text) => {
    const lines = text.split("\n");

    return lines.map((line, idx) => {
      // Section headings
      if (/^(\*\*)?[\w\s]+:(\*\*)?$/.test(line.trim())) {
        return (
          <h6 key={idx} className="mt-3 fw-bold">
            {line.replace(/\*/g, "").trim()}
          </h6>
        );
      }

      // Bullet points
      if (line.trim().startsWith("* ")) {
        return (
          <li key={idx}>
            {line.replace(/^\* /, "").replace(/\*/g, "").trim()}
          </li>
        );
      }

      // Bold bullets
      const boldMatch = line.match(/^\* \*\*(.*?)\*\*: (.+)$/);
      if (boldMatch) {
        return (
          <li key={idx}>
            <strong>{boldMatch[1]}</strong>: {boldMatch[2]}
          </li>
        );
      }

      // Inline bold
      if (line.includes("**")) {
        const parts = line.split(/\*\*/);
        return (
          <p key={idx}>
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      }

      return <p key={idx}>{line}</p>;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not logged in");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "https://teachbot-backend.onrender.com/analyze",
        {
          skills: formData.skills,
          goal: formData.goal,
          education_level: formData.education_level,
          experience_years: formData.experience_years,
          current_job_title: formData.current_job_title,
          interests: formData.interests,
          certifications: formData.certifications,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResponse(res.data.analysis);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to get analysis. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      skills: "",
      goal: "",
      education_level: "",
      experience_years: "",
      current_job_title: "",
      interests: "",
      certifications: "",
    });
    setResponse("");
    setError("");
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header">
          <h4 className="mb-0">AI Workforce Development Analysis</h4>
          <small className="text-muted">
            Fill out the form to receive a personalized AI career analysis.
          </small>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {Object.entries(formData).map(([field, value]) => (
              <div className="mb-3" key={field}>
                <label className="form-label text-capitalize">
                  {field.replace(/_/g, " ")}
                </label>

                {["skills", "goal", "interests"].includes(field) ? (
                  <textarea
                    className="form-control"
                    name={field}
                    rows={3}
                    value={value}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    name={field}
                    value={value}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Submit"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </form>

          {error && <div className="alert alert-danger mt-4">{error}</div>}

          {response && (
            <div className="alert alert-success mt-4">
              <h5>AI Analysis Results</h5>
              <div>{formatAnalysisText(response)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
