"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button, Input } from "@heroui/react";
import { Briefcase } from "lucide-react";

export default function BrowseOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/opportunities`);
        const j = await res.json();
        if (!res.ok) throw new Error(j?.message || "Failed to load opportunities");
        setOpportunities(Array.isArray(j?.opportunities) ? j.opportunities : []);
      } catch (e) {
        setError(e?.message || "Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = opportunities.filter((o) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      String(o.role_title || "").toLowerCase().includes(q) ||
      String(o.required_skills || "").toLowerCase().includes(q) ||
      String(o.work_type || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="text-violet-400" size={22} />
          <h1 className="text-3xl font-extrabold">Browse Opportunities</h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <Input
            label="Search"
            placeholder="Role title, skills, work type"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-md"
            variant="bordered"
          />
        </div>

        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <Card className="bg-zinc-950 border border-zinc-800 p-8 text-zinc-500 text-center">
            No opportunities found.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((o) => (
              <Card key={String(o._id)} className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-bold">{o.role_title}</h2>
                    <p className="text-zinc-400 text-sm">{o.work_type}</p>
                  </div>

                  {o.commitment_level ? (
                    <div className="text-xs text-zinc-500">
                      Commitment: {o.commitment_level}
                    </div>
                  ) : null}

                  {o.deadline ? (
                    <div className="text-xs text-zinc-500">
                      Deadline: {String(o.deadline).slice(0, 10)}
                    </div>
                  ) : null}

                  {o.required_skills ? (
                    <div className="text-sm text-zinc-300">
                      <span className="text-zinc-400">Skills:</span> {o.required_skills}
                    </div>
                  ) : null}

                  <div className="pt-2">
                    <Link href={`/opportunities/${encodeURIComponent(String(o._id))}`}>
                      <Button color="primary">View Opportunity</Button>
                    </Link>
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

