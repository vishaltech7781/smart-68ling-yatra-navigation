export interface Lingam {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  crowdLevel: "Low" | "Medium" | "High" | "Very High";
  crowdCount: number;
  significance: string;
  history?: string;
}

export interface User {
  id: string;
  email: string;
  visitedIds: number[];
  createdAt: string;
}

export interface SOSAlert {
  id: string;
  type: "ambulance" | "police" | "volunteer" | "lost_person";
  contactName: string;
  phone: string;
  details: string;
  location: string;
  timestamp: string;
  status: "active" | "resolved";
}

export interface LostReport {
  id: string;
  personName: string;
  age: number;
  lastSeenAt: string;
  description: string;
  reporterPhone: string;
  timestamp: string;
  status: "missing" | "found";
}

export interface AnalyticsData {
  totalPilgrims: number;
  mostCrowdedLingam: string;
  peakHour: string;
  activeAlertsCount: number;
  hourlyPilgrims: { hour: string; pilgrims: number }[];
  routePopularity: { routeName: string; share: number }[];
  crowdDistribution: { level: string; count: number }[];
}
