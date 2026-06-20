"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, TextArea } from "@heroui/react";
import { useSession } from "@/lib/auth.client";
import {
  Rocket,
  Briefcase,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  Check,
  X,
  User,
  Globe,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  // State for Founder Startup
  const [startup, setStartup] = useState({
    name: "AI Forge",
    description: "Building autonomous agents for industrial automation.",
    industry: "Artificial Intelligence",
    stage: "Seed",
    website: "https://aiforge.dev",
  });

  // State for Opportunities
  const [opportunities, setOpportunities] = useState([
    {
      id: "1",
      title: "Lead Frontend Engineer",
      type: "Full-time",
      equity: "1.5% - 2.5%",
      status: "Open",
      date: "2026-06-18",
    },
    {
      id: "2",
      title: "Co-Founder & CTO",
      type: "Co-Founder",
      equity: "15% - 25%",
      status: "Open",
      date: "2026-06-19",
    },
  ]);

  // State for Opportunity Form
  const [newOpportunity, setNewOpportunity] = useState({
    title: "",
    type: "Full-time",
    equity: "",
    requirements: "",
  });

  // State for Founder Applications
  const [applications, setApplications] = useState([
    {
      id: "1",
      candidateName: "Alex Rivera",
      role: "Lead Frontend Engineer",
      pitch: "I have 5 years of Next.js experience and love building complex SaaS platforms.",
      status: "Pending",
      date: "2026-06-19",
    },
    {
      id: "2",
      candidateName: "Sophia Chen",
      role: "Co-Founder & CTO",
      pitch: "Ex-Google Staff Engineer looking to join a high-growth startup at ground zero.",
      status: "Pending",
      date: "2026-06-20",
    },
  ]);

  // State for Collaborator Applications
  const [myApplications, setMyApplications] = useState([
    {
      id: "101",
      startupName: "StartupForge",
      role: "Full-stack Developer",
      status: "Accepted",
      date: "2026-06-15",
    },
    {
      id: "102",
      startupName: "BioSynth AI",
      role: "AI Researcher",
      status: "Pending",
      date: "2026-06-18",
    },
  ]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-t-2 border-l-2 border-violet-500 animate-spin mb-4"></div>
        <p className="text-zinc-400 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="text-red-500 w-16 h-16 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-zinc-400 max-w-md mb-6">
          You must be signed in to access the dashboard.
        </p>
        <Button as={Link} href="/auth/signin" color="primary">
          Go to Login
        </Button>
      </div>
    );
  }

  const role = session.user.role || "Collaborator";

  // Handlers
  const handleUpdateStartup = (e) => {
    e.preventDefault();
    alert("Startup profile updated successfully!");
  };

  const handleAddOpportunity = (e) => {
    e.preventDefault();
    if (!newOpportunity.title || !newOpportunity.equity) return;
    const opp = {
      id: Date.now().toString(),
      title: newOpportunity.title,
      type: newOpportunity.type,
      equity: newOpportunity.equity,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
    };
    setOpportunities([opp, ...opportunities]);
    setNewOpportunity({ title: "", type: "Full-time", equity: "", requirements: "" });
    setActiveTab("manage-opportunities");
  };

  const handleDeleteOpportunity = (id) => {
    setOpportunities(opportunities.filter((opp) => opp.id !== id));
  };

  const handleApplicationStatus = (id, newStatus) => {
    setApplications(
      applications.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">
              Welcome back, <span className="text-violet-400 font-semibold">{session.user.name}</span> ({role})
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <User size={16} className="text-violet-400" />
            <span className="text-sm font-medium">{session.user.email}</span>
          </div>
        </div>

        {/* Founder Dashboard Layout */}
        {role === "Founder" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <TrendingUp size={18} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("my-startup")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  activeTab === "my-startup"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Building size={18} />
                My Startup
              </button>
              <button
                onClick={() => setActiveTab("add-opportunity")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  activeTab === "add-opportunity"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Plus size={18} />
                Add Opportunity
              </button>
              <button
                onClick={() => setActiveTab("manage-opportunities")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  activeTab === "manage-opportunities"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Briefcase size={18} />
                Manage Opportunities
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  activeTab === "applications"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Users size={18} />
                Applications
                {applications.filter((a) => a.status === "Pending").length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {applications.filter((a) => a.status === "Pending").length}
                  </span>
                )}
              </button>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              
              {/* Tab: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                      <Users className="text-violet-400 mb-3" size={24} />
                      <span className="text-zinc-400 text-sm">Total Applications</span>
                      <span className="text-3xl font-extrabold mt-1">{applications.length}</span>
                    </Card>
                    <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                      <Briefcase className="text-cyan-400 mb-3" size={24} />
                      <span className="text-zinc-400 text-sm">Active Roles</span>
                      <span className="text-3xl font-extrabold mt-1">{opportunities.length}</span>
                    </Card>
                    <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                      <Rocket className="text-green-400 mb-3" size={24} />
                      <span className="text-zinc-400 text-sm">Startup Stage</span>
                      <span className="text-3xl font-extrabold mt-1">{startup.stage}</span>
                    </Card>
                  </div>

                  {/* Startup Info Panel */}
                  <Card className="bg-zinc-950 border border-zinc-800 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-xl">
                        {startup.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{startup.name}</h3>
                        <span className="text-sm text-zinc-500">{startup.industry}</span>
                      </div>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {startup.description}
                    </p>
                    {startup.website && (
                      <div className="flex items-center gap-2 mt-4 text-xs text-violet-400 hover:text-violet-300">
                        <Globe size={14} />
                        <a href={startup.website} target="_blank" rel="noreferrer">
                          {startup.website}
                        </a>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Tab: My Startup */}
              {activeTab === "my-startup" && (
                <Card className="bg-zinc-950 border border-zinc-800 p-8">
                  <h3 className="text-xl font-bold mb-6">Edit Startup Profile</h3>
                  <form onSubmit={handleUpdateStartup} className="space-y-5">
                    <Input
                      label="Startup Name"
                      variant="bordered"
                      value={startup.name}
                      onChange={(e) => setStartup({ ...startup, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Industry"
                      variant="bordered"
                      value={startup.industry}
                      onChange={(e) => setStartup({ ...startup, industry: e.target.value })}
                      required
                    />
                    <Input
                      label="Stage"
                      variant="bordered"
                      value={startup.stage}
                      onChange={(e) => setStartup({ ...startup, stage: e.target.value })}
                      required
                    />
                    <Input
                      label="Website URL"
                      variant="bordered"
                      value={startup.website}
                      onChange={(e) => setStartup({ ...startup, website: e.target.value })}
                    />
                    <TextArea
                      label="Elevator Pitch / Description"
                      variant="bordered"
                      value={startup.description}
                      onChange={(e) => setStartup({ ...startup, description: e.target.value })}
                      required
                    />
                    <Button type="submit" color="primary">
                      Save Changes
                    </Button>
                  </form>
                </Card>
              )}

              {/* Tab: Add Opportunity */}
              {activeTab === "add-opportunity" && (
                <Card className="bg-zinc-950 border border-zinc-800 p-8">
                  <h3 className="text-xl font-bold mb-6">Post a New Opportunity</h3>
                  <form onSubmit={handleAddOpportunity} className="space-y-5">
                    <Input
                      label="Role Title"
                      placeholder="e.g. Lead Full-stack Developer"
                      variant="bordered"
                      value={newOpportunity.title}
                      onChange={(e) =>
                        setNewOpportunity({ ...newOpportunity, title: e.target.value })
                      }
                      required
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-400 font-medium px-1">Job Type</label>
                      <select
                        value={newOpportunity.type}
                        onChange={(e) =>
                          setNewOpportunity({ ...newOpportunity, type: e.target.value })
                        }
                        className="w-full h-12 px-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Co-Founder">Co-Founder</option>
                      </select>
                    </div>
                    <Input
                      label="Equity Range"
                      placeholder="e.g. 0.5% - 2.0%"
                      variant="bordered"
                      value={newOpportunity.equity}
                      onChange={(e) =>
                        setNewOpportunity({ ...newOpportunity, equity: e.target.value })
                      }
                      required
                    />
                    <TextArea
                      label="Requirements & Details"
                      placeholder="List skills, stack, and mission..."
                      variant="bordered"
                      value={newOpportunity.requirements}
                      onChange={(e) =>
                        setNewOpportunity({ ...newOpportunity, requirements: e.target.value })
                      }
                    />
                    <Button type="submit" color="primary">
                      Publish Opportunity
                    </Button>
                  </form>
                </Card>
              )}

              {/* Tab: Manage Opportunities */}
              {activeTab === "manage-opportunities" && (
                <Card className="bg-zinc-950 border border-zinc-800 p-6 overflow-x-auto">
                  <h3 className="text-xl font-bold mb-6">Manage Published Opportunities</h3>
                  {opportunities.length === 0 ? (
                    <p className="text-zinc-500 text-center py-6">No opportunities published yet.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-xs">
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Equity</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opportunities.map((opp) => (
                          <tr key={opp.id} className="border-b border-zinc-900 hover:bg-zinc-900/30">
                            <td className="py-4 font-semibold text-white">{opp.title}</td>
                            <td className="py-4 text-zinc-400">{opp.type}</td>
                            <td className="py-4 text-zinc-400">{opp.equity}</td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleDeleteOpportunity(opp.id)}
                                className="p-2 text-red-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card>
              )}

              {/* Tab: Applications */}
              {activeTab === "applications" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Received Applications</h3>
                  {applications.length === 0 ? (
                    <Card className="bg-zinc-950 border border-zinc-800 p-8 text-center text-zinc-500">
                      No applications received yet.
                    </Card>
                  ) : (
                    applications.map((app) => (
                      <Card
                        key={app.id}
                        className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg text-white">{app.candidateName}</h4>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                app.status === "Accepted"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                                  : app.status === "Rejected"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400">
                            Applied for: <span className="text-violet-400 font-semibold">{app.role}</span>
                          </p>
                          <p className="text-xs text-zinc-500 italic mt-2">
                            "{app.pitch}"
                          </p>
                        </div>
                        {app.status === "Pending" && (
                          <div className="flex gap-2 self-stretch md:self-auto">
                            <Button
                              size="sm"
                              color="success"
                              className="flex-1 md:flex-none text-white font-semibold"
                              startContent={<Check size={14} />}
                              onClick={() => handleApplicationStatus(app.id, "Accepted")}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              className="flex-1 md:flex-none font-semibold"
                              startContent={<X size={14} />}
                              onClick={() => handleApplicationStatus(app.id, "Rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        ) : (
          
          /* Collaborator Dashboard Layout */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <TrendingUp size={18} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("my-applications")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  activeTab === "my-applications"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Briefcase size={18} />
                My Applications
              </button>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              
              {/* Tab: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                      <Briefcase className="text-violet-400 mb-3" size={24} />
                      <span className="text-zinc-400 text-sm">Applications Submitted</span>
                      <span className="text-3xl font-extrabold mt-1">{myApplications.length}</span>
                    </Card>
                    <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                      <CheckCircle2 className="text-green-400 mb-3" size={24} />
                      <span className="text-zinc-400 text-sm">Matches / Accepted</span>
                      <span className="text-3xl font-extrabold mt-1">
                        {myApplications.filter((a) => a.status === "Accepted").length}
                      </span>
                    </Card>
                    <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                      <Rocket className="text-cyan-400 mb-3" size={24} />
                      <span className="text-zinc-400 text-sm">Recommended Startups</span>
                      <span className="text-3xl font-extrabold mt-1">12</span>
                    </Card>
                  </div>

                  {/* Recommendation Board */}
                  <Card className="bg-zinc-950 border border-zinc-800 p-8">
                    <h3 className="text-xl font-bold mb-4">Recommended for You</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                      Based on your preferences, here are startups looking for collaborators like you:
                    </p>
                    <div className="space-y-4">
                      <div className="border border-zinc-800 rounded-xl p-4 flex justify-between items-center bg-zinc-900/20">
                        <div>
                          <h4 className="font-bold text-white">QuantumLedger</h4>
                          <p className="text-xs text-zinc-500">Security & Blockchain • Seed Stage</p>
                        </div>
                        <Button size="sm" color="primary" variant="flat">
                          View Roles
                        </Button>
                      </div>
                      <div className="border border-zinc-800 rounded-xl p-4 flex justify-between items-center bg-zinc-900/20">
                        <div>
                          <h4 className="font-bold text-white">HoloMed</h4>
                          <p className="text-xs text-zinc-500">HealthTech • Pre-seed Stage</p>
                        </div>
                        <Button size="sm" color="primary" variant="flat">
                          View Roles
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab: My Applications */}
              {activeTab === "my-applications" && (
                <Card className="bg-zinc-950 border border-zinc-800 p-6 overflow-x-auto">
                  <h3 className="text-xl font-bold mb-6">Track Your Applications</h3>
                  {myApplications.length === 0 ? (
                    <p className="text-zinc-500 text-center py-6">You haven't submitted any applications.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-xs">
                          <th className="pb-3">Startup</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myApplications.map((app) => (
                          <tr key={app.id} className="border-b border-zinc-900 hover:bg-zinc-900/30">
                            <td className="py-4 font-semibold text-white">{app.startupName}</td>
                            <td className="py-4 text-zinc-400">{app.role}</td>
                            <td className="py-4 text-zinc-500">{app.date}</td>
                            <td className="py-4 text-right">
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold inline-block ${
                                  app.status === "Accepted"
                                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                                    : app.status === "Rejected"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                    : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
