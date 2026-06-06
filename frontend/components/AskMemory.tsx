"use client";

import { FormEvent, useState } from "react";

const backendUrl = "http://localhost:8000";

interface MemoryMatch {
  id: number;
  title: string;
  category: string;
  source: string;
  content: string;
  created_at: string;
  tags: string[];
}

export default function AskMemory() {
  const [question, setQuestion] = useState("Have we faced this issue before?");
  const [answer, setAnswer] = useState<string | null>(null);
  const [matches, setMatches] = useState<MemoryMatch[]>([]);

  const handleQuery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch(`${backendUrl}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    setAnswer(data.answer);
    setMatches(data.matches || []);
  };

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/20">
      <h2 className="text-2xl font-semibold text-slate-100">Organizational Memory Search</h2>
      <p className="mt-2 text-slate-400">Ask a question and retrieve related historical knowledge from stored memories.</p>

      <form onSubmit={handleQuery} className="mt-6 space-y-4">
        <label className="space-y-2 text-sm text-slate-300">
          Question
          <input value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full px-3 py-2" />
        </label>

        <button type="submit" className="rounded-2xl bg-fuchsia-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-fuchsia-400">
          Search Memory
        </button>
      </form>

      {answer ? (
        <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-950/95 p-5 text-slate-100">
          <h3 className="text-lg font-semibold">AI Response</h3>
          <pre className="whitespace-pre-wrap pt-3 text-sm leading-6">{answer}</pre>
        </div>
      ) : null}

      {matches.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-100">Matched Memories</h3>
          {matches.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                <span>{item.category}</span>
                <span>{item.source}</span>
              </div>
              <h4 className="mt-2 text-base font-semibold text-slate-100">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-300">{item.content.slice(0, 220)}...</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
