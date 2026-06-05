"use client";

import { useEffect, useState } from "react";
import AskMemory from "../components/AskMemory";
import KnowledgeGraph from "../components/KnowledgeGraph";
import UploadForm from "../components/UploadForm";

const backendUrl = "http://localhost:8000";

interface TimelineItem {
  month: string;
  events: string[];
}

interface InsightItem {
  metric: string;
  value: string;
  details: string;
}

export default function Home() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [timelineRes, insightsRes] = await Promise.all([
        fetch(`${backendUrl}/timeline`),
        fetch(`${backendUrl}/insights`),
      ]);

      if (timelineRes.ok) setTimeline(await timelineRes.json());
      if (insightsRes.ok) setInsights(await insightsRes.json());
    };
    loadData();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
      <div className="rounded-4xl border border-slate-700 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40">
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Memoria AI</p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Organizational Memory, Reimagined</h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-300">
              Build a digital brain for your organization. Capture incidents, decisions, projects, and customer feedback, then search historical memory to make smarter decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <UploadForm />
          <AskMemory />
        </div>

        <aside className="space-y-6">
          <KnowledgeGraph />

          <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/20">
            <h2 className="text-2xl font-semibold text-slate-100">Organizational Timeline</h2>
            <p className="mt-2 text-slate-400">Historical memory events grouped by month.</p>
            <div className="mt-6 space-y-4">
              {timeline.length ? (
                timeline.map((item) => (
                  <div key={item.month} className="rounded-3xl bg-slate-950/80 p-4 text-slate-100">
                    <div className="text-sm font-semibold text-slate-200">{item.month}</div>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                      {item.events.map((event, index) => (
                        <li key={index}>{event}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No timeline data available yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/20">
            <h2 className="text-2xl font-semibold text-slate-100">AI Learning Insights</h2>
            <p className="mt-2 text-slate-400">Discover trends from organizational memory as it grows.</p>
            <div className="mt-6 space-y-4">
              {insights.length ? (
                insights.map((insight) => (
                  <div key={insight.metric} className="rounded-3xl bg-slate-950/80 p-4 text-slate-100">
                    <div className="flex items-center justify-between gap-4 text-sm uppercase tracking-[0.2em] text-cyan-300">
                      <span>{insight.metric}</span>
                      <span>{insight.value}</span>
                    </div>
                    <p className="mt-3 text-slate-300">{insight.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Insight metrics will appear once memory items are ingested.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
