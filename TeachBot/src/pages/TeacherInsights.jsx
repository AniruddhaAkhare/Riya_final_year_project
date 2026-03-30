import React, { useEffect, useState } from "react";
import axios from "axios";
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid
} from "recharts";

const TeacherInsights = () => {

 const [data,setData] = useState(null);

 useEffect(()=>{

  axios
   .get("https://teachbot-backend.onrender.com/teacher/analytics")
   .then(res=>setData(res.data))
   .catch(err=>console.log(err));

 },[])

 if(!data) return <div className="p-10">Loading analytics...</div>

 const careerChart = Object.keys(data.career_distribution).map(key=>({
  career:key,
  count:data.career_distribution[key]
 }))

 const colorMap = {
  strong:"bg-green-500",
  moderate:"bg-yellow-400",
  weak:"bg-red-500"
 }

 return (

 <div className="space-y-10">

 {/* ================= CARDS ================= */}

 <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

 <div className="bg-white shadow rounded-xl p-6">
 <p className="text-gray-500 text-sm">Students</p>
 <h2 className="text-3xl font-bold">{data.total_students}</h2>
 </div>

 <div className="bg-white shadow rounded-xl p-6">
 <p className="text-gray-500 text-sm">Resumes</p>
 <h2 className="text-3xl font-bold">{data.resumes_created}</h2>
 </div>

 <div className="bg-white shadow rounded-xl p-6">
 <p className="text-gray-500 text-sm">Assignments</p>
 <h2 className="text-3xl font-bold">{data.total_assignments}</h2>
 </div>

 <div className="bg-white shadow rounded-xl p-6">
 <p className="text-gray-500 text-sm">Avg ATS</p>
 <h2 className="text-3xl font-bold">{data.avg_ats_score}%</h2>
 </div>

 <div className="bg-white shadow rounded-xl p-6">
 <p className="text-gray-500 text-sm">Avg Quiz</p>
 <h2 className="text-3xl font-bold">{data.avg_quiz_score}%</h2>
 </div>

 </div>

 {/* ================= PODIUM ================= */}

 <div className="bg-white shadow rounded-xl p-8">

 <h2 className="text-xl font-bold mb-6">Top Students</h2>

 <div className="flex justify-center items-end gap-10">

 {data.top_students.map((s,i)=>{

 const height=[160,120,100][i]

 const medal=["🥇","🥈","🥉"][i]

 return(

 <div key={i} className="text-center">

 <div
 className="bg-teal-500 text-white flex items-end justify-center rounded-t-lg"
 style={{height}}
 >

 <span className="text-3xl">{medal}</span>

 </div>

 <p className="mt-2 font-semibold">{s.name}</p>

 <p className="text-gray-500">{s.overall}%</p>

 </div>

 )

 })}

 </div>

 </div>

 {/* ================= WEAK STUDENTS ================= */}

 <div className="bg-red-50 border border-red-200 p-6 rounded-xl">

 <h2 className="text-red-700 font-semibold mb-3">

 Students Needing Attention

 </h2>

 {data.weak_students.length===0 ?

 <p className="text-gray-500">No weak students 🎉</p>

 :

 data.weak_students.map((s,i)=>(
 <p key={i}>{s.name} — {s.overall}%</p>
 ))

 }

 </div>

 {/* ================= TABLE ================= */}

 <div className="bg-white shadow rounded-xl p-6">

 <h2 className="text-xl font-bold mb-4">

 Student Performance

 </h2>

 <table className="min-w-full">

 <thead className="border-b">

 <tr>

 <th className="text-left p-3">Name</th>

 <th className="text-left p-3">ATS</th>

 <th className="text-left p-3">Quiz</th>

 <th className="text-left p-3">Assignments</th>

 <th className="text-left p-3">Overall</th>

 </tr>

 </thead>

 <tbody>

 {data.student_scores.map((s,i)=>(

 <tr key={i} className="border-b">

 <td className="p-3">{s.name}</td>

 <td className="p-3">{s.ats}</td>

 <td className="p-3">{s.quiz}</td>

 <td className="p-3">{s.assignment}</td>

 <td className="p-3 font-semibold">{s.overall}</td>

 </tr>

 ))}

 </tbody>

 </table>

 </div>

 {/* ================= HEATMAP ================= */}

 <div className="bg-white shadow rounded-xl p-6">

 <h2 className="text-xl font-bold mb-4">

 Skill Gap Heatmap

 </h2>

 <table className="min-w-full">

 <thead>

 <tr>

 <th className="p-2">Student</th>
 <th className="p-2">Python</th>
 <th className="p-2">ML</th>
 <th className="p-2">SQL</th>
 <th className="p-2">Communication</th>

 </tr>

 </thead>

 <tbody>

 {data.skill_heatmap.map((row,i)=>(

 <tr key={i}>

 <td className="p-2">{row.student}</td>

 {["python","ml","sql","communication"].map(skill=>(

 <td key={skill} className="p-2">

 <div
 className={`w-6 h-6 rounded ${colorMap[row[skill]]}`}
 />

 </td>

 ))}

 </tr>

 ))}

 </tbody>

 </table>

 </div>

 {/* ================= CAREER CHART ================= */}

 <div className="bg-white shadow rounded-xl p-6">

 <h2 className="text-xl font-bold mb-4">

 Career Predictions

 </h2>

 <BarChart width={600} height={300} data={careerChart}>

 <CartesianGrid strokeDasharray="3 3"/>

 <XAxis dataKey="career"/>

 <YAxis/>

 <Tooltip/>

 <Bar dataKey="count" fill="#14b8a6"/>

 </BarChart>

 </div>

 </div>

 )

}

export default TeacherInsights