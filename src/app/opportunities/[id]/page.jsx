"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, TextArea } from "@heroui/react";
import { useSession } from "@/lib/auth.client";
import { Briefcase, Users, CalendarDays, ArrowLeft, Shield, Globe } from "lucide-react";

export default function OpportunityDetailsPage({ params }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { id } = params;

  const [opportunity, setOpportunity] = useState(null);
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [portfolioLink, setPortfolioLink] = useState("");
  const [motivation, setMotivation] = useState("");
  const [applyStatus, setApplyStatus] = useState("idle");
  const [applyError, setApplyError] = useState("");

  const userEmail = useMemo(() => {
    if (!session?.user?.email) return "";
    return String(session.user.email).trim().toLowerCase();
  }, [session]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/opportunities/${encodeURIComponent(id)}`);
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.message || "Failed to load opportunity");

        const opp = j?.opportunity;
        if (!opp) throw new Error("Opportunity not found");

        setOpportunity(opp);
        setStartup(opp?.startup || null);
      } catch (e) {
        setError(e?.message || "Failed to load opportunity details");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  useEffect(() => {
    if (!isPending && !session) return;
    // no-op
  }, [session, isPending]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError("");

    if (!session) {
      router.push("/auth/signin");
      return;
    }
    if (session?.user?.role !== "Collaborator") {
      setApplyError("Only Collaborators can apply to opportunities.");
      return;
    }

    if (!portfolioLink.trim()) {
      setApplyError("Portfolio link is required.");
      return;
    }
    if (!motivation.trim()) {
      setApplyError("Motivation message is required.");
      return;
    }

    try {
      setApplyStatus("submitting");
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: id,
          Portfolio_link: portfolioLink,
          Motivation: motivation,
          Applicant_email: userEmail,
        }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.message || "Failed to apply");

      setApplyStatus("applied");
      // Optionally clear form
      setPortfolioLink("");
      setMotivation("");
    } catch (e) {
      setApplyError(e?.message || "Failed to apply");
      setApplyStatus("idle");
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-t-2 border-l-2 border-violet-500 animate-spin mb-4" />
        <p className="text-zinc-400 animate-pulse">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <Button as={Link} href="/opportunities" variant="light" className="text-zinc-300 mb-6" startContent={<ArrowLeft size={16} />}>
            Back
          </Button>
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <Button as={Link} href="/opportunities" variant="light" className="text-zinc-300 mb-6" startContent={<ArrowLeft size={16} />}>
            Back
          </Button>
          <Card className="bg-zinc-950 border border-zinc-800 p-8 text-zinc-500 text-center">
            Opportunity not found.
          </Card>
        </div>
      </div>
    );
  }

  const isApplied = applyStatus === "applied";

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="light"
            className="text-zinc-300"
            as={Link}
            href="/opportunities"
            startContent={<ArrowLeft size={16} />}
          >
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-zinc-950 border border-zinc-800 p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center">
                  <Briefcase size={22} />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold">{opportunity.role_title}</h1>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {opportunity.work_type ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-zinc-300">
                        {opportunity.work_type}
                      </span>
                    ) : null}
                    {opportunity.commitment_level ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">
                        {opportunity.commitment_level}
                      </span>
                    ) : null}
                    {opportunity.deadline ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                        <CalendarDays size={14} /> {String(opportunity.deadline).slice(0, 10)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {opportunity.required_skills ? (
                <div className="mt-6">
                  <h2 className="text-lg font-bold">Required Skills</h2>
                  <p className="text-zinc-300 mt-2">{opportunity.required_skills}</p>
                </div>
              ) : null}

              {startup?.startup_name || opportunity.startup_id ? (
                <div className="mt-6">
                  <h2 className="text-lg font-bold">Startup</h2>
                  <div className="mt-2 flex items-center gap-2 text-zinc-300">
                    <Shield size={16} className="text-violet-400" />
                    <span className="font-semibold">
                      {startup?.startup_name || "(startup)"}
                    </span>
                  </div>
                  {startup?.logo ? (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={startup.logo}
                        alt="startup logo"
                        className="w-16 h-16 rounded-xl border border-zinc-800 object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Card>
          </div>

          <div>
            <Card className="bg-zinc-950 border border-zinc-800 p-6">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Users size={18} /> Apply to this role
              </h2>
              <p className="text-zinc-500 text-sm mb-4">Submit your portfolio and motivation.</p>

              {applyError ? (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                  {applyError}
                </div>
              ) : null}

              {isApplied ? (
                <div className="mb-4 rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400 font-semibold">
                  Applied successfully! Check your dashboard to track status.
                </div>
              ) : null}

              <form onSubmit={handleApply} className="space-y-4">
                <Input
                  label="Portfolio Link"
                  placeholder="https://github.com/your-profile or https://your-site.com"
                  variant="bordered"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  isRequired
                  disabled={isApplied}
                  className="text-white"
                />

                <TextArea
                  label="Motivation"
                  placeholder="Write a short message about why you're a fit for this role"
                  variant="bordered"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  isRequired
                  disabled={isApplied}
                />

                <Button
                  type="submit"
                  color="primary"
                  className="w-full font-bold"
                  isLoading={applyStatus === "submitting"}
                  disabled={isApplied}
                >
                  {isApplied ? "Applied" : "Apply"}
                </Button>

                {!session ? (
                  <p className="text-xs text-zinc-500">
                    Sign in to apply.
                  </p>
                ) : session.user?.role !== "Collaborator" ? (
                  <p className="text-xs text-red-300">Only Collaborators can apply.</p>
                ) : null}
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

