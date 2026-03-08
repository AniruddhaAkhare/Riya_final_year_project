import React, { useState } from "react";

export default function UploadForm({ onSubmit, loading }) {
  const [subject, setSubject] = useState("");
  const [files, setFiles] = useState([]);

  const handleFiles = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject) return alert("Subject required");
    if (files.length !== 2)
      return alert("Please upload exactly 2 assignments.");

    const formData = new FormData();
    formData.append("subject", subject);

    // Append both files
    formData.append("file1", files[0]);
    formData.append("file2", files[1]);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2"
          placeholder="Enter subject"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Upload 2 Assignments
        </label>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFiles}
          className="mt-1 block w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload exactly 2 PDF files
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-teal-600 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Grading..." : "Submit"}
      </button>
    </form>
  );
}
