import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Overview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumes");
  const [expandedATS, setExpandedATS] = useState(null);
  const [expandedSkillId, setExpandedSkillId] = useState(null);
  const [openPhase, setOpenPhase] = useState({});
  const [expandedIkigaiId, setExpandedIkigaiId] = useState(null);
  




  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOverview(res.data.overview);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center text-gray-600">Loading Overview...</div>;

  if (!overview)
    return <div className="p-10 text-center text-red-500">Failed to load data</div>;

  /* ---------------- Resume Renderer ---------------- */

  const renderResumes = () => {
  const resumes = overview.resumes || [];

  if (!resumes.length)
    return <p className="text-gray-500">No resumes available</p>;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
      {resumes.map((r) => {
        let data = {};

        try {
          data =
            typeof r.resume_json === "string"
              ? JSON.parse(r.resume_json)
              : r.resume_json;
        } catch {
          data = {};
        }

        const skills = data.skills || [];
        const education = data.education || [];
        const experience = data.experience || [];
        const projects = data.projects || [];

        return (
          <div
            key={r.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition duration-300 p-6 space-y-5"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-indigo-700">
                  {data.name || "My Resume"}
                </h2>
                <p className="text-gray-500">
                  {data.preferredRole || "Candidate"}
                </p>
              </div>

              <div className="w-3 h-3 bg-green-500 rounded-full mt-2" />
            </div>

            {/* Contact */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                📧 {data.email || "Not Provided"}
              </p>
              <p>
                📞 {data.phone || "Not Provided"}
              </p>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Education
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                  {education.slice(0, 2).map((e, i) => (
                    <div key={i}>
                      <p className="font-medium">
                        {e.degree || e.title}
                      </p>
                      <p className="text-gray-500">
                        {e.institution || e.college}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Experience
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                  {experience.slice(0, 2).map((ex, i) => (
                    <div key={i}>
                      <p className="font-medium">
                        {ex.role || ex.title}
                      </p>
                      <p className="text-gray-500">
                        {ex.company}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Projects
                </h3>

                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {projects.slice(0, 2).map((p, i) => (
                    <li key={i}>{p.name || p.title}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t text-xs text-gray-400 flex justify-between">
              <span>Resume ID: {r.id}</span>
              <span>AI Generated</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};


  /* ---------------- ATS ---------------- */

  const renderATS = () => {
  const ats = overview.ats_analysis || [];

  if (!ats.length)
    return <p className="text-gray-500">No ATS data available</p>;

  return (
    <div className="space-y-6">
      {ats.map((a) => {
        let strengths = [];
        let weaknesses = [];

        try {
          strengths =
            typeof a.strengths === "string"
              ? JSON.parse(a.strengths)
              : a.strengths || [];
        } catch {
          strengths = [a.strengths];
        }

        try {
          weaknesses =
            typeof a.weaknesses === "string"
              ? JSON.parse(a.weaknesses)
              : a.weaknesses || [];
        } catch {
          weaknesses = [a.weaknesses];
        }

        const score = a.ats_score || 0;
        const isExpanded = expandedATS === a.id;

        const scoreColor =
          score >= 70
            ? "#16a34a"
            : score >= 50
            ? "#f59e0b"
            : "#ef4444";

        const skillMatch = [
          { name: "Technical Skills", value: score },
          { name: "Experience", value: Math.max(score - 15, 30) },
          { name: "Projects", value: Math.max(score - 10, 35) },
          { name: "ATS Keywords", value: Math.max(score - 5, 40) },
        ];

        return (
          <div
            key={a.id}
            onClick={() =>
              setExpandedATS(isExpanded ? null : a.id)
            }
            className="bg-white rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition overflow-hidden"
          >
            {/* ---------- PREVIEW HEADER ---------- */}
            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-lg font-bold text-indigo-700">
                  ATS Resume Analysis
                </h2>
                <p className="text-gray-500">
                  {a.preferred_role || "Software Developer"}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Click to {isExpanded ? "collapse ▲" : "view details ▼"}
                </p>
              </div>

              <div className="w-20 h-20">
                <CircularProgressbar
                  value={score}
                  text={`${score}%`}
                  styles={buildStyles({
                    pathColor: scoreColor,
                    textColor: "#111827",
                    trailColor: "#e5e7eb",
                    textSize: "26px",
                  })}
                />
              </div>
            </div>

            {/* ---------- PREVIEW SKILL BARS ---------- */}
            <div className="px-6 pb-6 grid md:grid-cols-2 gap-4">
              {skillMatch.slice(0, 2).map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{s.name}</span>
                    <span>{s.value}%</span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- EXPANDED CONTENT ---------- */}
            {isExpanded && (
              <div className="border-t p-6 space-y-8">
                {/* Skill Match Full */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-4 text-lg">
                    Skill Match Analysis
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {skillMatch.map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{s.name}</span>
                          <span className="font-semibold">
                            {s.value}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 h-3 rounded-full">
                          <div
                            className="h-3 rounded-full bg-indigo-600"
                            style={{ width: `${s.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths + Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <h3 className="font-semibold text-green-700 mb-3">
                      ✅ Strengths
                    </h3>

                    <ul className="space-y-2 text-gray-700">
                      {strengths.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-500">●</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <h3 className="font-semibold text-red-700 mb-3">
                      ⚠ Weaknesses
                    </h3>

                    <ul className="space-y-2 text-gray-700">
                      {weaknesses.map((w, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-red-500">●</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Improvements */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                  <h3 className="font-semibold text-indigo-700 mb-3">
                    🚀 ATS Improvement Suggestions
                  </h3>

                  <ul className="space-y-2 text-gray-700">
                    {weaknesses.slice(0, 4).map((w, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-indigo-500">✔</span>
                        <span>
                          {typeof w === "string"
                            ? w.substring(0, 150)
                            : "Improve this section"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="border-t pt-3 text-xs text-gray-400 flex justify-between">
                  <span>Report ID: {a.id}</span>
                  <span>AI Generated</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


  /* ---------------- Skill Gap ---------------- */
const renderSkillGap = () => {
  const list = overview?.skill_gap_analysis || [];

  if (!list.length)
    return <p className="text-gray-500">No Skill Gap Data Available</p>;

  const cleanText = (text = "") => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/---/g, "")
      .replace(/`/g, "")
      .trim();
  };

  return (
    <div className="space-y-10">
      {list.map((s, idx) => {
        const id = s.id || idx;
        const expanded = expandedSkillId === id;

        const raw = s.learning_suggestions || "";

        const sections = raw.split("###").map((sec) => sec.trim());

        const analysis =
          sections.find((sec) =>
            sec.toLowerCase().includes("analysis")
          ) || "";

        const gaps =
          sections.find((sec) =>
            sec.toLowerCase().includes("key skill")
          ) || "";

        const roadmap =
          sections.find((sec) =>
            sec.toLowerCase().includes("suggested")
          ) || "";

        const phaseBlocks = roadmap
          ? roadmap.split("Phase").slice(1).map((p) => "Phase " + p)
          : [];

        return (
          <div
            key={id}
            className="bg-white rounded-2xl shadow-xl border overflow-hidden"
          >
            {/* HEADER */}
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 cursor-pointer flex justify-between items-center"
              onClick={() =>
                setExpandedSkillId(expanded ? null : id)
              }
            >
              <div>
                <h2 className="text-xl font-bold">
                  Skill Gap Analysis
                </h2>
                <p className="opacity-90">
                  {s.preferred_role || "Software Developer"}
                </p>
              </div>

              <div className="text-2xl">
                {expanded ? "▲" : "▼"}
              </div>
            </div>

            {/* BODY */}
            <div
              className={`transition-all duration-700 overflow-hidden ${
                expanded ? "max-h-[5000px] p-8" : "max-h-0"
              }`}
            >
              <div className="space-y-10">
                {/* ANALYSIS */}
                <div className="bg-blue-50 rounded-xl p-6 border">
                  <h3 className="font-bold text-blue-700 mb-3">
                    🧠 Analysis of Your Current Skillset
                  </h3>

                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {cleanText(analysis.replace(/^.*?\n/, ""))}
                  </div>
                </div>

                {/* GAPS */}
                <div className="bg-red-50 rounded-xl p-6 border">
                  <h3 className="font-bold text-red-600 mb-3">
                    🚨 Key Skill Gaps
                  </h3>

                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {cleanText(gaps.replace(/^.*?\n/, ""))}
                  </div>
                </div>

                {/* ROADMAP */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border">
                  <h3 className="font-bold text-indigo-700 mb-6">
                    🗺 Improvement Roadmap
                  </h3>

                  <div className="relative ml-6">
                    <div className="absolute left-2 top-0 bottom-0 w-1 bg-indigo-200 rounded"></div>

                    <div className="space-y-8">
                      {phaseBlocks.map((phase, index) => {
                        const lines = cleanText(phase)
                          .split("\n")
                          .filter(Boolean);

                        const title = lines[0];
                        const steps = lines.slice(1);

                        const isOpen =
                          openPhase[id] === index;

                        return (
                          <div
                            key={index}
                            className="relative pl-10"
                          >
                            <div className="absolute left-0 top-2 w-5 h-5 bg-indigo-600 rounded-full border-4 border-white shadow animate-pulse"></div>

                            <div className="bg-white rounded-xl shadow border">
                              <div
                                className="p-4 cursor-pointer flex justify-between items-center hover:bg-indigo-50"
                                onClick={() =>
                                  setOpenPhase({
                                    ...openPhase,
                                    [id]: isOpen
                                      ? null
                                      : index,
                                  })
                                }
                              >
                                <h4 className="font-semibold text-indigo-700">
                                  {title}
                                </h4>
                                <span>
                                  {isOpen ? "−" : "+"}
                                </span>
                              </div>

                              <div
                                className={`transition-all duration-500 overflow-hidden ${
                                  isOpen
                                    ? "max-h-[1000px] p-4 pt-0"
                                    : "max-h-0"
                                }`}
                              >
                                <div className="space-y-2 text-sm text-gray-700">
                                  {steps.map((step, i) => (
                                    <div
                                      key={i}
                                      className="flex gap-2"
                                    >
                                      <span className="text-indigo-500">
                                        ➤
                                      </span>
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="text-xs text-gray-400 pt-4 border-t flex justify-between">
                  <span>ID: {id}</span>
                  <span>AI Generated</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

  /* ---------------- Ikigai ---------------- */

  const renderIkigai = () => {
  const list = overview.ikigai_analysis || [];

  if (!list.length) return <p>No Ikigai Data</p>;

  return (
    <div className="space-y-8">
      {list.map((k) => {
        const isExpanded = expandedIkigaiId === k.id;

        const centerText =
          k.ikigai_statement ||
          "Where You Truly Belong, What You’re Meant For";

        return (
          <div
            key={k.id}
            className="bg-white border rounded-xl shadow hover:shadow-lg transition"
          >
            {/* HEADER / PREVIEW */}
            <div
              className="flex items-center justify-between p-5 cursor-pointer"
              onClick={() =>
                setExpandedIkigaiId(isExpanded ? null : k.id)
              }
            >
              <div className="flex items-center gap-4">
                {/* Professional Symbol */}
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-lg">
                    IK
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Your Ikigai Blueprint
                  </h3>
                  <p className="text-sm text-gray-500">
                    Discover your purpose alignment
                  </p>
                </div>
              </div>

              <div className="text-indigo-600 font-semibold">
                {isExpanded ? "Collapse ▲" : "View ▼"}
              </div>
            </div>

            {/* EXPANDED CONTENT */}
            {isExpanded && (
              <div className="border-t p-6">

                <div className="flex flex-col lg:flex-row items-center justify-center gap-10">

                  {/* LEFT BOX */}
                  <div className="space-y-4 max-w-xs">
                    <div className="bg-pink-50 border rounded-lg p-4 shadow">
                      <h4 className="font-semibold text-pink-600 mb-1">
                        Passion
                      </h4>
                      <p className="text-sm text-gray-700">
                        {k.passion_summary}
                      </p>
                    </div>

                    <div className="bg-green-50 border rounded-lg p-4 shadow">
                      <h4 className="font-semibold text-green-600 mb-1">
                        Profession
                      </h4>
                      <p className="text-sm text-gray-700">
                        {k.profession_summary}
                      </p>
                    </div>
                  </div>

                  {/* IKIGAI SVG DIAGRAM */}
                  <div className="relative w-[420px] h-[420px]">

                    <svg
                      viewBox="0 0 400 400"
                      className="w-full h-full"
                    >
                      {/* Glow filter */}
                      <defs>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Circles */}
                      <circle
                        cx="200"
                        cy="130"
                        r="90"
                        fill="#f9a8d4"
                        fillOpacity="0.6"
                        filter="url(#glow)"
                      />
                      <circle
                        cx="130"
                        cy="230"
                        r="90"
                        fill="#86efac"
                        fillOpacity="0.6"
                        filter="url(#glow)"
                      />
                      <circle
                        cx="270"
                        cy="230"
                        r="90"
                        fill="#fde047"
                        fillOpacity="0.6"
                        filter="url(#glow)"
                      />
                      <circle
                        cx="200"
                        cy="300"
                        r="90"
                        fill="#93c5fd"
                        fillOpacity="0.6"
                        filter="url(#glow)"
                      />

                      {/* Labels */}
                      <text x="200" y="70" textAnchor="middle" fontSize="14" fontWeight="bold">
                        Passion
                      </text>

                      <text x="70" y="230" textAnchor="middle" fontSize="14" fontWeight="bold">
                        Profession
                      </text>

                      <text x="330" y="230" textAnchor="middle" fontSize="14" fontWeight="bold">
                        Mission
                      </text>

                      <text x="200" y="380" textAnchor="middle" fontSize="14" fontWeight="bold">
                        Vocation
                      </text>

                      {/* Center Circle */}
                      <circle
                        cx="200"
                        cy="215"
                        r="60"
                        fill="white"
                        stroke="#4f46e5"
                        strokeWidth="3"
                        filter="url(#glow)"
                      />

                      {/* Center Text */}
                      <foreignObject
                        x="150"
                        y="175"
                        width="100"
                        height="80"
                      >
                        <div className="text-center text-[11px] font-semibold text-gray-700 flex items-center justify-center h-full px-2">
                          {centerText}
                        </div>
                      </foreignObject>

                      {/* Arrows */}
                      <line x1="200" y1="130" x2="200" y2="70" stroke="#999" />
                      <line x1="130" y1="230" x2="70" y2="230" stroke="#999" />
                      <line x1="270" y1="230" x2="330" y2="230" stroke="#999" />
                      <line x1="200" y1="300" x2="200" y2="360" stroke="#999" />
                    </svg>
                  </div>

                  {/* RIGHT BOX */}
                  <div className="space-y-4 max-w-xs">
                    <div className="bg-yellow-50 border rounded-lg p-4 shadow">
                      <h4 className="font-semibold text-yellow-600 mb-1">
                        Mission
                      </h4>
                      <p className="text-sm text-gray-700">
                        {k.mission_summary}
                      </p>
                    </div>

                    <div className="bg-blue-50 border rounded-lg p-4 shadow">
                      <h4 className="font-semibold text-blue-600 mb-1">
                        Vocation
                      </h4>
                      <p className="text-sm text-gray-700">
                        {k.vocation_summary}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};



  /* ---------------- Career ---------------- */

  const renderCareer = () => {
  const list = overview.career_analysis || [];

  if (!list.length) return <p>No Career Data</p>;

  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/_/g, "")
      .replace(/\n/g, " ")
      .trim();
  };

  const CareerCard = ({ c }) => {
    const [open, setOpen] = useState(false);

    const skills =
      typeof c.skills === "string"
        ? c.skills.split(",").map((s) => s.trim())
        : [];

    return (
      <div className="bg-white border rounded-2xl shadow-lg overflow-hidden transition-all duration-300">

        {/* Preview */}
        <div
          onClick={() => setOpen(!open)}
          className="p-6 cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex flex-col md:flex-row md:justify-between gap-4">

            <div>
              <h3 className="text-xl font-bold text-indigo-700">
                {c.career_goal}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Tap to view full career analysis
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">

              <div className="bg-indigo-50 px-3 py-2 rounded">
                Experience: <b>{c.experience_years}</b> yrs
              </div>

              <div className="bg-purple-50 px-3 py-2 rounded max-w-[300px] truncate">
                Skills: <b>{skills.slice(0,3).join(", ")}</b>
              </div>

            </div>
          </div>

          {/* Analysis preview */}
          <p className="text-gray-600 mt-4 text-sm line-clamp-2">
            {cleanText(c.analysis).slice(0,150)}...
          </p>
        </div>

        {/* Expanded View */}
        {open && (
          <div className="border-t bg-gray-50 p-6 space-y-6">

            {/* Career Goal */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              <h4 className="font-bold text-indigo-700 mb-1">
                Career Goal
              </h4>
              <p className="text-gray-700">{c.career_goal}</p>
            </div>

            {/* Skills */}
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <h4 className="font-bold text-purple-700 mb-3">
                Relevant Skills
              </h4>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-white px-3 py-1 text-sm rounded-full border shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-700 mb-1">
                Experience
              </h4>
              <p className="text-gray-700">
                {c.experience_years} years of relevant experience
              </p>
            </div>

            {/* AI Career Analysis */}
            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h4 className="font-bold text-gray-800 mb-3">
                AI Career Insight
              </h4>

              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {cleanText(c.analysis)}
              </p>
            </div>

          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {list.map((c) => (
        <CareerCard key={c.id} c={c} />
      ))}
    </div>
  );
};

  /* ---------------- Assignments ---------------- */

  const renderAssignments = () => {
  const list = overview.assignment_evaluations || [];

  if (!list.length) return <p>No Assignment Data</p>;

  const parseData = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  };

  const AssignmentCard = ({ a }) => {
    const [open, setOpen] = useState(false);

    const a1 = parseData(a.assignment_1);
    const a2 = parseData(a.assignment_2);

    const QuestionCard = ({ q }) => {
      const [qOpen, setQOpen] = useState(false);

      return (
        <div className="border rounded-xl bg-white shadow-sm">
          <div
            className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
            onClick={() => setQOpen(!qOpen)}
          >
            <div>
              <p className="font-semibold text-gray-800">{q.question}</p>
              <p className="text-sm text-gray-500 mt-1">
                Score: {q.score ?? "-"}
              </p>
            </div>

            <span className="text-indigo-600 font-bold">
              {qOpen ? "−" : "+"}
            </span>
          </div>

          {qOpen && (
            <div className="border-t p-4 space-y-4 bg-gray-50">
              <div>
                <p className="font-semibold mb-1">Answer</p>
                <p className="text-sm whitespace-pre-line">{q.answer}</p>
              </div>

              {q.evaluation && (
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {Object.entries(q.evaluation).map(([k, v]) => (
                    <div key={k} className="bg-white p-2 rounded border">
                      <b className="capitalize">{k}:</b> {v}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    const AssignmentSection = ({ title, data, theme }) => {
      if (!data) return null;

      return (
        <div className={`rounded-xl p-5 ${theme}`}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold">{title}</h4>

            <div className="text-right text-sm">
              <p>
                Score: <b>{data.overall_score ?? "-"}</b>
              </p>
              <p>
                Result: <b>{data.result ?? "-"}</b>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(data.questions || []).map((q, i) => (
              <QuestionCard key={i} q={q} />
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white border rounded-2xl shadow-lg overflow-hidden">
        {/* Preview Header */}
        <div
          className="p-6 cursor-pointer hover:bg-gray-50"
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-indigo-700">
                {a.subject}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Tap to view detailed evaluation
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-green-50 px-3 py-2 rounded">
                A1: <b>{a1?.overall_score ?? "-"}</b> | {a1?.result ?? "-"}
              </div>

              <div className="bg-blue-50 px-3 py-2 rounded">
                A2: <b>{a2?.overall_score ?? "-"}</b> | {a2?.result ?? "-"}
              </div>

              <div className="bg-purple-50 px-3 py-2 rounded">
                Similarity: <b>{a.similarity_percent ?? 0}%</b>
              </div>

              <div className="bg-red-50 px-3 py-2 rounded">
                Plagiarism: <b>{a.plagiarism_risk ?? "-"}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded */}
        {open && (
          <div className="border-t p-6 space-y-6 bg-gray-50">
            <AssignmentSection
              title="Assignment 1"
              data={a1}
              theme="bg-green-50 border border-green-200"
            />

            <AssignmentSection
              title="Assignment 2"
              data={a2}
              theme="bg-blue-50 border border-blue-200"
            />

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border">
              <h4 className="font-bold mb-2">
                Similarity & Plagiarism Analysis
              </h4>

              <div className="flex gap-6 text-sm">
                <p>
                  Similarity Index: <b>{a.similarity_percent ?? 0}%</b>
                </p>
                <p>
                  Plagiarism Risk: <b>{a.plagiarism_risk ?? "-"}</b>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {list.map((a) => (
        <AssignmentCard key={a.id} a={a} />
      ))}
    </div>
  );
};


  /* ---------------- Quiz ---------------- */

  const renderQuiz = () => {
    const list = overview.quiz_attempts || [];

    if (!list.length) return <p>No Quiz Data</p>;

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((q) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-xl shadow border text-center"
          >
            <h3 className="font-bold text-lg">{q.subject}</h3>

            <div className="w-24 h-24 mx-auto mt-3">
              <CircularProgressbar
                value={q.percentage || 0}
                text={`${q.percentage || 0}%`}
                styles={buildStyles({
                  pathColor: "#16a34a",
                })}
              />
            </div>

            <p className="mt-3">
              <b>Score:</b> {q.total_score}
            </p>

            <p className="mt-1">
              <b>Result:</b> {q.result}
            </p>
          </div>
        ))}
      </div>
    );
  };

  /* ---------------- Tabs ---------------- */

  const tabs = [
    { key: "resumes", label: "Resumes" },
    { key: "ats", label: "ATS" },
    { key: "skill", label: "Skill Gap" },
    { key: "ikigai", label: "Ikigai" },
    { key: "career", label: "Career" },
    { key: "assignments", label: "Assignments" },
    { key: "quiz", label: "Quiz" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Overview Dashboard</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === t.key
                ? "bg-indigo-600 text-white"
                : "bg-white border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "resumes" && renderResumes()}
        {activeTab === "ats" && renderATS()}
        {activeTab === "skill" && renderSkillGap()}
        {activeTab === "ikigai" && renderIkigai()}
        {activeTab === "career" && renderCareer()}
        {activeTab === "assignments" && renderAssignments()}
        {activeTab === "quiz" && renderQuiz()}
      </div>
    </div>
  );
};

export default Overview;
