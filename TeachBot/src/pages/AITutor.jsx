import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaUser } from "react-icons/fa";

const AITutor = () => {
  const [mode, setMode] = useState("answer");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/ai-tutor", {
        message: userMsg.text,
        mode
      });

      const aiMsg = {
        sender: "ai",
        text: res.data.reply
      };

      setChat((prev) => [...prev, aiMsg]);
    } catch {
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Something went wrong. Try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-teal-600 p-3 rounded-full text-white"
          >
            <FaRobot size={22} />
          </motion.div>

          <div>
            <h2 className="text-xl font-bold">AI Tutor</h2>
            <p className="text-sm text-gray-500">
              {mode === "answer"
                ? "I’ll explain concepts to you"
                : "I’ll guide you with questions"}
            </p>
          </div>
        </div>

        {/* ================= TOGGLE ================= */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Answer Me</span>

          <div
            onClick={() =>
              setMode(mode === "answer" ? "question" : "answer")
            }
            className={`w-14 h-7 flex items-center rounded-full cursor-pointer transition-all ${
              mode === "question" ? "bg-teal-600" : "bg-gray-300"
            }`}
          >
            <motion.div
              layout
              className="w-6 h-6 bg-white rounded-full shadow-md"
              animate={{
                x: mode === "question" ? 28 : 2
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>

          <span className="text-sm font-medium">Question Me</span>
        </div>
      </div>

      {/* ================= CHAT ================= */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {chat.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-xl text-sm shadow ${
                  msg.sender === "user"
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 italic"
          >
            AI is thinking...
          </motion.div>
        )}
      </div>

      {/* ================= INPUT ================= */}
      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your doubt..."
          className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          className="bg-teal-600 text-white px-6 rounded-lg font-medium"
        >
          Send
        </motion.button>
      </div>
    </div>
  );
};

export default AITutor;
