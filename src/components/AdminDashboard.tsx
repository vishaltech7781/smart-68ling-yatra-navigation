import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Users, Bell, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AnalyticsData, SOSAlert, LostReport } from "../types";
import { motion } from "motion/react";

interface AdminDashboardProps {
  analytics: AnalyticsData | null;
  activeSOS: SOSAlert[];
  lostPeople: LostReport[];
  onResolveSOS: (id: string) => void;
  onResolveLost: (id: string) => void;
  onRefresh: () => void;
}

const COLORS = ["#10b981", "#eab308", "#f97316", "#ef4444"]; // low, medium, high, very high

export default function AdminDashboard({
  analytics,
  activeSOS,
  lostPeople,
  onResolveSOS,
  onResolveLost,
  onRefresh,
}: AdminDashboardProps) {
  useEffect(() => {
    // Auto refresh every 10 seconds for live admin telemetry
    const timer = setInterval(() => {
      onRefresh();
    }, 10000);
    return () => clearInterval(timer);
  }, [onRefresh]);

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold animate-pulse">Loading live administrative telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12" id="admin-dashboard-panel">
      {/* Overview Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 space-y-1 relative overflow-hidden">
          <Users className="w-5 h-5 text-amber-500 absolute right-4 top-4 opacity-50" />
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pilgrims</span>
          <span className="text-2xl font-bold block">{analytics.totalPilgrims}</span>
          <span className="text-[9px] text-green-400 block font-medium">● 24 active today</span>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 space-y-1 relative overflow-hidden">
          <AlertTriangle className="w-5 h-5 text-red-500 absolute right-4 top-4 opacity-50" />
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Alerts</span>
          <span className="text-2xl font-bold block text-red-400">{analytics.activeAlertsCount}</span>
          <span className="text-[9px] text-slate-400 block font-medium">SOS & Lost reports</span>
        </div>
      </div>

      {/* Crowded Highlights Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 block">Peak Load Period</span>
        <span className="text-sm font-semibold text-slate-800 block">{analytics.peakHour}</span>
        <span className="text-xs text-slate-500 block">
          Most Congested Shrine: <strong className="text-amber-800">{analytics.mostCrowdedLingam}</strong>
        </span>
      </div>

      {/* Recharts Area Chart: Hourly Pilgrim Loads */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Hourly Pilgrim Influx (Evening Peak Analysis)
        </h4>

        <div className="w-full h-44 text-[10px] font-medium font-mono text-slate-400">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.hourlyPilgrims} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPilgrims" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="pilgrims" stroke="#d97706" fillOpacity={1} fill="url(#colorPilgrims)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recharts Bar Chart: Crowd Distribution */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Temple Congestion Levels (Total 68)
        </h4>

        <div className="w-full h-40 text-[10px] font-medium font-mono text-slate-400">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.crowdDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="level" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {analytics.crowdDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Incident Dispatch Queue */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Bell className="w-5 h-5 text-red-500 animate-bounce" />
          <h3 className="font-bold text-slate-800 text-sm">Active Incident Dispatch Queue</h3>
        </div>

        {/* SOS Panic Section */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency SOS Panic Beacons</span>
          {activeSOS.length === 0 ? (
            <div className="text-xs text-slate-500 italic bg-green-50/50 p-4 rounded-2xl border border-green-100/50 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              <span>All emergency coordinate beacons successfully resolved or clear.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {activeSOS.map((sos) => (
                <div key={sos.id} className="bg-red-50 p-4 rounded-2xl border border-red-100 space-y-2.5">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-red-950 block capitalize">
                        🚨 {sos.type} SOS Requested
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Contact: {sos.contactName} ({sos.phone})
                      </span>
                    </div>
                    <button
                      onClick={() => onResolveSOS(sos.id)}
                      className="bg-red-600 hover:bg-green-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition-all flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-700 bg-white/70 p-2.5 rounded-xl border border-red-100 leading-relaxed font-mono">
                    <p className="font-bold uppercase text-[9px] text-red-900 mb-0.5">Location Beacon:</p>
                    <p>{sos.location}</p>
                    {sos.details && (
                      <p className="mt-1 border-t border-red-100/40 pt-1 text-slate-500">
                        "{sos.details}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missing Bulletins Section */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Lost & Found Bulletins</span>
          {lostPeople.length === 0 ? (
            <div className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>No active lost reports in the queue.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {lostPeople.map((report) => (
                <div key={report.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">
                        👤 Missing: {report.personName} (Age {report.age})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Reporter Contact: {report.reporterPhone}
                      </span>
                    </div>
                    <button
                      onClick={() => onResolveLost(report.id)}
                      className="bg-amber-600 hover:bg-green-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition-all flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Found</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    <p>
                      <strong>Last Seen at:</strong> {report.lastSeenAt}
                    </p>
                    {report.description && (
                      <p className="mt-1 text-slate-400 italic font-serif">"{report.description}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
