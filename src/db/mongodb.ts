import mongoose, { Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// We check if MONGODB_URI is provided
let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  if (!MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI environment variable is missing! MongoDB connection is not established.");
    console.warn("Please add MONGODB_URI to your .env file or platform secrets to enable cloud database storage.");
    return;
  }

  try {
    // Disable buffering so that queries fail instantly rather than hanging if the connection is lost
    mongoose.set("bufferCommands", false);
    
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000, // Fast 4 second timeout instead of hanging
    });
    isConnected = db.connection.readyState === 1;
    console.log("⚡ MongoDB Atlas connected successfully!");
  } catch (error) {
    isConnected = false;
    console.error("❌ MongoDB Atlas connection error:", error);
    console.warn("⚠️  Falling back to Safe In-Memory database storage. App will remain fully functional for presentations!");
  }
}

// Check MongoDB connection status helper
export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

// ------------------------------------------------------------------
// In-Memory Storage Fallback (Ensures presentation readiness)
// ------------------------------------------------------------------
const inMemoryUsers: any[] = [];
const inMemorySOS: any[] = [];
const inMemoryLost: any[] = [];

// ------------------------------------------------------------------
// schemas & Models
// ------------------------------------------------------------------

// 1. User Schema
const UserSchema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    visitedIds: { 
      type: [Number], 
      default: [] 
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// 2. SOS Alert Schema
const SOSAlertSchema = new Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true 
    },
    type: { 
      type: String, 
      required: true, 
      enum: ["ambulance", "police", "volunteer", "lost_person"] 
    },
    contactName: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      required: true 
    },
    details: { 
      type: String, 
      default: "" 
    },
    location: { 
      type: String, 
      default: "Unknown Location" 
    },
    timestamp: { 
      type: String, 
      default: () => new Date().toISOString() 
    },
    status: { 
      type: String, 
      default: "active", 
      enum: ["active", "resolved"] 
    }
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// 3. Lost Report Schema
const LostReportSchema = new Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true 
    },
    personName: { 
      type: String, 
      required: true 
    },
    age: { 
      type: Number, 
      default: 0 
    },
    lastSeenAt: { 
      type: String, 
      default: "" 
    },
    description: { 
      type: String, 
      default: "" 
    },
    reporterPhone: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: String, 
      default: () => new Date().toISOString() 
    },
    status: { 
      type: String, 
      default: "missing", 
      enum: ["missing", "found"] 
    }
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = (mongoose.models.User || mongoose.model("User", UserSchema)) as any;
export const SOSAlertModel = (mongoose.models.SOSAlert || mongoose.model("SOSAlert", SOSAlertSchema)) as any;
export const LostReportModel = (mongoose.models.LostReport || mongoose.model("LostReport", LostReportSchema)) as any;

// ------------------------------------------------------------------
// Clean Repository Layer with Dynamic Fallbacks
// ------------------------------------------------------------------

export const UserRepository = {
  async findByEmail(email: string) {
    if (isDBConnected()) {
      try {
        return await User.findOne({ email: email.toLowerCase() });
      } catch (err) {
        console.warn("⚠️ database connection error, checking in-memory:", err);
      }
    }
    const localUser = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    return localUser ? { ...localUser, save: async function() { return this; } } : null;
  },

  async findById(id: string) {
    if (isDBConnected()) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return await User.findById(id);
        }
      } catch (err) {
        console.warn("⚠️ database connection error, checking in-memory:", err);
      }
    }
    const localUser = inMemoryUsers.find((u) => u.id === id);
    return localUser ? { ...localUser, save: async function() { return this; } } : null;
  },

  async create(email: string, password: string) {
    if (isDBConnected()) {
      try {
        const newUser = new User({
          email: email.toLowerCase(),
          password,
          visitedIds: [],
        });
        await newUser.save();
        return newUser;
      } catch (err) {
        console.warn("⚠️ database connection error, saving to in-memory:", err);
      }
    }
    const newUser = {
      id: Math.random().toString(36).substring(2, 11),
      email: email.toLowerCase(),
      password,
      visitedIds: [] as number[],
      createdAt: new Date(),
      save: async function() {
        return this;
      }
    };
    inMemoryUsers.push(newUser);
    return newUser;
  },

  async save(userObj: any) {
    if (isDBConnected() && typeof userObj.save === "function" && userObj instanceof mongoose.Document) {
      try {
        await userObj.save();
        return userObj;
      } catch (err) {
        console.warn("⚠️ Failed to save to MongoDB Atlas, updating in-memory:", err);
      }
    }
    
    // Fallback/direct object save
    const index = inMemoryUsers.findIndex((u) => u.id === userObj.id || u.email === userObj.email);
    if (index > -1) {
      inMemoryUsers[index].visitedIds = [...userObj.visitedIds];
    } else {
      inMemoryUsers.push(userObj);
    }
    return userObj;
  },

  async count() {
    if (isDBConnected()) {
      try {
        return await User.countDocuments();
      } catch (err) {
        console.warn("⚠️ database count error, counting in-memory:", err);
      }
    }
    return inMemoryUsers.length;
  }
};

