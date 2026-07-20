import React, { useState } from "react";
import { ShieldAlert, PhoneCall, Users, HeartHandshake, Eye, Send, CheckCircle } from "lucide-react";
import { LostReport } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface EmergencySOSProps {
  onTriggerSOS: (type: "ambulance" | "police" | "volunteer", details: string) => void;
  onSubmitLostReport: (report: Omit<LostReport, "id" | "timestamp" | "status">) => void;
  lostPeople: LostReport[];
}

export default function EmergencySOS({ onTriggerSOS, onSubmitLostReport, lostPeople }: EmergencySOSProps) {
  const [activeSOS, setActiveSOS] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formLastSeen, setFormLastSeen] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [submitSuccess, setFormSubmitSuccess] = useState(false);

  const handlePanicSOS = (type: "ambulance" | "police" | "volunteer") => {
    setActiveSOS(type);
    onTriggerSOS(type, "Broadcasting real-time GPS coordinates to nearest dispatch tower...");
    setTimeout(() => {
      setActiveSOS(null);
      alert(`🚨 Simulated dispatch successfully routed! Solapur emergency services have locked onto your location.`);
    }, 4000);
  };

  const handleLostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    onSubmitLostReport({
      personName: formName,
      age: parseInt(formAge) || 0,
      lastSeenAt: formLastSeen,
      description: formDesc,
      reporterPhone: formPhone,
    });

    setFormName("");
    setFormAge("");
    setFormLastSeen("");
    setFormDesc("");
    setFormPhone("");
    setFormSubmitSuccess(true);

    setTimeout(() => setFormSubmitSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12" id="emergency-sos-panel">
      {/* Panic SOS Trigger Box */}
      <div className="bg-red-50/50 rounded-3xl p-6 border-2 border-red-200 text-center space-y-5 shadow-sm">
        <div className="flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-red-600 animate-pulse mb-2" />
          <h2 className="text-xl font-bold tracking-tight text-red-950">Pilgrimage Panic SOS</h2>
          <p className="text-xs text-red-700/80 leading-relaxed max-w-md mt-1">
            Tap a button below to broadcast your live GPS beacon to emergency dispatchers, nearby ambulances,
            and temple volunteer squads.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "ambulance", label: "🚑 Ambulance", color: "from-red-600 to-red-700 text-white shadow-red-200" },
            { id: "police", label: "👮 Police SOS", color: "from-blue-600 to-blue-700 text-white shadow-blue-200" },
            { id: "volunteer", label: "🤝 Volunteers", color: "from-emerald-600 to-emerald-700 text-white shadow-emerald-200" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handlePanicSOS(item.id as any)}
              className={`bg-gradient-to-br ${item.color} py-3 px-1 rounded-2xl shadow-md font-bold text-xs text-center transition-all hover:scale-105 active:scale-95`}
              disabled={activeSOS !== null}
            >
              {activeSOS === item.id ? "Pulsing... 🚨" : item.label}
            </button>
          ))}
        </div>

        {activeSOS && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs font-semibold text-red-700 animate-pulse"
          >
            Broadcasting live coordinate lock: <span className="font-mono text-red-950">17.6715° N, 75.9015° E</span>
          </motion.div>
        )}
      </div>

      {/* Immediate Helpline Directory */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center">
          <PhoneCall className="w-4 h-4 mr-1.5 text-slate-400" />
          Solapur Emergency Hotlines
        </h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
          <a
            href="tel:108"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all text-slate-700 font-semibold"
          >
            <span>Medical (108)</span>
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
          </a>
          <a
            href="tel:100"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all text-slate-700 font-semibold"
          >
            <span>Police (100)</span>
            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
          </a>
          <a
            href="tel:112"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all text-slate-700 font-semibold"
          >
            <span>Yatra Helpline</span>
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
          </a>
        </div>
      </div>

      {/* Lost & Found Console */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center space-x-3 mb-2">
          <Users className="w-8 h-8 text-amber-600" />
          <div>
            <h3 className="text-base font-bold text-slate-800">Lost & Found Coordinator</h3>
            <span className="text-xs text-slate-400">Report missing children, elders, or belongings</span>
          </div>
        </div>

        {/* Missing Person Form */}
        <form onSubmit={handleLostSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Name of Missing Person
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Suhas Sawant"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                placeholder="e.g. 12"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Last Seen Area / Temple
              </label>
              <input
                type="text"
                value={formLastSeen}
                onChange={(e) => setFormLastSeen(e.target.value)}
                placeholder="e.g. Near Shree Amrut ling"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Reporter Phone Number
              </label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Physical Description & Clothing
            </label>
            <textarea
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="e.g. Wearing yellow kurta, carrying a small black bag"
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>

          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 text-green-800 text-xs p-3 rounded-xl flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Report successfully filed! Volunteers have been alerted.</span>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Missing Report</span>
          </button>
        </form>

        {/* Active Board List */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Eye className="w-4 h-4 mr-1.5 text-slate-400" />
            Active Missing Bulletins ({lostPeople.length})
          </h4>

          {lostPeople.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-4 italic border-2 border-dashed border-slate-100 rounded-2xl">
              No missing persons reported today. Om Namah Shivaya!
            </div>
          ) : (
            <div className="space-y-2">
              {lostPeople.map((report) => (
                <div key={report.id} className="bg-red-50/30 p-4 rounded-2xl border border-red-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-950 text-sm">
                      {report.personName} (Age {report.age})
                    </span>
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Missing
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    <strong>Last Seen:</strong> {report.lastSeenAt}
                  </p>
                  <p className="text-slate-500 leading-relaxed italic">
                    "{report.description}"
                  </p>
                  <p className="text-slate-400 text-[10px] pt-1">
                    Contact Guardian: <span className="font-semibold text-slate-700">{report.reporterPhone}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
