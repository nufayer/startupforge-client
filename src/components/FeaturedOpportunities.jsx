"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button } from "@heroui/react";
import { Briefcase } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function FeaturedOpportunities() {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/opportunities`)
      .then((r) => r.json())
      .then((j) => {
        const list = Array.isArray(j?.opportunities) ? j.opportunities : [];
        setOpportunities(list.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  if (opportunities.length === 0) return null;

  return (
    <section className="w-full bg-black text-white px-6 md:px-12 py-16 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="text-cyan-400" size={22} />
            <h2 className="text-3xl font-extrabold">Featured Opportunities</h2>
          </div>
          <Link href="/opportunities">
            <Button variant="flat" color="primary" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {opportunities.map((o) => (
            <Link key={String(o._id)} href={`/opportunities/${encodeURIComponent(String(o._id))}`}>
              <Card className="bg-zinc-950 border border-zinc-800 p-6 h-full hover:border-cyan-500/50 transition-colors cursor-pointer">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">{o.role_title}</h3>
                  {o.startup_name && (
                    <p className="text-zinc-400 text-sm">at {o.startup_name}</p>
                  )}
                  {o.required_skills && (
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      <span className="text-zinc-400">Skills:</span> {o.required_skills}
                    </p>
                  )}
                  {o.work_type && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                      {o.work_type}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