export const SOSRepository = {
  async create(alertData: any) {
    const id = Math.random().toString(36).substring(2, 11);
    if (isDBConnected()) {
      try {
        const newAlert = new SOSAlertModel({
          id,
          ...alertData,
          status: "active",
        });
        await newAlert.save();
        return newAlert;
      } catch (err) {
        console.warn("⚠️ database save error, saving to in-memory:", err);
      }
    }
    const newAlert = {
      id,
      ...alertData,
      status: "active",
      timestamp: new Date().toISOString(),
    };
    inMemorySOS.push(newAlert);
    return newAlert;
  },

  async findActive() {
    if (isDBConnected()) {
      try {
        return await SOSAlertModel.find({ status: "active" });
      } catch (err) {
        console.warn("⚠️ database find error, getting in-memory:", err);
      }
    }
    return inMemorySOS.filter((a) => a.status === "active");
  },

  async findAll() {
    if (isDBConnected()) {
      try {
        return await SOSAlertModel.find();
      } catch (err) {
        console.warn("⚠️ database find error, getting in-memory:", err);
      }
    }
    return inMemorySOS;
  },

  async resolve(id: string) {
    if (isDBConnected()) {
      try {
        const alert = await SOSAlertModel.findOne({ id });
        if (alert) {
          alert.status = "resolved";
          await alert.save();
          return alert;
        }
      } catch (err) {
        console.warn("⚠️ database update error, resolving in-memory:", err);
      }
    }
    const alert = inMemorySOS.find((a) => a.id === id);
    if (alert) {
      alert.status = "resolved";
    }
    return alert || null;
  }
};

export const LostReportRepository = {
  async create(reportData: any) {
    const id = Math.random().toString(36).substring(2, 11);
    if (isDBConnected()) {
      try {
        const newReport = new LostReportModel({
          id,
          ...reportData,
          status: "missing",
        });
        await newReport.save();
        return newReport;
      } catch (err) {
        console.warn("⚠️ database save error, saving to in-memory:", err);
      }
    }
    const newReport = {
      id,
      ...reportData,
      status: "missing",
      timestamp: new Date().toISOString(),
    };
    inMemoryLost.push(newReport);
    return newReport;
  },

  async findActive() {
    if (isDBConnected()) {
      try {
        return await LostReportModel.find({ status: "missing" }).sort({ timestamp: -1 });
      } catch (err) {
        console.warn("⚠️ database find error, getting in-memory:", err);
      }
    }
    return inMemoryLost.filter((r) => r.status === "missing").sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  async findAll() {
    if (isDBConnected()) {
      try {
        return await LostReportModel.find().sort({ timestamp: -1 });
      } catch (err) {
        console.warn("⚠️ database find error, getting in-memory:", err);
      }
    }
    return [...inMemoryLost].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  async resolve(id: string) {
    if (isDBConnected()) {
      try {
        const report = await LostReportModel.findOne({ id });
        if (report) {
          report.status = "found";
          await report.save();
          return report;
        }
      } catch (err) {
        console.warn("⚠️ database update error, resolving in-memory:", err);
      }
    }
    const report = inMemoryLost.find((r) => r.id === id);
    if (report) {
      report.status = "found";
    }
    return report || null;
  }
};

