import React, { useState, useEffect } from "react";
import { Compass, Users, QrCode, ShieldAlert, Key, LogIn, UserPlus, LogOut, Compass as AdminIcon, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import RouteOptimizer from "./components/RouteOptimizer";
import CrowdHeatmap from "./components/CrowdHeatmap";
import QRCheckIn from "./components/QRCheckIn";
import EmergencySOS from "./components/EmergencySOS";
import AdminDashboard from "./components/AdminDashboard";
import { User, SOSAlert, LostReport, AnalyticsData } from "./types";

type TabId = "checkin" | "route" | "heatmap" | "sos" | "admin";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const [activeTab, setActiveTab] = useState<TabId>("checkin");
  const [visitedIds, setVisitedIds] = useState<number[]>([]);

  // Admin Data Sync
  const [adminAnalytics, setAdminAnalytics] = useState<AnalyticsData | null>(null);
  const [activeSOS, setActiveSOS] = useState<SOSAlert[]>([]);
  const [lostPeople, setLostPeople] = useState<LostReport[]>([]);

  // Load user session on startup
  useEffect(() => {
    const saved = localStorage.getItem("pilgrim_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        fetchUserProgress(parsed.id);
      } catch (e) {
        localStorage.removeItem("pilgrim_session");
      }
    }
    fetchLostReports();
  }, []);

  // Fetch metrics if admin is opened
  useEffect(() => {
    if (activeTab === "admin" || activeTab === "sos") {
      fetchAdminData();
    }
  }, [activeTab]);

  const fetchUserProgress = async (userId: string) => {
    try {
      const res = await fetch(`/api/progress/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setVisitedIds(data.visitedIds || []);
      }
    } catch (e) {
      console.error("Failed to load progress");
    }
  };

  const fetchLostReports = async () => {
    try {
      const res = await fetch("/api/lost-and-found/list");
      if (res.ok) {
        const data = await res.json();
        setLostPeople(data.filter((r: LostReport) => r.status === "missing") || []);
      }
    } catch (e) {
      console.error("Failed to fetch lost reports");
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAdminAnalytics(data.analytics);
        setActiveSOS(data.activeSOS || []);
        setLostPeople(data.lostPeople || []);
      }
    } catch (e) {
      console.error("Failed to load admin data");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!email || !password) {
      setAuthError("Please fill out all fields.");
      return;
    }

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed. Please try again.");
        return;
      }

      if (authMode === "register") {
        setAuthSuccess("Registration successful! Please log in.");
        setAuthMode("login");
        setPassword("");
      } else {
        const userObj: User = {
          id: data.user.id,
          email: data.user.email,
          visitedIds: data.user.visitedIds || [],
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(userObj);
        setVisitedIds(userObj.visitedIds);
        localStorage.setItem("pilgrim_session", JSON.stringify(userObj));
      }
    } catch (e) {
      setAuthError("Server is unreachable. Please verify server is booted.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setVisitedIds([]);
    localStorage.removeItem("pilgrim_session");
    setActiveTab("checkin");
  };

  const handleCheckIn = async (lingamId: number) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/progress/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, lingamId }),
      });

      if (res.ok) {
        const data = await res.json();
        setVisitedIds(data.visitedIds || []);
        // Save locally to keep in sync
        const updatedUser = { ...currentUser, visitedIds: data.visitedIds };
        localStorage.setItem("pilgrim_session", JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Check-in failed to sync");
    }
  };

  const handleToggleCheckIn = async (lingamId: number) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/progress/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, lingamId }),
      });

      if (res.ok) {
        const data = await res.json();
        setVisitedIds(data.visitedIds || []);
        // Save locally to keep in sync
        const updatedUser = { ...currentUser, visitedIds: data.visitedIds };
        localStorage.setItem("pilgrim_session", JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Toggle check-in failed to sync");
    }
  };

  const handleResetProgress = async () => {
    if (!currentUser) return;

    try {
      const res = await fetch("/api/progress/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (res.ok) {
        setVisitedIds([]);
        const updatedUser = { ...currentUser, visitedIds: [] };
        localStorage.setItem("pilgrim_session", JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Failed to reset progress");
    }
  };

  // SOS handler
  const handleTriggerSOS = async (type: "ambulance" | "police" | "volunteer", details: string) => {
    try {
      await fetch("/api/sos/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          contactName: currentUser?.email || "Anonymous Pilgrim",
          phone: "Sent via Live Web-app",
          details,
          location: "Siddheshwar Temple Area",
        }),
      });
      fetchAdminData();
    } catch (e) {
      console.error("SOS trigger sync failed");
    }
  };

  // Lost person submit
  const handleLostSubmit = async (report: Omit<LostReport, "id" | "timestamp" | "status">) => {
    try {
      const res = await fetch("/api/lost-and-found/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (res.ok) {
        fetchLostReports();
      }
    } catch (e) {
      console.error("Lost report sync failed");
    }
  };

  // Admin Actions: Resolve SOS
  const handleResolveSOS = async (id: string) => {
    try {
      const res = await fetch("/api/admin/resolve-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error("Failed to resolve SOS");
    }
  };

  // Admin Actions: Resolve Lost
  const handleResolveLost = async (id: string) => {
    try {
      const res = await fetch("/api/admin/resolve-lost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error("Failed to resolve lost report");
    }
  };

  // Serene authentication page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
        {/* Divine Background Shapes */}
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex w-16 h-16 rounded-3xl bg-slate-900 items-center justify-center shadow-lg border-2 border-amber-500 mb-2">
              <span className="text-2xl text-amber-500 font-bold">ॐ</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">श्री ६८ लिंग यात्रा</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-extrabold">Solapur Pilgrimage Console</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
            <h2 className="text-base font-semibold text-slate-800 text-center">
              {authMode === "login" ? "Pilgrim Credentials Sign-In" : "Register Pilgrim Card"}
            </h2>

            {authError && (
              <div className="text-xs font-semibold bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="text-xs font-semibold bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pilgrim.org"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Access PIN</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-2"
              >
                {authMode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Enter Divine Circuit</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register Access Token</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className="text-xs text-amber-700 hover:underline font-semibold"
              >
                {authMode === "login" ? "Don't have an account? Register" : "Already registered? Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Dev Server Running Message In Indicated Header */}
      <header className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-850 w-10 h-10 rounded-xl border border-amber-500/50 flex items-center justify-center font-bold text-lg text-amber-500 shadow-sm">
              ॐ
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">६८ लिंग यात्रा</h1>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                Smart Navigation & Management
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white transition-all bg-slate-800/50 rounded-xl border border-slate-800"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Panel Content Render Area */}
      <main className="flex-1 p-4 overflow-y-auto max-w-xl w-full mx-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "checkin" && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <QRCheckIn
                userId={currentUser.id}
                visitedIds={visitedIds}
                onCheckIn={handleCheckIn}
                onToggleCheckIn={handleToggleCheckIn}
                onResetProgress={handleResetProgress}
              />
            </motion.div>
          )}

          {activeTab === "route" && (
            <motion.div
              key="route"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <RouteOptimizer />
            </motion.div>
          )}

          {activeTab === "heatmap" && (
            <motion.div
              key="heatmap"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <CrowdHeatmap />
            </motion.div>
          )}

          {activeTab === "sos" && (
            <motion.div
              key="sos"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <EmergencySOS
                onTriggerSOS={handleTriggerSOS}
                onSubmitLostReport={handleLostSubmit}
                lostPeople={lostPeople}
              />
            </motion.div>
          )}

          {activeTab === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <AdminDashboard
                analytics={adminAnalytics}
                activeSOS={activeSOS}
                lostPeople={lostPeople}
                onResolveSOS={handleResolveSOS}
                onResolveLost={handleResolveLost}
                onRefresh={fetchAdminData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Styled Bottom Navigation Deck for Mobile-First Display */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-2.5 px-4 shadow-2xl z-40 max-w-xl mx-auto rounded-t-[32px]">
        <div className="grid grid-cols-5 text-center">
          {[
            { id: "checkin", icon: QrCode, label: "Scan & Yatra" },
            { id: "route", icon: Compass, label: "Optimize" },
            { id: "heatmap", icon: Users, label: "Heatmap" },
            { id: "sos", icon: ShieldAlert, label: "SOS Help" },
            { id: "admin", icon: AdminIcon, label: "Admin" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className="flex flex-col items-center justify-center space-y-1 py-1 focus:outline-none relative"
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isActive ? "bg-amber-100 text-amber-900" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <span
                  className={`text-[9px] tracking-tight font-semibold block ${
                    isActive ? "text-amber-900 font-bold" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-dot"
                    className="absolute -bottom-1 w-1 h-1 bg-amber-600 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
