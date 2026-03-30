"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Star,
  Globe,
  Coins,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react"

/* ================= COLORS ================= */

const colors = {
  background: "#f7f5f2",
  foreground: "#3d3830",
  card: "#fffefb",
  primary: "#c45a3b",
  muted: "#eae6e0",
  mutedForeground: "#7a746a",
  accent: "#5a9a6b",
  border: "#d9d4ca",
  chart3: "#6ba3c7",
  chart4: "#d4a84b",
}

/* ================= QUESTIONS ================= */

const questions = [
  { id: 1, category: "love", question: "What do you love?" },
  { id: 2, category: "good-at", question: "What are you good at?" },
  { id: 3, category: "world-needs", question: "What does the world need?" },
  { id: 4, category: "paid-for", question: "What can you be paid for?" },
  { id: 5, category: "love", question: "What makes you lose track of time?" },
  { id: 6, category: "good-at", question: "What do people praise you for?" },
  { id: 7, category: "world-needs", question: "What problem bothers you deeply?" },
  { id: 8, category: "paid-for", question: "What value could people pay you for?" },
  { id: 9, category: "love", question: "If money didn't matter, how would you live?" },
  { id: 10, category: "good-at", question: "What skills now feel effortless?" },
]

/* ================= INTRO ================= */

function Intro({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <h1 style={{ fontSize: 64, marginBottom: 8, color: colors.primary }}>生きがい</h1>
        <p style={{ color: colors.mutedForeground, marginBottom: 32 }}>
          Discover your reason for being through reflection and clarity.
        </p>
        <button
          onClick={onStart}
          style={{
            padding: "14px 28px",
            fontSize: 18,
            background: colors.primary,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Begin Journey <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

/* ================= RESULTS ================= */

function IkigaiResults({ result, onRestart }) {
  if (!result) return null

  return (
    <div style={{ padding: 48, background: colors.background, minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 32 }}>Your Ikigai Insight</h1>

        {Object.values(result).map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <h3 style={{ marginBottom: 12 }}>{section.title}</h3>
            <p style={{ lineHeight: 1.7, color: colors.mutedForeground }}>
              {section.summary}
            </p>
          </motion.div>
        ))}

        <button
          onClick={onRestart}
          style={{
            marginTop: 24,
            padding: "12px 24px",
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={16} /> Start Over
        </button>
      </div>
    </div>
  )
}

/* ================= MAIN ================= */

export default function IkigaiPage() {
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState(null)

  const handleNext = async () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
      return
    }

    // FINAL SUBMIT → IKIGAI BACKEND
    setLoading(true)

    const payload = {}
    questions.forEach((q) => {
      payload[`${q.category}_${q.id}`] = answers[q.id] || ""
    })

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("User not logged in")
        setLoading(false)
        return
      }

      const res = await fetch("https://teachbot-backend.onrender.com/api/ikigai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.status === "success" && data.ikigai_analysis) {
        setResult(data.ikigai_analysis) // <-- IMPORTANT: Extract ikigai_analysis
        setCompleted(true)
      } else {
        console.error("Ikigai API error:", data)
        alert(data.error || "Failed to get Ikigai analysis")
      }
    } catch (err) {
      console.error("Ikigai analysis failed", err)
      alert("Failed to get Ikigai analysis. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!started) return <Intro onStart={() => setStarted(true)} />
  if (completed) return <IkigaiResults result={result} onRestart={() => location.reload()} />

  const q = questions[current]

  return (
    <div style={{ minHeight: "100vh", background: colors.background }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 48 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <h2 style={{ marginBottom: 16 }}>{q.question}</h2>
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              style={{
                width: "100%",
                minHeight: 160,
                padding: 16,
                fontSize: 16,
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
            disabled={current === 0}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[q.id]?.trim() || loading}
          >
            {loading
              ? "Analyzing..."
              : current === questions.length - 1
              ? "Complete"
              : "Continue"}{" "}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
