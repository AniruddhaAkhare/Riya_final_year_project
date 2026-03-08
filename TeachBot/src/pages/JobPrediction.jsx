import React, { useState } from "react";
import axios from "axios";

const JobPrediction = () => {
  const [form, setForm] = useState({
    educationLevel: "",
    branch: "",
    preferredRole: "",
    location: "",
    jobType: "",
    skills: ""
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= HANDLERS =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const predictJobs = async () => {
    setError("");
    setJobs([]);

    try {
      setLoading(true);
      const res = await axios.post(
  "http://localhost:5000/predict-jobs",
  form,
  {
    headers: {
      "Content-Type": "application/json"
    }
  }
);


      console.log("RAW BACKEND RESPONSE:", res.data);

      if (!res.data || !Array.isArray(res.data.predictions)) {
        throw new Error("Invalid backend response format");
      }

      setJobs(res.data.predictions);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        "Job prediction failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">
        AI Job Prediction System
      </h2>

      {/* ================= FORM ================= */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          name="educationLevel"
          value={form.educationLevel}
          placeholder="Year / Fresher / Experience"
          onChange={handleChange}
          className="input"
        />

        <input
          name="branch"
          value={form.branch}
          placeholder="Branch of Study"
          onChange={handleChange}
          className="input"
        />

        <input
          name="preferredRole"
          value={form.preferredRole}
          placeholder="Preferred Job Role"
          onChange={handleChange}
          className="input"
        />

        <input
          name="location"
          value={form.location}
          placeholder="Preferred Location"
          onChange={handleChange}
          className="input"
        />

        <select
          name="jobType"
          value={form.jobType}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select Job Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Internship">Internship</option>
          <option value="Part-time">Part-time</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Contract">Contract</option>
        </select>

        <input
          name="skills"
          value={form.skills}
          placeholder="Skills (optional)"
          onChange={handleChange}
          className="input"
        />
      </div>

      <button
        onClick={predictJobs}
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg"
      >
        {loading ? "Predicting Jobs..." : "Predict Job Results"}
      </button>

      {/* ================= ERROR ================= */}
      {error && (
        <p className="mt-4 text-red-600 font-medium">
          {error}
        </p>
      )}

      {/* ================= RESULTS ================= */}
      {jobs.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-8 mb-4">
            Predicted Job Opportunities
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Company</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-left">Salary</th>
                  <th className="p-3 text-left">Experience</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">{job.company || "—"}</td>
                    <td className="p-3">{job.role || "—"}</td>
                    <td className="p-3">{job.location || "—"}</td>
                    <td className="p-3">{job.salary || "—"}</td>
                    <td className="p-3">{job.experience || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= SKILLS ================= */}
          <h3 className="text-xl font-semibold mt-8 mb-4">
            Skill Breakdown by Role
          </h3>

          {jobs.map((job, idx) => (
            <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">
                {job.role}
              </h4>

              <div className="flex flex-wrap gap-2">
                {(Array.isArray(job.skills)
                  ? job.skills
                  : []
                ).map((skill, i) => (
                  <span
                    key={i}
                    className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default JobPrediction;
