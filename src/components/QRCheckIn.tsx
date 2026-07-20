import React, { useState } from "react";
import { LINGAMS } from "../data/lingams";
import { Lingam } from "../types";
import { QrCode, CheckCircle, Smartphone, Award, RefreshCw, Layers, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QRCheckInProps {
  userId: string | null;
  visitedIds: number[];
  onCheckIn: (id: number) => void;
  onToggleCheckIn: (id: number) => void;
  onResetProgress: () => void;
}

export default function QRCheckIn({ userId, visitedIds, onCheckIn, onToggleCheckIn, onResetProgress }: QRCheckInProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [scannedTemple, setScannedTemple] = useState<Lingam | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [emptyProgressWarning, setEmptyProgressWarning] = useState(false);

  const completionPct = LINGAMS.length > 0 ? Math.round((visitedIds.length / LINGAMS.length) * 100) : 0;

  // Handle a simulated scan success
  const handleSimulateScan = (lingam: Lingam) => {
    setScanStatus("scanning");
    setTimeout(() => {
      onCheckIn(lingam.id);
      setScannedTemple(lingam);
      setScanStatus("success");
    }, 1500);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
    setScanStatus("idle");
    setScannedTemple(null);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12" id="qr-checkin-panel">
      {/* Progress Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-0.5">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Pilgrimage Progress Tracker
            </h3>
            <span className="text-2xl font-bold block">{visitedIds.length} / 68 Completed</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg text-amber-400">
            {completionPct}%
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-4 border border-slate-700/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full"
          />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed italic text-center mb-4">
          {completionPct === 0
            ? "Your sacred journey is waiting. Check in at any temple to begin!"
            : completionPct === 100
            ? "Om Namah Shivaya! You have successfully completed the 68 Ling Yatra!"
            : "Keep going! Your spiritual milestones are unfolding with every check-in."}
        </p>

        {showResetConfirm ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 flex flex-col items-center space-y-3"
          >
            <p className="text-xs text-red-200 text-center font-medium leading-relaxed">
              Are you sure you want to reset all your checked-in progress back to 0? This will clear all <strong>Completed</strong> ticks.
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : emptyProgressWarning ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex flex-col items-center space-y-3"
          >
            <p className="text-xs text-amber-200 text-center font-medium leading-relaxed">
              Your progress is already at 0%! Use the checkboxes below or scan temple QR codes to log your pilgrimage.
            </p>
            <button
              onClick={() => setEmptyProgressWarning(false)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-6 rounded-xl text-xs transition-all cursor-pointer"
            >
              Understand
            </button>
          </motion.div>
        ) : (
          <div className="flex gap-2.5">
            <button
              onClick={() => setShowScanner(true)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4.5 h-4.5" />
              <span>Scan Temple QR Code</span>
            </button>
            <button
              onClick={() => {
                if (visitedIds.length === 0) {
                  setEmptyProgressWarning(true);
                  return;
                }
                setShowResetConfirm(true);
              }}
              className={`font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all ${
                visitedIds.length > 0
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  : "bg-slate-800/40 text-slate-500 cursor-not-allowed opacity-60"
              }`}
              title="Reset Pilgrimage Progress"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          </div>
        )}
      </div>

      {/* Checklist Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Linga Pilgrimage Checklist
        </h4>
        <p className="text-xs text-slate-500 mb-2 leading-relaxed px-1">
          Mark each lingam as visited by clicking the <strong>Visited the Ling</strong> button, or use the scanner above to simulate checking in at the physical temple.
        </p>

        <div className="grid grid-cols-1 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          {LINGAMS.map((lingam) => {
            const isVisited = visitedIds.includes(lingam.id);
            return (
              <div
                key={lingam.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex items-center justify-between gap-3 ${
                  isVisited ? "border-green-100 bg-green-50/10" : "border-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] uppercase bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded">
                        ID #{lingam.id}
                      </span>
                      {isVisited && (
                        <span className="text-[9px] uppercase bg-green-100 text-green-700 font-extrabold px-1.5 py-0.5 rounded flex items-center">
                          <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Visited
                        </span>
                      )}
                    </div>
                    <h5 className="font-semibold text-slate-800 text-sm truncate">{lingam.name}</h5>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{lingam.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lingam.latitude},${lingam.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 border border-amber-200/50 px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
                    title="GPS Navigation"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </a>
                  <button
                    onClick={() => onToggleCheckIn(lingam.id)}
                    className={`font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
                      isVisited
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                    title={isVisited ? "Mark as unvisited" : "Mark as visited"}
                  >
                    {isVisited ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Visited</span>
                      </>
                    ) : (
                      <span>Visited the Ling</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Laser Scanner Emulator Modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Scanner Emulator</h3>
                <span className="text-xs text-slate-400 block">Aarti Gate Automated Validation</span>
              </div>

              {scanStatus === "idle" && (
                <div className="space-y-4">
                  <div className="border border-slate-100 bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[160px]">
                    <Smartphone className="w-12 h-12 text-slate-400 mb-3 animate-bounce" />
                    <p className="text-xs text-slate-500">
                      Select one of the 68 temples below to test a live check-in scan.
                    </p>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                    {LINGAMS.filter((l) => !visitedIds.includes(l.id)).map((lingam) => (
                      <button
                        key={lingam.id}
                        onClick={() => handleSimulateScan(lingam)}
                        className="w-full text-left bg-slate-50 hover:bg-amber-50 p-2.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 transition-all flex justify-between"
                      >
                        <span>{lingam.name}</span>
                        <span className="text-amber-700">Scan ⚡</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {scanStatus === "scanning" && (
                <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4 relative">
                  {/* Glowing Laser Scan Frame */}
                  <div className="w-40 h-44 border-2 border-amber-500 rounded-2xl relative overflow-hidden flex items-center justify-center bg-slate-950/5 shadow-inner">
                    {/* Pulsing Scan Laser */}
                    <div className="absolute left-0 right-0 h-1 bg-amber-500 shadow-md shadow-amber-400 animate-pulse top-1/2" />
                    <QrCode className="w-16 h-16 text-slate-300 opacity-60" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold animate-pulse">
                    Validating Trishula Mandala Token...
                  </p>
                </div>
              )}

              {scanStatus === "success" && scannedTemple && (
                <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center border-2 border-green-200 shadow-md">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Checked In Successfully!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      You checked in at <span className="font-semibold text-amber-700">{scannedTemple.name}</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[10px] text-slate-400 font-mono">
                    Token ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </div>
                </div>
              )}

              <button
                onClick={handleCloseScanner}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all"
              >
                {scanStatus === "success" ? "Done" : "Cancel"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
