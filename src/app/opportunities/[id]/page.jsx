"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input } from "@heroui/react";
import { useSession } from "@/lib/auth.client";
import { Briefcase, Users, CalendarDays, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function OpportunityDetailsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [opportunity, setOpportunity] = useState(null);
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showApplyForm, setShowApplyForm] = useState(false);
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

        const res = await fetch(`${API_BASE}/opportunities/${encodeURIComponent(id)}`);
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
      const res = await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
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
          <Link href="/opportunities" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6">
            <ArrowLeft size={16} /> Back to Opportunities
          </Link>
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <Link href="/opportunities" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6">
            <ArrowLeft size={16} /> Back to Opportunities
          </Link>
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
        <div className="mb-6">
          <Link href="/opportunities" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm">
            <ArrowLeft size={16} /> Back to Opportunities
          </Link>
        </div>

        {/* Opportunity Details */}
        <Card className="bg-zinc-950 border border-zinc-800 p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center shrink-0">
              <Briefcase size={22} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold">{opportunity.role_title}</h1>
              <div className="mt-3 flex flex-wrap gap-3">
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
                    <CalendarDays size={14} /> Deadline: {String(opportunity.deadline).slice(0, 10)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {opportunity.required_skills ? (
            <div className="mt-6">
              <h2 className="text-lg font-bold">Required Skills</h2>
              <p className="text-zinc-300 mt-2 leading-relaxed">{opportunity.required_skills}</p>
            </div>
          ) : null}

          {startup?.startup_name ? (
            <div className="mt-6 border-t border-zinc-800 pt-6">
              <h2 className="text-lg font-bold">Startup</h2>
              <div className="mt-3 flex items-center gap-4">
                {startup.logo ? (
                  <img
                    src={startup.logo}
                    alt="startup logo"
                    className="w-12 h-12 rounded-xl border border-zinc-800 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-lg">
                    {startup.startup_name.charAt(0)}
                  </div>
                )}
                <div>
                  <Link
                    href={`/startups/${encodeURIComponent(String(startup._id || opportunity.startup_id))}`}
                    className="text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    {startup.startup_name}
                  </Link>
                  {startup.industry ? (
                    <p className="text-zinc-500 text-sm">{startup.industry}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Apply Section */}
        {!session ? (
          <Card className="bg-zinc-950 border border-zinc-800 p-8 text-center">
            <p className="text-zinc-400 mb-4">Sign in as a Collaborator to apply to this opportunity.</p>
            <Link href="/auth/signin">
              <Button color="primary">Sign In to Apply</Button>
            </Link>
          </Card>
        ) : session.user?.role !== "Collaborator" ? (
          <Card className="bg-zinc-950 border border-zinc-800 p-8 text-center">
            <p className="text-zinc-400">Only Collaborators can apply to opportunities.</p>
          </Card>
        ) : isApplied ? (
          <Card className="bg-zinc-950 border border-zinc-800 p-8 text-center">
            <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold text-green-400 mb-2">Application Submitted!</h2>
            <p className="text-zinc-400 mb-6">Your application has been sent to the founder. You can track its status from your dashboard.</p>
            <Link href="/dashboard">
              <Button color="primary">Go to Dashboard</Button>
            </Link>
          </Card>
        ) : !showApplyForm ? (
          <Card className="bg-zinc-950 border border-zinc-800 p-8 text-center">
            <Users className="text-violet-400 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Interested in this role?</h2>
            <p className="text-zinc-400 mb-6">Submit your application with your portfolio and a motivation message.</p>
            <Button color="primary" size="lg" onClick={() => setShowApplyForm(true)}>
              Apply to Opportunity
            </Button>
          </Card>
        ) : (
          <Card className="bg-zinc-950 border border-zinc-800 p-8">
            <h2 className="text-xl font-bold mb-6">Apply to Opportunity</h2>

            {applyError ? (
              <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {applyError}
              </div>
            ) : null}

            <form onSubmit={handleApply} className="space-y-5">
              <Input
                label="Opportunity ID"
                variant="bordered"
                value={id}
                disabled
                className="opacity-50"
              />

              <Input
                label="Applicant Email"
                variant="bordered"
                value={userEmail}
                disabled
                className="opacity-50"
              />

              <Input
                label="Portfolio Link"
                placeholder="https://github.com/your-profile or https://your-site.com"
                variant="bordered"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                isRequired
                className="text-white"
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-medium px-1">Motivation Message</label>
                <textarea
                  placeholder="Write a short message about why you're a fit for this role"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  required
                  className="w-full min-h-[120px] px-4 py-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors resize-y"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  color="primary"
                  className="flex-1 font-bold"
                  isLoading={applyStatus === "submitting"}
                >
                  Submit Application
                </Button>
                <Button
                  type="button"
                  variant="flat"
                  onClick={() => setShowApplyForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
