import React, { useState } from "react";
import { LINGAMS } from "../data/lingams";
import { Lingam } from "../types";
import { Filter, Users, ShieldAlert, CheckCircle, Map, Info, Clock } from "lucide-react";
import { motion } from "motion/react";

export default function CrowdHeatmap() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [hoveredLingam, setHoveredLingam] = useState<Lingam | null>(null);
  const [selectedLingam, setSelectedLingam] = useState<Lingam | null>(null);

  const getFilteredLingams = () => {
    if (selectedFilter === "all") return LINGAMS;
    return LINGAMS.filter((l) => l.crowdLevel.toLowerCase() === selectedFilter.toLowerCase());
  };

  const getHeatmapColor = (level: string) => {
    switch (level) {
      case "Low":
        return "rgb(34, 197, 94)"; // green-500
      case "Medium":
        return "rgb(234, 179, 8)"; // yellow-500
      case "High":
        return "rgb(249, 115, 22)"; // orange-500
      case "Very High":
        return "rgb(239, 68, 68)"; // red-500
      default:
        return "rgb(148, 163, 184)"; // slate-400
    }
  };

  const getHeatmapBg = (level: string) => {
    switch (level) {
      case "Low":
        return "rgba(34, 197, 94, 0.15)";
      case "Medium":
        return "rgba(234, 179, 8, 0.15)";
      case "High":
        return "rgba(249, 115, 22, 0.15)";
      case "Very High":
        return "rgba(239, 68, 68, 0.15)";
      default:
        return "rgba(148, 163, 184, 0.15)";
    }
  };

  const getEstimatedWaitTime = (level: string, id: number) => {
    // Deterministic wait times matching crowd levels
    const base = id % 5;
    switch (level) {
      case "Low":
        return `${5 + base} minutes`;
      case "Medium":
        return `${15 + base * 3} minutes`;
      case "High":
        return `${45 + base * 10} minutes`;
      case "Very High":
        return `${90 + base * 15} minutes`;
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12" id="crowd-heatmap-panel">
      {/* Crowd Level Filter Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-amber-600" />
            <h2 className="text-xl font-semibold tracking-tight text-slate-800">
              Live Crowd Heatmap
            </h2>
          </div>
          <span className="text-[10px] uppercase bg-amber-50 text-amber-700 font-extrabold px-2.5 py-1 rounded-full border border-amber-100 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping mr-1.5" />
            Live Analytics
          </span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Dodge long waiting lines and congested pathways. Select a category below to filter all 68
          temple locations by current density and estimated wait times.
        </p>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Temples", color: "bg-slate-100 text-slate-800 hover:bg-slate-200" },
            { id: "low", label: "🟢 Low", color: "bg-green-50 hover:bg-green-100 text-green-700" },
            { id: "medium", label: "🟡 Medium", color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700" },
            { id: "high", label: "🟠 High", color: "bg-orange-50 hover:bg-orange-100 text-orange-700" },
            { id: "very high", label: "🔴 Very High", color: "bg-red-50 hover:bg-red-100 text-red-700" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedFilter(item.id)}
              className={`text-xs font-semibold px-4 py-2.5 rounded-full border transition-all ${item.color} ${
                selectedFilter === item.id
                  ? "ring-2 ring-amber-500 border-transparent shadow-sm"
                  : "border-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 relative">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center">
          <Map className="w-4 h-4 mr-1.5 text-slate-400" />
          Interactive Solapur Map Overlay (Click Pulse Pins)
        </h3>

        {/* Custom SVG Map Canvas */}
        <div className="aspect-[4/3] bg-slate-900 rounded-2xl relative overflow-hidden shadow-inner border border-slate-950">
          {/* Decorative Map Features */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            {/* Siddheshwar Lake Grid */}
            <circle cx="50%" cy="50%" r="55" fill="#38bdf8" />
            <text x="50%" y="50%" fill="#38bdf8" textAnchor="middle" dy="-5" fontSize="10" fontWeight="bold">
              SIDDHESHWAR LAKE
            </text>
            <rect x="42%" y="45%" width="50" height="40" fill="none" stroke="#38bdf8" strokeDasharray="3 3" />

            {/* Solapur Killa (Fort) */}
            <polygon points="120,160 170,160 160,210 110,210" fill="#64748b" />
            <text x="140" y="190" fill="#94a3b8" fontSize="8" fontWeight="bold">SOLAPUR FORT</text>

            {/* City Gates */}
            <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="#1e293b" strokeWidth="1" />
            <line x1="90%" y1="10%" x2="10%" y2="90%" stroke="#1e293b" strokeWidth="1" />
          </svg>

          {/* Glowing pulse rings for all filtered Lingas */}
          {getFilteredLingams().map((lingam) => {
            // Translate GPS coordinates into absolute % coordinates for the SVG map box
            // Solapur Lat range: 17.65 to 17.69. Lng range: 75.88 to 75.93.
            const latPct = ((lingam.latitude - 17.65) / 0.04) * 100;
            const lngPct = ((lingam.longitude - 75.885) / 0.045) * 100;

            const baseColor = getHeatmapColor(lingam.crowdLevel);
            const isHovered = hoveredLingam?.id === lingam.id;
            const isSelected = selectedLingam?.id === lingam.id;

            return (
              <div
                key={lingam.id}
                className="absolute"
                style={{
                  top: `${100 - latPct}%`, // Invert lat so north is up
                  left: `${lngPct}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Heatmap Outer Dispersion Ring */}
                <div
                  className="rounded-full animate-ping absolute"
                  style={{
                    backgroundColor: baseColor,
                    width: isSelected || isHovered ? "28px" : "18px",
                    height: isSelected || isHovered ? "28px" : "18px",
                    opacity: 0.35,
                    transform: "translate(-50%, -50%)",
                    top: "50%",
                    left: "50%",
                  }}
                />

                {/* Heatmap Base Area Ring */}
                <div
                  className="rounded-full absolute"
                  style={{
                    backgroundColor: baseColor,
                    width: isSelected || isHovered ? "14px" : "8px",
                    height: isSelected || isHovered ? "14px" : "8px",
                    boxShadow: `0 0 10px ${baseColor}`,
                    transform: "translate(-50%, -50%)",
                    top: "50%",
                    left: "50%",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredLingam(lingam)}
                  onMouseLeave={() => setHoveredLingam(null)}
                  onClick={() => setSelectedLingam(lingam)}
                />
              </div>
            );
          })}

          {/* Quick Floating Hover Tooltip */}
          {hoveredLingam && (
            <div
              className="absolute bg-slate-950/90 text-white text-[11px] p-2.5 rounded-xl shadow-md border border-slate-800 z-50 pointer-events-none"
              style={{
                top: `${100 - (((hoveredLingam.latitude - 17.65) / 0.04) * 100) - 15}%`,
                left: `${((hoveredLingam.longitude - 75.885) / 0.045) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <span className="font-bold block">{hoveredLingam.name}</span>
              <span className="text-[10px] text-slate-400">Headcount: {hoveredLingam.crowdCount} pilgrims</span>
            </div>
          )}
        </div>

        {/* Selected Temple Inspector Sheet */}
        {selectedLingam ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 bg-amber-50/50 rounded-2xl p-4 border border-amber-100 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">{selectedLingam.name}</h4>
              <button
                onClick={() => setSelectedLingam(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Crowd</span>
                  <span className="font-bold text-slate-800">{selectedLingam.crowdCount} Pilgrims</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Wait Time</span>
                  <span className="font-bold text-slate-800">
                    {getEstimatedWaitTime(selectedLingam.crowdLevel, selectedLingam.id)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
              "{selectedLingam.history}"
            </p>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedLingam.latitude},${selectedLingam.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs text-center block transition-all shadow-sm"
            >
              Open Route In Google Maps
            </a>
          </motion.div>
        ) : (
          <div className="mt-4 bg-slate-50 text-slate-500 rounded-2xl p-4 text-xs text-center italic border border-slate-100 flex items-center justify-center space-x-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Select any pulsing heatmap pin on the coordinate canvas above to inspect live wait times</span>
          </div>
        )}
      </div>

      {/* Scrollable list of highly congested areas */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Pathways Congestion Checklist ({getFilteredLingams().length} Temples)
        </h4>

        <div className="grid grid-cols-1 gap-2.5">
          {getFilteredLingams().map((lingam) => (
            <div
              key={lingam.id}
              onClick={() => setSelectedLingam(lingam)}
              className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-amber-200 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[9px] uppercase bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded">
                  Temple #{lingam.id}
                </span>
                <h5 className="font-semibold text-slate-800 text-sm">{lingam.name}</h5>
                <p className="text-[10px] text-slate-400 font-medium">{lingam.location}</p>
              </div>

              <div className="text-right space-y-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    lingam.crowdLevel === "Low"
                      ? "bg-green-50 text-green-700"
                      : lingam.crowdLevel === "Medium"
                      ? "bg-yellow-50 text-yellow-700"
                      : lingam.crowdLevel === "High"
                      ? "bg-orange-50 text-orange-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {lingam.crowdLevel === "Very High"
                    ? "🔴 Very High"
                    : lingam.crowdLevel === "High"
                    ? "🟠 High"
                    : lingam.crowdLevel === "Medium"
                    ? "🟡 Medium"
                    : "🟢 Low"}
                </span>
                <span className="block text-[10px] font-medium text-slate-400">
                  {lingam.crowdCount} pilgrims live
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
