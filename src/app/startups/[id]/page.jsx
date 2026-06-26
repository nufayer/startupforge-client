"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@heroui/react";
import { Briefcase, CalendarDays, Users, ArrowLeft } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function StartupDetailsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [startup, setStartup] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      // Startup doc
      const sRes = await fetch(`${API_BASE}/startups/${encodeURIComponent(id)}`);
      const sJson = await sRes.json().catch(() => ({}));
      if (!sRes.ok) throw new Error(sJson?.message || "Failed to load startup");
      setStartup(sJson?.startup || sJson);

      // Opportunities for this startup (public browse)
      const oRes = await fetch(`${API_BASE}/opportunities?startupId=${encodeURIComponent(id)}`);
      const oJson = await oRes.json().catch(() => ({}));
      if (!oRes.ok) throw new Error(oJson?.message || "Failed to load opportunities");
      setOpportunities(Array.isArray(oJson?.opportunities) ? oJson.opportunities : []);
    } catch (e) {
      setError(e?.message || "Failed to load startup details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const countOpen = useMemo(
    () => opportunities.filter((o) => o.status === "Open").length,
    [opportunities]
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="light"
            className="text-zinc-300"
            as={Link}
            href="/startups"
            startContent={<ArrowLeft size={16} />}
          >
            Back
          </Button>
        </div>

        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : !startup ? (
          <Card className="bg-zinc-950 border border-zinc-800 p-8 text-zinc-500 text-center">
            Startup not found.
          </Card>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between mb-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-white text-2xl">
                  {(startup.startup_name || "?").charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold">{startup.startup_name}</h1>
                  <p className="text-zinc-400 mt-1">{startup.industry}</p>
                  {startup.funding_stage ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold">
                        {startup.funding_stage}
                      </span>
                      <span className="text-xs text-zinc-500">•</span>
                      <span className="text-xs text-zinc-500">{countOpen} Open Roles</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {startup.logo ? (
                <div className="mt-2 md:mt-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={startup.logo}
                    alt={`${startup.startup_name} logo`}
                    className="w-24 h-24 object-cover rounded-xl border border-zinc-800"
                  />
                </div>
              ) : null}
            </div>

            <Card className="bg-zinc-950 border border-zinc-800 p-6 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="text-violet-400" size={18} />
                <h2 className="text-xl font-bold">About</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed">{startup.description}</p>
            </Card>

            <div className="flex items-center gap-3 mb-4">
              <Users className="text-violet-400" size={20} />
              <h2 className="text-2xl font-extrabold">Opportunities</h2>
            </div>

            {opportunities.length === 0 ? (
              <Card className="bg-zinc-950 border border-zinc-800 p-8 text-zinc-500 text-center">
                No open opportunities yet.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opportunities
                  .filter((o) => o.status === "Open" || !o.status)
                  .map((o) => (
                    <Card key={String(o._id)} className="bg-zinc-950 border border-zinc-800 p-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold">{o.role_title}</h3>
                        <p className="text-sm text-zinc-400">{o.work_type}</p>

                        {o.commitment_level ? (
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="px-2 py-0.5 rounded-full bg-zinc-900/60 border border-zinc-800">
                              {o.commitment_level}
                            </span>
                          </div>
                        ) : null}

                        {o.deadline ? (
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <CalendarDays size={14} />
                            Deadline: {String(o.deadline).slice(0, 10)}
                          </div>
                        ) : null}

                        {o.required_skills ? (
                          <p className="text-sm text-zinc-300 mt-3">
                            <span className="text-zinc-400">Skills:</span> {o.required_skills}
                          </p>
                        ) : null}

                        <div className="pt-3">
                          <Button
                            as={Link}
                            href={`/opportunities/${encodeURIComponent(String(o._id))}`}
                            color="primary"
                          >
                            View Opportunity
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

