"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@heroui/react";
import { useSession } from "@/lib/auth.client";
import { API_BASE } from "@/lib/api";
import {
  Shield,
  Users,
  Building,
  Briefcase,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  CheckCircle,
  Trash2,
  Search,
  AlertCircle,
  CreditCard,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending: authPending } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStartups: 0, totalOpportunities: 0, totalRevenue: 0 });

  // Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Startups
  const [startups, setStartups] = useState([]);
  const [startupSearch, setStartupSearch] = useState("");
  const [updatingStartupId, setUpdatingStartupId] = useState(null);

  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [txSearch, setTxSearch] = useState("");

  const isAdmin = session?.user?.role === "Admin";

  // --- Data Fetching ---
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {}
  }, []);

  const fetchStartups = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/startups`);
      if (res.ok) {
        const data = await res.json();
        setStartups(data.startups || []);
      }
    } catch {}
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/transactions`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (authPending) return;
    if (!session) {
      router.replace("/auth/signin");
      return;
    }
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }
    setLoading(false);
    fetchStats();
    fetchUsers();
    fetchStartups();
    fetchTransactions();
  }, [session, authPending, isAdmin, router, fetchStats, fetchUsers, fetchStartups, fetchTransactions]);

  // --- Handlers ---
  const handleBlockUser = async (userId, currentBanned) => {
    setUpdatingUserId(userId);
    try {
      await fetch(`${API_BASE}/admin/users/${encodeURIComponent(userId)}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !currentBanned }),
      });
      await fetchUsers();
      await fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStartupStatus = async (startupId, status) => {
    setUpdatingStartupId(startupId);
    try {
      await fetch(`${API_BASE}/admin/startups/${encodeURIComponent(startupId)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchStartups();
      await fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStartupId(null);
    }
  };

  // --- Filtering ---
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredStartups = startups.filter(
    (s) =>
      s.startup_name?.toLowerCase().includes(startupSearch.toLowerCase()) ||
      s.founder_email?.toLowerCase().includes(startupSearch.toLowerCase())
  );

  const filteredTransactions = transactions.filter(
    (t) =>
      t.user?.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.id?.toLowerCase().includes(txSearch.toLowerCase())
  );

  if (authPending || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-10 h-10 border-t-2 border-l-2 border-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <Shield className="text-red-400" size={36} />
              Admin Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">
              Welcome back, <span className="text-red-400 font-semibold">{session.user.name}</span>
            </p>
          </div>
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl px-4 py-2 flex items-center gap-2">
            <Shield size={16} className="text-red-400" />
            <span className="text-sm font-medium text-red-300">Administrator</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="flex flex-col gap-2">
            {[
              { key: "overview", icon: <TrendingUp size={18} />, label: "Overview" },
              { key: "users", icon: <Users size={18} />, label: "Manage Users", badge: users.length },
              { key: "startups", icon: <Building size={18} />, label: "Manage Startups", badge: startups.length },
              { key: "transactions", icon: <CreditCard size={18} />, label: "Transactions" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  activeTab === item.key
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
                {item.badge > 0 && (
                  <span className="ml-auto bg-zinc-700 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-bold">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <Users className="text-blue-400 mb-3" size={24} />
                    <span className="text-zinc-400 text-sm">Total Users</span>
                    <span className="text-3xl font-extrabold mt-1">{stats.totalUsers}</span>
                  </Card>
                  <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <Building className="text-violet-400 mb-3" size={24} />
                    <span className="text-zinc-400 text-sm">Total Startups</span>
                    <span className="text-3xl font-extrabold mt-1">{stats.totalStartups}</span>
                  </Card>
                  <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <Briefcase className="text-cyan-400 mb-3" size={24} />
                    <span className="text-zinc-400 text-sm">Total Opportunities</span>
                    <span className="text-3xl font-extrabold mt-1">{stats.totalOpportunities}</span>
                  </Card>
                  <Card className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <DollarSign className="text-green-400 mb-3" size={24} />
                    <span className="text-zinc-400 text-sm">Total Revenue</span>
                    <span className="text-3xl font-extrabold mt-1">${stats.totalRevenue.toFixed(2)}</span>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-zinc-950 border border-zinc-800 p-6">
                  <h3 className="text-lg font-bold mb-4">Quick Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900">
                      <Users className="text-blue-400" size={20} />
                      <div>
                        <p className="text-zinc-400">Active Users</p>
                        <p className="font-bold">{users.filter((u) => !u.banned).length} / {users.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900">
                      <Building className="text-violet-400" size={20} />
                      <div>
                        <p className="text-zinc-400">Pending Startups</p>
                        <p className="font-bold">{startups.filter((s) => s.status === "Pending").length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900">
                      <DollarSign className="text-green-400" size={20} />
                      <div>
                        <p className="text-zinc-400">Paid Transactions</p>
                        <p className="font-bold">{transactions.filter((t) => t.payment_status === "Paid").length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900">
                      <UserX className="text-red-400" size={20} />
                      <div>
                        <p className="text-zinc-400">Blocked Users</p>
                        <p className="font-bold">{users.filter((u) => u.banned).length}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tab: Manage Users */}
            {activeTab === "users" && (
              <Card className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold">Manage Users</h3>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No users found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-xs">
                          <th className="pb-3">Name</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Plan</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={String(user._id)} className="border-b border-zinc-900 hover:bg-zinc-900/30">
                            <td className="py-4 font-semibold text-white">{user.name || "—"}</td>
                            <td className="py-4 text-zinc-400">{user.email}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                user.role === "Admin" ? "bg-red-500/20 text-red-400" :
                                user.role === "Founder" ? "bg-violet-500/20 text-violet-400" :
                                "bg-zinc-500/20 text-zinc-400"
                              }`}>
                                {user.role || "Collaborator"}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                user.plan === "Premium" ? "bg-yellow-500/20 text-yellow-400" : "bg-zinc-700/50 text-zinc-400"
                              }`}>
                                {user.plan || "Free"}
                              </span>
                            </td>
                            <td className="py-4">
                              {user.banned ? (
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">Blocked</span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">Active</span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              <Button
                                size="sm"
                                color={user.banned ? "success" : "danger"}
                                variant="flat"
                                isLoading={updatingUserId === String(user._id)}
                                onClick={() => handleBlockUser(String(user._id), user.banned)}
                                startContent={user.banned ? <UserCheck size={14} /> : <UserX size={14} />}
                              >
                                {user.banned ? "Unblock" : "Block"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            {/* Tab: Manage Startups */}
            {activeTab === "startups" && (
              <Card className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold">Manage Startups</h3>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      placeholder="Search startups..."
                      value={startupSearch}
                      onChange={(e) => setStartupSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>
                </div>

                {filteredStartups.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No startups found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-xs">
                          <th className="pb-3">Startup</th>
                          <th className="pb-3">Industry</th>
                          <th className="pb-3">Founder</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStartups.map((s) => (
                          <tr key={String(s._id)} className="border-b border-zinc-900 hover:bg-zinc-900/30">
                            <td className="py-4 font-semibold text-white">{s.startup_name}</td>
                            <td className="py-4 text-zinc-400">{s.industry || "—"}</td>
                            <td className="py-4 text-zinc-400 text-xs">{s.founder_email}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                s.status === "Approved" ? "bg-green-500/20 text-green-400" :
                                s.status === "Rejected" ? "bg-red-500/20 text-red-400" :
                                "bg-yellow-500/20 text-yellow-400"
                              }`}>
                                {s.status || "Pending"}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {s.status !== "Approved" && (
                                  <Button
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                    isLoading={updatingStartupId === String(s._id)}
                                    onClick={() => handleStartupStatus(String(s._id), "Approved")}
                                    startContent={<CheckCircle size={14} />}
                                  >
                                    Approve
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  isLoading={updatingStartupId === String(s._id)}
                                  onClick={() => handleStartupStatus(String(s._id), "Deleted")}
                                  startContent={<Trash2 size={14} />}
                                >
                                  Remove
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            {/* Tab: Transactions */}
            {activeTab === "transactions" && (
              <Card className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold">Transactions</h3>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      placeholder="Search by user or session..."
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No transactions found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-xs">
                          <th className="pb-3">Session ID</th>
                          <th className="pb-3">User</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-zinc-900 hover:bg-zinc-900/30">
                            <td className="py-4 font-mono text-xs text-zinc-400">{tx.id.slice(0, 20)}...</td>
                            <td className="py-4 text-white">{tx.user}</td>
                            <td className="py-4 font-bold text-green-400">${tx.amount.toFixed(2)}</td>
                            <td className="py-4 text-zinc-400">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                tx.payment_status === "Paid" ? "bg-green-500/20 text-green-400" :
                                "bg-yellow-500/20 text-yellow-400"
                              }`}>
                                {tx.payment_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
