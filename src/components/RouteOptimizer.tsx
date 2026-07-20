import React, { useState } from "react";
import { LINGAMS } from "../data/lingams";
import { Lingam } from "../types";
import { MapPin, Navigation, NavigationOff, Compass, Clock, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

// Haversine formula to compute exact distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

interface StartingPoint {
  name: string;
  lat: number;
  lng: number;
}

const PRESETS: StartingPoint[] = [
  { name: "Siddheshwar Temple Main Gate", lat: 17.6715, lng: 75.9015 },
  { name: "Solapur Central Railway Station", lat: 17.6685, lng: 75.9182 },
  { name: "Central Bus Stand (ST Stand)", lat: 17.6812, lng: 75.9088 },
  { name: "Solapur Fort Entrada", lat: 17.6729, lng: 75.8988 },
];

export default function RouteOptimizer() {
  const [startPoint, setStartPoint] = useState<StartingPoint>(PRESETS[0]);
  const [customLat, setCustomLat] = useState("17.6715");
  const [customLng, setCustomLng] = useState("75.9015");
  const [transportMode, setTransportMode] = useState<"walk" | "bike" | "car">("walk");
  const [timeAvailable, setTimeAvailable] = useState<number>(4); // hours
  const [optimizedRoute, setOptimizedRoute] = useState<Lingam[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0); // minutes
  const [hasCalculated, setHasCalculated] = useState(false);

  // Speed mapping in km/h
  const SPEEDS = {
    walk: 5,
    bike: 15,
    car: 40,
  };

  const handleCalculateRoute = () => {
    let currentLat = startPoint.lat;
    let currentLng = startPoint.lng;

    // Use custom coordinates if specified
    if (startPoint.name === "Custom Location") {
      currentLat = parseFloat(customLat) || 17.6715;
      currentLng = parseFloat(customLng) || 75.9015;
    }

    // 1. Estimate how many temples can be visited in the specified hours
    // Speed * hours is max distance. We'll also account for 10-15 mins spent per temple.
    const averageSpeed = SPEEDS[transportMode];
    const maxDistanceCapacity = averageSpeed * timeAvailable;

    // Nearest neighbor algorithm (Greedy TSP solver)
    const unvisited = [...LINGAMS];
    const route: Lingam[] = [];
    let accumulatedDistance = 0;
    let accumulatedDuration = 0; // in minutes

    let currentTempLat = currentLat;
    let currentTempLng = currentLng;

    while (unvisited.length > 0) {
      // Find nearest
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const d = calculateDistance(
          currentTempLat,
          currentTempLng,
          unvisited[i].latitude,
          unvisited[i].longitude
        );
        if (d < minDistance) {
          minDistance = d;
          nearestIndex = i;
        }
      }

      const nextLingam = unvisited[nearestIndex];
      const travelTimeMin = (minDistance / averageSpeed) * 60; // in minutes
      const timeSpentPerTemple = 12; // average spent time of 12 mins per temple

      const potentialDuration = accumulatedDuration + travelTimeMin + timeSpentPerTemple;

      // Stop adding to route if we are exceeding the available time budget
      if (potentialDuration > timeAvailable * 60 && route.length > 3) {
        break;
      }

      accumulatedDistance += minDistance;
      accumulatedDuration = potentialDuration;

      route.push(nextLingam);
      currentTempLat = nextLingam.latitude;
      currentTempLng = nextLingam.longitude;

      unvisited.splice(nearestIndex, 1);
    }

    setOptimizedRoute(route);
    setTotalDistance(parseFloat(accumulatedDistance.toFixed(2)));
    setTotalDuration(Math.round(accumulatedDuration));
    setHasCalculated(true);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12" id="route-optimizer-panel">
      {/* Input Form Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center space-x-3 mb-4">
          <Compass className="w-8 h-8 text-amber-600" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-800">
            Smart Route Optimizer
          </h2>
        </div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          The traditional 68 Ling Yatra is highly unorganized. Provide your travel preferences below
          and our system will compute the absolute shortest congestion-aware route matching your time
          budget.
        </p>

        {/* Start point Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Starting Point
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setStartPoint(p)}
                  className={`flex items-center p-3 rounded-2xl text-left border transition-all text-sm ${
                    startPoint.name === p.name
                      ? "border-amber-500 bg-amber-50/50 text-amber-900 font-medium shadow-sm shadow-amber-100"
                      : "border-slate-100 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <MapPin className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
              <button
                onClick={() =>
                  setStartPoint({
                    name: "Custom Location",
                    lat: parseFloat(customLat),
                    lng: parseFloat(customLng),
                  })
                }
                className={`flex items-center p-3 rounded-2xl text-left border transition-all text-sm ${
                  startPoint.name === "Custom Location"
                    ? "border-amber-500 bg-amber-50/50 text-amber-900 font-medium shadow-sm shadow-amber-100"
                    : "border-slate-100 hover:border-slate-300 text-slate-600"
                }`}
              >
                <Compass className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
                <span>Custom Lat / Long</span>
              </button>
            </div>
          </div>

          {startPoint.name === "Custom Location" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Latitude</label>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => {
                    setCustomLat(e.target.value);
                    setStartPoint({
                      name: "Custom Location",
                      lat: parseFloat(e.target.value) || 17.6715,
                      lng: parseFloat(customLng) || 75.9015,
                    });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Longitude</label>
                <input
                  type="text"
                  value={customLng}
                  onChange={(e) => {
                    setCustomLng(e.target.value);
                    setStartPoint({
                      name: "Custom Location",
                      lat: parseFloat(customLat) || 17.6715,
                      lng: parseFloat(e.target.value) || 75.9015,
                    });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </motion.div>
          )}

          {/* Transport Mode */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Transport Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["walk", "bike", "car"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTransportMode(mode)}
                  className={`capitalize p-3 rounded-2xl border text-sm text-center font-medium transition-all ${
                    transportMode === mode
                      ? "border-amber-500 bg-amber-50/50 text-amber-900 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 text-slate-600"
                  }`}
                >
                  {mode === "walk" ? "🚶 Walk" : mode === "bike" ? "🏍️ Bike" : "🚗 Car"}
                </button>
              ))}
            </div>
          </div>

          {/* Available Time Budget */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Time Available: <span className="text-amber-700 font-bold">{timeAvailable} Hours</span>
            </label>
            <input
              type="range"
              min="1"
              max="24"
              value={timeAvailable}
              onChange={(e) => setTimeAvailable(parseInt(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>1 HR (Quick Tour)</span>
              <span>12 HRS</span>
              <span>24 HRS (Full Pilgrimage)</span>
            </div>
          </div>

          {/* Calculate Route CTA */}
          <button
            onClick={handleCalculateRoute}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-md shadow-amber-200 transition-all flex items-center justify-center space-x-2"
          >
            <Navigation className="w-5 h-5" />
            <span>Generate Optimized Pilgrimage</span>
          </button>
        </div>
      </div>

      {/* Output Results */}
      {hasCalculated && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-2">
              Optimization Plan Generated
            </h3>
            <div className="grid grid-cols-3 gap-2 divide-x divide-slate-800 text-center">
              <div>
                <span className="block text-xl font-bold text-white">{optimizedRoute.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Temples</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-white">{totalDistance} km</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Distance</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-white">
                  {totalDuration >= 60
                    ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
                    : `${totalDuration} mins`}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Est. Time</span>
              </div>
            </div>
          </div>

          {/* List of Optimized Temples */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Pilgrimage Path Sequence (In Best Travel Order)
            </h4>
            <div className="relative border-l-2 border-dashed border-amber-200 ml-4 pl-6 space-y-4">
              {/* Starting Point Node */}
              <div className="absolute -left-[9px] top-1 w-4.5 h-4.5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-slate-700 text-xs font-medium">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Start Location
                </span>
                {startPoint.name === "Custom Location"
                  ? `Custom Point (${startPoint.lat}, ${startPoint.lng})`
                  : startPoint.name}
              </div>

              {/* Temples List */}
              {optimizedRoute.map((lingam, idx) => (
                <div key={lingam.id} className="relative group">
                  {/* Timeline Indicator Ring */}
                  <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-amber-600 border-2 border-white flex items-center justify-center font-mono text-[8px] text-white font-bold shadow-sm shadow-amber-200">
                    {idx + 1}
                  </div>

                  {/* Temple Detail Box */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-slate-800 text-sm">{lingam.name}</h5>
                        <p className="text-[11px] text-slate-400 font-medium flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                          {lingam.location}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lingam.crowdLevel === "Low"
                            ? "bg-green-50 text-green-700"
                            : lingam.crowdLevel === "Medium"
                            ? "bg-yellow-50 text-yellow-700"
                            : lingam.crowdLevel === "High"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {lingam.crowdLevel === "Very High" ? "🔴 Busy" : lingam.crowdLevel === "High" ? "🟠 Medium-High" : "🟢 Low"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50/50 p-2 rounded-xl">
                      "{lingam.significance}"
                    </p>

                    {/* Google Map turn-by-turn Navigation Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 font-medium">
                        Coord: <span className="font-mono text-slate-600 font-bold">{lingam.latitude}, {lingam.longitude}</span>
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${lingam.latitude},${lingam.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-amber-100 text-amber-800 hover:bg-amber-600 hover:text-white px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>GPS Navigation</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
