import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import { LINGAMS } from "./src/data/lingams";
import { AnalyticsData } from "./src/types";
import { 
  connectDB, 
  isDBConnected,
  UserRepository, 
  SOSRepository, 
  LostReportRepository 
} from "./src/db/mongodb";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Connect to MongoDB Atlas
  await connectDB();

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
       message : 'Server is healthy and running!',
    });
  });

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      const newUser = await UserRepository.create(email, password);

      res.json({ 
        message: "Registration successful!", 
        userId: newUser.id,
        storage: isDBConnected() ? "cloud" : "memory"
      });
    } catch (err: any) {
      res.status(500).json({ error: "Internal server error during registration", details: err.message });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = await UserRepository.findByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      res.json({
        message: "Login successful!",
        user: {
          id: user.id || user._id?.toString(),
          email: user.email,
          visitedIds: user.visitedIds || [],
        },
        storage: isDBConnected() ? "cloud" : "memory"
      });
    } catch (err: any) {
      res.status(500).json({ error: "Internal server error during login", details: err.message });
    }
  });

  // Progress: Check in
  app.post("/api/progress/checkin", async (req, res) => {
    const { userId, lingamId } = req.body;
    if (!userId || !lingamId) {
      return res.status(400).json({ error: "UserId and lingamId are required" });
    }

    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found. Please register or re-login." });
      }

      const targetId = parseInt(lingamId);
      if (!user.visitedIds) {
        user.visitedIds = [];
      }

      if (!user.visitedIds.includes(targetId)) {
        user.visitedIds.push(targetId);
        await UserRepository.save(user);
      }

      res.json({
        message: "Successfully checked in!",
        visitedIds: user.visitedIds,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save check-in", details: err.message });
    }
  });

  // Progress: Toggle visited
  app.post("/api/progress/toggle", async (req, res) => {
    const { userId, lingamId } = req.body;
    if (!userId || !lingamId) {
      return res.status(400).json({ error: "UserId and lingamId are required" });
    }

    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found. Please register or re-login." });
      }

      const targetId = parseInt(lingamId);
      if (!user.visitedIds) {
        user.visitedIds = [];
      }

      const existsIndex = user.visitedIds.indexOf(targetId);
      if (existsIndex > -1) {
        user.visitedIds.splice(existsIndex, 1);
      } else {
        user.visitedIds.push(targetId);
      }
      
      await UserRepository.save(user);

      res.json({
        message: "Successfully toggled progress!",
        visitedIds: user.visitedIds,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to toggle progress", details: err.message });
    }
  });

  // Progress: Get visited
  app.get("/api/progress/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ visitedIds: user.visitedIds || [] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch progress", details: err.message });
    }
  });

  // Progress: Reset
  app.post("/api/progress/reset", async (req, res) => {
    const { userId } = req.body;
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.visitedIds = [];
      await UserRepository.save(user);

      res.json({ message: "Progress reset successfully", visitedIds: [] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to reset progress", details: err.message });
    }
  });

  // SOS: Trigger Emergency
  app.post("/api/sos/trigger", async (req, res) => {
    const { type, contactName, phone, details, location } = req.body;
    if (!type || !contactName || !phone) {
      return res.status(400).json({ error: "All emergency contact details are required" });
    }

    try {
      const newAlert = await SOSRepository.create({
        type,
        contactName,
        phone,
        details,
        location: location || "Unknown Location (Sent via App GPS)",
      });

      res.status(201).json(newAlert);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to record SOS dispatch", details: err.message });
    }
  });

  // Lost & Found: Report missing person
  app.post("/api/lost-and-found/report", async (req, res) => {
    const { personName, age, lastSeenAt, description, reporterPhone } = req.body;

    if (!personName || !reporterPhone) {
      return res.status(400).json({ error: "Person name and reporter phone are required" });
    }

    try {
      const newReport = await LostReportRepository.create({
        personName,
        age: parseInt(age) || 0,
        lastSeenAt,
        description,
        reporterPhone,
      });

      res.status(201).json(newReport);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to publish missing person report", details: err.message });
    }
  });

  // Lost & Found: Fetch reports
  app.get("/api/lost-and-found/list", async (req, res) => {
    try {
      const reports = await LostReportRepository.findAll();
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch lost reports", details: err.message });
    }
  });

  // Admin: Analytics
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const usersCount = await UserRepository.count();
      const alerts = await SOSRepository.findAll();
      const reports = await LostReportRepository.findAll();

      // Total checked-in pilgrims is total users + simulation offset (for visual realism)
      const simulatedPilgrimsCount = 1450 + usersCount * 8;

      // Route popularity simulation
      const routePopularity = [
        { routeName: "Siddheshwar Main Circuit (Short Walk)", share: 45 },
        { routeName: "Inner Fort Loop (Quick Drive)", share: 30 },
        { routeName: "Traditional 68 Complete Yatra", share: 15 },
        { routeName: "Custom Optimized Pilgrimage Route", share: 10 },
      ];

      // Hour of day peak trend
      const hourlyPilgrims = [
        { hour: "06:00 AM", pilgrims: 240 },
        { hour: "08:00 AM", pilgrims: 480 },
        { hour: "10:00 AM", pilgrims: 650 },
        { hour: "12:00 PM", pilgrims: 320 },
        { hour: "02:00 PM", pilgrims: 180 },
        { hour: "04:00 PM", pilgrims: 390 },
        { hour: "06:00 PM", pilgrims: 850 }, // Evening Aarti Peak
        { hour: "08:00 PM", pilgrims: 520 },
      ];

      // Most crowded lingam based on ID (deterministic for realism)
      const mostCrowded = LINGAMS.reduce((prev, current) =>
        prev.crowdCount > current.crowdCount ? prev : current
      );

      const activeAlertsCount = alerts.filter((a: any) => a.status === "active").length +
        reports.filter((r: any) => r.status === "missing").length;

      // Crowd distribution counts
      const distribution = {
        Low: 0,
        Medium: 0,
        High: 0,
        "Very High": 0,
      };
      LINGAMS.forEach((l) => {
        distribution[l.crowdLevel as keyof typeof distribution]++;
      });

      const crowdDistribution = Object.entries(distribution).map(([level, count]) => ({
        level,
        count,
      }));

      const analytics: AnalyticsData = {
        totalPilgrims: simulatedPilgrimsCount,
        mostCrowdedLingam: mostCrowded.name,
        peakHour: "06:00 PM - 07:30 PM (Evening Aarti)",
        activeAlertsCount,
        hourlyPilgrims,
        routePopularity,
        crowdDistribution,
      };

      res.json({
        analytics,
        activeSOS: alerts.filter((a: any) => a.status === "active"),
        lostPeople: reports.filter((r: any) => r.status === "missing"),
        databaseStatus: isDBConnected() ? "online" : "fallback_mode"
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to generate admin analytics", details: err.message });
    }
  });

  // Admin: Resolve SOS Alert
  app.post("/api/admin/resolve-sos", async (req, res) => {
    const { id } = req.body;
    try {
      const alert = await SOSRepository.resolve(id);
      if (alert) {
        return res.json({ message: "SOS Alert marked as resolved" });
      }
      res.status(404).json({ error: "Alert not found" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to resolve SOS alert", details: err.message });
    }
  });

  // Admin: Resolve Lost Report
  app.post("/api/admin/resolve-lost", async (req, res) => {
    const { id } = req.body;
    try {
      const report = await LostReportRepository.resolve(id);
      if (report) {
        return res.json({ message: "Lost person marked as found" });
      }
      res.status(404).json({ error: "Report not found" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to resolve lost report", details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
