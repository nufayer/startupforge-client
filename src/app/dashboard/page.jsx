"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input } from "@heroui/react";
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
  Upload,
  CalendarDays,
  Edit,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: authPending } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  // Global loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Founder data
  const [startup, setStartup] = useState(null);
  const [startupLoading, setStartupLoading] = useState(false);
  const [hasStartup, setHasStartup] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // Create startup form
  const [newStartup, setNewStartup] = useState({
    startup_name: "",
    industry: "",
    description: "",
    funding_stage: "Pre-seed",
    logo: "",
  });
  const [creatingStartup, setCreatingStartup] = useState(false);
  const [createError, setCreateError] = useState("");
  const fileInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Edit startup form
  const [editStartup, setEditStartup] = useState({
    startup_name: "",
    industry: "",
    description: "",
    funding_stage: "",
    logo: "",
  });
  const [updatingStartup, setUpdatingStartup] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Add opportunity form
  const [newOpportunity, setNewOpportunity] = useState({
    role_title: "",
    required_skills: "",
    work_type: "Full-time",
    commitment_level: "Full-time",
    deadline: "",
  });
  const [creatingOpportunity, setCreatingOpportunity] = useState(false);
  const [opportunityError, setOpportunityError] = useState("");

  // Delete opportunity
  const [deletingOppId, setDeletingOppId] = useState(null);

  // Accept / Reject application
  const [updatingAppId, setUpdatingAppId] = useState(null);

  const userEmail = session?.user?.email ? String(session.user.email).trim().toLowerCase() : "";
  const role = session?.user?.role || "Collaborator";

  // --- Data fetching ---
  const fetchFounderData = useCallback(async () => {
    if (!userEmail || role !== "Founder") return;
    setStartupLoading(true);
    try {
      const sRes = await fetch(`/api/startups?founderEmail=${encodeURIComponent(userEmail)}`);
      const sJson = await sRes.json();
      const startups = sJson?.startups || [];
      const myStartup = startups.find((s) => s.founder_email === userEmail && s.status !== "Deleted") || null;

      setStartup(myStartup);
      setHasStartup(!!myStartup);

      if (myStartup) {
        setEditStartup({
          startup_name: myStartup.startup_name || "",
          industry: myStartup.industry || "",
          description: myStartup.description || "",
          funding_stage: myStartup.funding_stage || "",
          logo: myStartup.logo || "",
        });

        const [oppRes, appRes] = await Promise.all([
          fetch(`/api/opportunities?startupId=${encodeURIComponent(myStartup._id)}&founderView=true`),
          fetch(`/api/applications?startupId=${encodeURIComponent(myStartup._id)}`),
        ]);

        const oppJson = await oppRes.json();
        setOpportunities(oppJson?.opportunities || []);

        const appJson = await appRes.json();
        setApplications(appJson?.applications || []);
      }
    } catch (e) {
      setError(e?.message || "Failed to load data");
    } finally {
      setStartupLoading(false);
    }
  }, [userEmail, role]);

  const fetchCollaboratorData = useCallback(async () => {
    if (!userEmail || role !== "Collaborator") return;
    try {
      const res = await fetch(`/api/applications?applicantEmail=${encodeURIComponent(userEmail)}`);
      const json = await res.json();
      setMyApplications(json?.applications || []);
    } catch (e) {
      setError(e?.message || "Failed to load applications");
    }
  }, [userEmail, role]);

  useEffect(() => {
    if (authPending) return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    setLoading(true);
    Promise.all([
      role === "Founder" ? fetchFounderData() : Promise.resolve(),
      role === "Collaborator" ? fetchCollaboratorData() : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [session, authPending, role, fetchFounderData, fetchCollaboratorData, router]);

  // --- ImgBB Upload ---
  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Upload failed");
      return json.url;
    } catch (e) {
      throw e;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoSelect = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await handleLogoUpload(file);
      if (target === "create") {
        setNewStartup((prev) => ({ ...prev, logo: url }));
      } else {
        setEditStartup((prev) => ({ ...prev, logo: url }));
      }
    } catch (err) {
      alert("Logo upload failed: " + err.message);
    }
  };

  // --- Create Startup ---
  const handleCreateStartup = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!newStartup.startup_name.trim() || !newStartup.industry.trim() || !newStartup.description.trim()) {
      setCreateError("Please fill in all required fields.");
      return;
    }
    setCreatingStartup(true);
    try {
      const res = await fetch("/api/startups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStartup,
          founder_email: userEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to create startup");
      setNewStartup({ startup_name: "", industry: "", description: "", funding_stage: "Pre-seed", logo: "" });
      await fetchFounderData();
      setActiveTab("overview");
    } catch (e) {
      setCreateError(e?.message || "Failed to create startup");
    } finally {
      setCreatingStartup(false);
    }
  };

  // --- Update Startup ---
  const handleUpdateStartup = async (e) => {
    e.preventDefault();
    if (!startup) return;
    setUpdateError("");
    setUpdatingStartup(true);
    try {
      const res = await fetch(`/api/startups/${encodeURIComponent(startup._id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editStartup),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to update startup");
      await fetchFounderData();
      setActiveTab("overview");
    } catch (e) {
      setUpdateError(e?.message || "Failed to update startup");
    } finally {
      setUpdatingStartup(false);
    }
  };

  // --- Delete Startup ---
  const handleDeleteStartup = async () => {
    if (!startup) return;
    if (!confirm("Are you sure you want to delete your startup? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/startups/${encodeURIComponent(startup._id)}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.message || "Failed to delete startup");
      }
      setStartup(null);
      setHasStartup(false);
      setOpportunities([]);
      setApplications([]);
      setActiveTab("overview");
    } catch (e) {
      alert(e.message);
    }
  };

  // --- Add Opportunity ---
  const handleAddOpportunity = async (e) => {
    e.preventDefault();
    if (!startup) return;
    setOpportunityError("");
    if (!newOpportunity.role_title.trim()) {
      setOpportunityError("Role title is required.");
      return;
    }
    setCreatingOpportunity(true);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startup_id: startup._id,
          ...newOpportunity,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to create opportunity");
      setNewOpportunity({ role_title: "", required_skills: "", work_type: "Full-time", commitment_level: "Full-time", deadline: "" });
      await fetchFounderData();
      setActiveTab("manage-opportunities");
    } catch (e) {
      setOpportunityError(e?.message || "Failed to create opportunity");
    } finally {
      setCreatingOpportunity(false);
    }
  };

  // --- Delete Opportunity ---
  const handleDeleteOpportunity = async (id) => {
    setDeletingOppId(id);
    try {
      const res = await fetch(`/api/opportunities/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.message || "Failed to delete");
      }
      await fetchFounderData();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingOppId(null);
    }
  };

  // --- Accept / Reject Application ---
  const handleApplicationStatus = async (appId, status) => {
    setUpdatingAppId(appId);
    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(appId)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Status: status }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.message || "Failed to update");
      }
      await fetchFounderData();
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdatingAppId(null);
    }
  };

  // --- Render ---
  if (authPending || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-t-2 border-l-2 border-violet-500 animate-spin mb-4" />
        <p className="text-zinc-400 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-zinc-400 max-w-md mb-6">You must be signed in to access the dashboard.</p>
        <Button as={Link} href="/auth/signin" color="primary">Go to Login</Button>
      </div>
    );
  }

  // ===== FOUNDER LAYOUT =====
  if (role === "Founder") {
    // Founder has no startup yet - show create form
    if (!hasStartup && !startupLoading) {
      return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <Rocket className="text-violet-400 w-12 h-12 mx-auto mb-4" />
              <h1 className="text-4xl font-extrabold">Welcome, Founder!</h1>
              <p className="text-zinc-400 mt-2">Create your startup profile to start posting opportunities.</p>
            </div>

            <Card className="bg-zinc-950 border border-zinc-800 p-8">
              <h3 className="text-xl font-bold mb-6">Create Your Startup</h3>

              {createError && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{createError}</div>
              )}

              <form onSubmit={handleCreateStartup} className="space-y-5">
                <Input
                  label="Startup Name"
                  variant="bordered"
                  value={newStartup.startup_name}
                  onChange={(e) => setNewStartup({ ...newStartup, startup_name: e.target.value })}
                  isRequired
                />

                <div>
                  <label className="text-xs text-zinc-400 font-medium px-1 block mb-2">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => handleLogoSelect(e, "create")}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="bordered"
                      size="sm"
                      startContent={<Upload size={14} />}
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={uploadingLogo}
                    >
                      {newStartup.logo ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {newStartup.logo && (
                      <>
                        <img src={newStartup.logo} alt="logo preview" className="w-10 h-10 rounded-lg object-cover border border-zinc-700" />
                        <button
                          type="button"
                          onClick={() => setNewStartup({ ...newStartup, logo: "" })}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <Input
                  label="Industry"
                  variant="bordered"
                  value={newStartup.industry}
                  onChange={(e) => setNewStartup({ ...newStartup, industry: e.target.value })}
                  isRequired
                  placeholder="e.g. Artificial Intelligence, FinTech, HealthTech"
                />

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-400 font-medium px-1">Funding Stage</label>
                  <select
                    value={newStartup.funding_stage}
                    onChange={(e) => setNewStartup({ ...newStartup, funding_stage: e.target.value })}
                    className="w-full h-12 px-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                  >
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Series C+">Series C+</option>
                    <option value="Bootstrapped">Bootstrapped</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-400 font-medium px-1">Description</label>
                  <textarea
                    placeholder="Describe your startup's mission, vision, and what you're building..."
                    value={newStartup.description}
                    onChange={(e) => setNewStartup({ ...newStartup, description: e.target.value })}
                    required
                    className="w-full min-h-[120px] px-4 py-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors resize-y"
                  />
                </div>

                <Button type="submit" color="primary" className="w-full" isLoading={creatingStartup}>
                  Launch Startup
                </Button>
              </form>
            </Card>
          </div>
        </div>
      );
    }

    // Founder with startup - full dashboard
    const totalApplications = applications.length;
    const pendingApplications = applications.filter((a) => a.Status === "Pending").length;
    const acceptedApplications = applications.filter((a) => a.Status === "Accepted").length;
    const activeOpportunities = opportunities.filter((o) => o.status === "Open").length;

    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
              <p className="text-zinc-400 mt-1">
                Welcome back, <span className="text-violet-400 font-semibold">{session.user.name}</span> (Founder)
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-2">
              <User size={16} className="text-violet-400" />
              <span className="text-sm font-medium">{userEmail}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="flex flex-col gap-2">
              {[
                { key: "overview", icon: <TrendingUp size={18} />, label: "Overview" },
                { key: "my-startup", icon: <Building size={18} />, label: "My Startup" },
                { key: "add-opportunity", icon: <Plus size={18} />, label: "Add Opportunity" },
                { key: "manage-opportunities", icon: <Briefcase size={18} />, label: "Manage Opportunities" },
                { key: "applications", icon: <Users size={18} />, label: "Applications", badge: pendingApplications },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                    activeTab === item.key
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Tab: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                      <Users className="text-violet-400 mb-3" size={24} />
                      <span className="text-zinc-400 text-sm">Total Applications</span>
                      <span className="text-3xl font-extrabold mt-1">{totalApplications}</span>
                    </Card>
                    <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                      <Briefcase className="text-cyan-400 mb-3" size={24} />
                      <span className="text-zinc-400 text-sm">Active Roles</span>
                      <span className="text-3xl font-extrabold mt-1">{activeOpportunities}</span>
                    </Card>
                    <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                      <Rocket className="text-green-400 mb-3" size={24} />
                      <span className="text-zinc-400 text-sm">Startup Stage</span>
                      <span className="text-3xl font-extrabold mt-1">{startup?.funding_stage || "—"}</span>
                    </Card>
                  </div>

                  <Card className="bg-zinc-950 border border-zinc-800 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      {startup?.logo ? (
                        <img src={startup.logo} alt="logo" className="w-12 h-12 rounded-xl object-cover border border-zinc-700" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-xl">
                          {startup?.startup_name?.charAt(0) || "?"}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{startup?.startup_name || "My Startup"}</h3>
                        <span className="text-sm text-zinc-500">{startup?.industry || ""}</span>
                      </div>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">{startup?.description || ""}</p>
                    {startup?.logo && startup?.logo.startsWith("http") && (
                      <div className="flex items-center gap-2 mt-4 text-xs text-violet-400">
                        <ExternalLink size={14} />
                        <a href={startup.logo} target="_blank" rel="noreferrer">View Logo</a>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Tab: My Startup */}
              {activeTab === "my-startup" && (
                <Card className="bg-zinc-950 border border-zinc-800 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Edit Startup Profile</h3>
                    <Button color="danger" variant="flat" size="sm" onClick={handleDeleteStartup}>
                      Delete Startup
                    </Button>
                  </div>

                  {updateError && (
                    <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{updateError}</div>
                  )}

                  <form onSubmit={handleUpdateStartup} className="space-y-5">
                    <Input
                      label="Startup Name"
                      variant="bordered"
                      value={editStartup.startup_name}
                      onChange={(e) => setEditStartup({ ...editStartup, startup_name: e.target.value })}
                      isRequired
                    />

                    <div>
                      <label className="text-xs text-zinc-400 font-medium px-1 block mb-2">Logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoSelect(e, "edit")}
                        className="hidden"
                        id="edit-logo-upload"
                      />
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="bordered"
                          size="sm"
                          startContent={<Upload size={14} />}
                          onClick={() => document.getElementById("edit-logo-upload")?.click()}
                          isLoading={uploadingLogo}
                        >
                          {editStartup.logo ? "Change Logo" : "Upload Logo"}
                        </Button>
                        {editStartup.logo && (
                          <>
                            <img src={editStartup.logo} alt="logo" className="w-10 h-10 rounded-lg object-cover border border-zinc-700" />
                            <button
                              type="button"
                              onClick={() => setEditStartup({ ...editStartup, logo: "" })}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <Input
                      label="Industry"
                      variant="bordered"
                      value={editStartup.industry}
                      onChange={(e) => setEditStartup({ ...editStartup, industry: e.target.value })}
                      isRequired
                    />

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-400 font-medium px-1">Funding Stage</label>
                      <select
                        value={editStartup.funding_stage}
                        onChange={(e) => setEditStartup({ ...editStartup, funding_stage: e.target.value })}
                        className="w-full h-12 px-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                      >
                        <option value="Pre-seed">Pre-seed</option>
                        <option value="Seed">Seed</option>
                        <option value="Series A">Series A</option>
                        <option value="Series B">Series B</option>
                        <option value="Series C+">Series C+</option>
                        <option value="Bootstrapped">Bootstrapped</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-400 font-medium px-1">Description</label>
                      <textarea
                        value={editStartup.description}
                        onChange={(e) => setEditStartup({ ...editStartup, description: e.target.value })}
                        required
                        className="w-full min-h-[120px] px-4 py-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors resize-y"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" color="primary" isLoading={updatingStartup}>Save Changes</Button>
                      <Button type="button" variant="flat" onClick={() => setActiveTab("overview")}>Cancel</Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Tab: Add Opportunity */}
              {activeTab === "add-opportunity" && (
                <Card className="bg-zinc-950 border border-zinc-800 p-8">
                  <h3 className="text-xl font-bold mb-6">Post a New Opportunity</h3>

                  {opportunityError && (
                    <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{opportunityError}</div>
                  )}

                  <form onSubmit={handleAddOpportunity} className="space-y-5">
                    <Input
                      label="Role Title"
                      placeholder="e.g. Lead Full-stack Developer"
                      variant="bordered"
                      value={newOpportunity.role_title}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, role_title: e.target.value })}
                      isRequired
                    />

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-400 font-medium px-1">Required Skills</label>
                      <textarea
                        placeholder="e.g. React, Node.js, TypeScript, AWS (comma separated)"
                        value={newOpportunity.required_skills}
                        onChange={(e) => setNewOpportunity({ ...newOpportunity, required_skills: e.target.value })}
                        className="w-full min-h-[80px] px-4 py-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors resize-y"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-zinc-400 font-medium px-1">Work Type</label>
                        <select
                          value={newOpportunity.work_type}
                          onChange={(e) => setNewOpportunity({ ...newOpportunity, work_type: e.target.value })}
                          className="w-full h-12 px-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Co-Founder">Co-Founder</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-zinc-400 font-medium px-1">Commitment Level</label>
                        <select
                          value={newOpportunity.commitment_level}
                          onChange={(e) => setNewOpportunity({ ...newOpportunity, commitment_level: e.target.value })}
                          className="w-full h-12 px-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>
                    </div>

                    <Input
                      label="Application Deadline"
                      type="date"
                      variant="bordered"
                      value={newOpportunity.deadline}
                      onChange={(e) => setNewOpportunity({ ...newOpportunity, deadline: e.target.value })}
                    />

                    <Button type="submit" color="primary" isLoading={creatingOpportunity}>
                      Publish Opportunity
                    </Button>
                  </form>
                </Card>
              )}

              {/* Tab: Manage Opportunities */}
              {activeTab === "manage-opportunities" && (
                <Card className="bg-zinc-950 border border-zinc-800 p-6 overflow-x-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Manage Opportunities</h3>
                    <Button size="sm" color="primary" variant="flat" startContent={<Plus size={14} />} onClick={() => setActiveTab("add-opportunity")}>
                      New
                    </Button>
                  </div>

                  {opportunities.length === 0 ? (
                    <p className="text-zinc-500 text-center py-6">No opportunities published yet.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-xs">
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Work Type</th>
                          <th className="pb-3">Commitment</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opportunities.map((opp) => (
                          <tr key={String(opp._id)} className="border-b border-zinc-900 hover:bg-zinc-900/30">
                            <td className="py-4 font-semibold text-white">
                              {opp.role_title}
                              {opp.deadline && (
                                <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                  <CalendarDays size={12} /> Due: {String(opp.deadline).slice(0, 10)}
                                </div>
                              )}
                            </td>
                            <td className="py-4 text-zinc-400">{opp.work_type}</td>
                            <td className="py-4 text-zinc-400">{opp.commitment_level}</td>
                            <td className="py-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                opp.status === "Open"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                                  : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"
                              }`}>
                                {opp.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleDeleteOpportunity(opp._id)}
                                disabled={deletingOppId === opp._id}
                                className="p-2 text-red-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Received Applications</h3>
                    <div className="flex gap-2 text-sm">
                      <span className="text-zinc-500">Total: {totalApplications}</span>
                      <span className="text-yellow-400">Pending: {pendingApplications}</span>
                      <span className="text-green-400">Accepted: {acceptedApplications}</span>
                    </div>
                  </div>

                  {applications.length === 0 ? (
                    <Card className="bg-zinc-950 border border-zinc-800 p-8 text-center text-zinc-500">
                      No applications received yet.
                    </Card>
                  ) : (
                    applications.map((app) => (
                      <Card key={String(app._id)} className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg text-white">{app.Applicant_email}</h4>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                              app.Status === "Accepted"
                                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                                : app.Status === "Rejected"
                                ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {app.Status}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400">
                            Applied for: <span className="text-violet-400 font-semibold">{app.opportunity?.role_title || "Unknown role"}</span>
                          </p>
                          {app.Motivation && (
                            <p className="text-xs text-zinc-500 italic mt-2">&ldquo;{app.Motivation}&rdquo;</p>
                          )}
                          {app.Portfolio_link && (
                            <a href={app.Portfolio_link} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 mt-1">
                              <Globe size={12} /> Portfolio
                            </a>
                          )}
                        </div>
                        {app.Status === "Pending" && (
                          <div className="flex gap-2 self-stretch md:self-auto">
                            <Button
                              size="sm"
                              color="success"
                              className="flex-1 md:flex-none text-white font-semibold"
                              startContent={<Check size={14} />}
                              isLoading={updatingAppId === app._id}
                              onClick={() => handleApplicationStatus(app._id, "Accepted")}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              className="flex-1 md:flex-none font-semibold"
                              startContent={<X size={14} />}
                              isLoading={updatingAppId === app._id}
                              onClick={() => handleApplicationStatus(app._id, "Rejected")}
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
        </div>
      </div>
    );
  }

  // ===== COLLABORATOR LAYOUT =====
  const submittedCount = myApplications.length;
  const acceptedCount = myApplications.filter((a) => a.Status === "Accepted").length;
  const pendingCount = myApplications.filter((a) => a.Status === "Pending").length;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-zinc-400 mt-1">
              Welcome back, <span className="text-violet-400 font-semibold">{session.user.name}</span> (Collaborator)
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <User size={16} className="text-violet-400" />
            <span className="text-sm font-medium">{userEmail}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
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
              {pendingCount > 0 && (
                <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <Briefcase className="text-violet-400 mb-3" size={24} />
                    <span className="text-zinc-400 text-sm">Applications Submitted</span>
                    <span className="text-3xl font-extrabold mt-1">{submittedCount}</span>
                  </Card>
                  <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <CheckCircle2 className="text-green-400 mb-3" size={24} />
                    <span className="text-zinc-400 text-sm">Accepted</span>
                    <span className="text-3xl font-extrabold mt-1">{acceptedCount}</span>
                  </Card>
                  <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <AlertCircle className="text-yellow-400 mb-3" size={24} />
                    <span className="text-zinc-400 text-sm">Pending Review</span>
                    <span className="text-3xl font-extrabold mt-1">{pendingCount}</span>
                  </Card>
                </div>

                <Card className="bg-zinc-950 border border-zinc-800 p-8">
                  <h3 className="text-xl font-bold mb-4">Explore Opportunities</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    Browse startups looking for collaborators like you.
                  </p>
                  <div className="flex gap-3">
                    <Button as={Link} href="/opportunities" color="primary">
                      Browse Opportunities
                    </Button>
                    <Button as={Link} href="/startups" variant="bordered">
                      Browse Startups
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Tab: My Applications */}
            {activeTab === "my-applications" && (
              <Card className="bg-zinc-950 border border-zinc-800 p-6 overflow-x-auto">
                <h3 className="text-xl font-bold mb-6">Track Your Applications</h3>
                {myApplications.length === 0 ? (
                  <p className="text-zinc-500 text-center py-6">You haven't submitted any applications yet.</p>
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
                        <tr key={String(app._id)} className="border-b border-zinc-900 hover:bg-zinc-900/30">
                          <td className="py-4 font-semibold text-white">{app.startup_name || "Unknown Startup"}</td>
                          <td className="py-4 text-zinc-400">{app.role_title || "Unknown Role"}</td>
                          <td className="py-4 text-zinc-500">{app.applied_at ? String(app.applied_at).slice(0, 10) : "—"}</td>
                          <td className="py-4 text-right">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold inline-block ${
                              app.Status === "Accepted"
                                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                                : app.Status === "Rejected"
                                ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {app.Status}
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
      </div>
    </div>
  );
}
