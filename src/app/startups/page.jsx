"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button } from "@heroui/react";
import { Briefcase } from "lucide-react";

export default function BrowseStartupsPage() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("http://localhost:5000/startups");
        const j = await res.json();
        if (!res.ok) throw new Error(j?.message || "Failed to load startups");
        setStartups(Array.isArray(j?.startups) ? j.startups : []);
      } catch (e) {
        setError(e?.message || "Failed to load startups");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Briefcase className="text-violet-400" size={22} />
          <h1 className="text-3xl font-extrabold">Browse Startups</h1>
        </div>

        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : startups.length === 0 ? (
          <Card className="bg-zinc-950 border border-zinc-800 p-8 text-zinc-500 text-center">
            No startups found.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {startups.map((s) => (
              <Card key={String(s._id)} className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                    {(s.startup_name || "?").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold truncate">{s.startup_name}</h2>
                    <p className="text-zinc-400 text-sm">{s.industry}</p>
                    <p className="text-zinc-500 text-sm mt-2 line-clamp-3">
                      {s.description}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold">
                        {s.funding_stage}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Link href={`/startups/${encodeURIComponent(String(s._id))}`}>
                        <Button color="primary">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

