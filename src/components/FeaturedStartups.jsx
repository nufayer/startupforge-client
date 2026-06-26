"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button } from "@heroui/react";
import { Rocket, Building } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function FeaturedStartups() {
  const [startups, setStartups] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/startups`)
      .then((r) => r.json())
      .then((j) => {
        const list = Array.isArray(j?.startups) ? j.startups : [];
        setStartups(list.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  if (startups.length === 0) return null;

  return (
    <section className="w-full bg-black text-white px-6 md:px-12 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Rocket className="text-violet-400" size={22} />
            <h2 className="text-3xl font-extrabold">Featured Startups</h2>
          </div>
          <Link href="/startups">
            <Button variant="flat" color="primary" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {startups.map((s) => (
            <Link key={String(s._id)} href={`/startups/${encodeURIComponent(String(s._id))}`}>
              <Card className="bg-zinc-950 border border-zinc-800 p-6 h-full hover:border-violet-500/50 transition-colors cursor-pointer">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                    {s.startup_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold">{s.startup_name}</h3>
                  <p className="text-zinc-400 text-sm">{s.founder_name || s.founder_email}</p>
                  {s.industry && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                      <Building size={12} />
                      {s.industry}
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
