"use client";

import { useState } from "react";

const backendUrl = "http://localhost:8000";

export default function UploadForm() {
  const [source, setSource] = useState("Project Atlas");
  const [title, setTitle] = useState("Incident: API latency spike");
  const [category, setCategory] = useState("incident");
  const [tags, setTags] = useState("database,performance");
  const [text, setText] = useState("Server latency increased dramatically after deployment. Root cause was missing database indexes. Redis caching reduced latency by 70%.");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("source", source);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("tags", tags);

    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", text);
    }

    const response = await fetch(`${backendUrl}/ingest`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setMessage(response.ok ? data.message : `Error: ${data.detail || response.statusText}`);
  };

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/20">
      <h2 className="text-2xl font-semibold text-slate-100">Memory Ingestion</h2>
      <p className="mt-2 text-slate-400">Upload incident notes, decisions, or documentation to build organizational memory.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-300">
            Source
            <input value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2">
              <option value="incident">Incident</option>
              <option value="decision">Decision</option>
              <option value="meeting">Meeting</option>
              <option value="feedback">Feedback</option>
              <option value="documentation">Documentation</option>
              <option value="general">General</option>
            </select>
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-300">
          Tags
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma-separated" className="w-full px-3 py-2" />
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          File upload (PDF or DOCX)
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="w-full text-slate-200"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          Text content
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2"
            disabled={Boolean(file)}
          />
        </label>

        <button type="submit" className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">
          Store Memory
        </button>

        {message ? <div className="rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-200">{message}</div> : null}
      </form>
    </section>
  );
}
