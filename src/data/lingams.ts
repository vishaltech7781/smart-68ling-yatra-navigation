import { Lingam } from "../types";

// Helper to generate a realistic coordinate in Solapur (lat ~17.659, lng ~75.906)
const getSolapurCoords = (id: number) => {
  // Use deterministic math to scatter coordinates in a circular fashion around Siddheshwar Lake
  const centerLat = 17.6715;
  const centerLng = 75.9015;
  const radius = 0.015 + (id % 12) * 0.002; // dispersal radius
  const angle = (id * 137.5) * (Math.PI / 180); // golden angle spiral
  return {
    latitude: parseFloat((centerLat + radius * Math.sin(angle)).toFixed(5)),
    longitude: parseFloat((centerLng + radius * Math.cos(angle)).toFixed(5)),
  };
};

const LINGAM_NAMES = [
  "Shree Amrut ling",
  "Shri Papeshwar ling",
  "Shri Popeshwar ling",
  "Shri Sangameshwar ling",
  "Shri Parmeshwar ling",
  "Shri Yoginath ling",
  "Shri Mallikarjuna ling",
  "Shri Someshwar ling",
  "Shri Rameshwar ling",
  "Shri Kedareshwar ling",
  "Shri Omkareshwar ling",
  "Shri Bhimashankar ling",
  "Shri Nageshwar ling",
  "Shri Kashi Vishweshar ling",
  "Shri Tryambakeshwar ling",
  "Shri Mahakaleshwar ling",
  "Shri Ghrishneshwar ling",
  "Shri Chandrashekhara ling",
  "Shri Nilkantha ling",
  "Shri Kailasheshwar ling",
  "Shri Pashupatinath ling",
  "Shri Gangadhar ling",
  "Shri Bhasmeshwar ling",
  "Shri Rudreshwar ling",
  "Shri Mahadev ling",
  "Shri Sadashiv ling",
  "Shri Shankar ling",
  "Shri Shambhu ling",
  "Shri Girijashankar ling",
  "Shri Trilokeshwar ling",
  "Shri Chandramouleshwar ling",
  "Shri Koteshwar ling",
  "Shri Siddheshwar Main ling",
  "Shri Pradosheshwar ling",
  "Shri Bhuteshwar ling",
  "Shri Kapileshwar ling",
  "Shri Gangeshwar ling",
  "Shri Jateshwar ling",
  "Shri Vishwanath ling",
  "Shri Nandishwar ling",
  "Shri Vyasheshwar ling",
  "Shri Markandeyashwar ling",
  "Shri Agastyeshwar ling",
  "Shri Gautamling",
  "Shri Vashishtheshwar ling",
  "Shri Vishwamitreshwar ling",
  "Shri Parashurameshwar ling",
  "Shri Valmikeshwar ling",
  "Shri Vyas ling",
  "Shri Shukeshwar ling",
  "Shri Naradeshwar ling",
  "Shri Bilveshwar ling",
  "Shri Durvasheshwar ling",
  "Shri Dattatreyashwar ling",
  "Shri Kartikeyeshwar ling",
  "Shri Ganeshwar ling",
  "Shri Hanumanteshwar ling",
  "Shri Ramling",
  "Shri Lakshmaneshwar ling",
  "Shri Sitashwar ling",
  "Shri Bharatling",
  "Shri Shatrughnaling",
  "Shri Dharmarajeshwar ling",
  "Shri Bheemling",
  "Shri Arjunling",
  "Shri Nakulling",
  "Shri Sahadevling",
  "Shri Sidhnath ling"
];

const TEMPLE_LOCATIONS = [
  "Siddheshwar Temple Complex",
  "Solapur Fort Area (Killa)",
  "Budhwar Peth, Near Lake",
  "Mangalwar Peth Market",
  "Sakhar Peth Temple Street",
  "Shastri Nagar Temple Lane",
  "Guruwar Peth Inner Chowk",
  "Gold Finch Peth Road",
  "Civil Lines Temple Garden",
  "Samrat Chowk Sanctuary",
  "Murarji Peth Crossroads",
  "Bhavani Peth Corner"
];

const SIGNIFICANCES = [
  "Brings immediate peace and heals mental stress.",
  "Represents the removal of sins and negative karma.",
  "Blesses devotees with sound health and longevity.",
  "Symbolizes the union of holy rivers and inner flow.",
  "The supreme source of spiritual transformation.",
  "Bestows divine wisdom and deep meditative focus.",
  "Associated with Lord Siddheshwar, the patron deity of Solapur.",
  "Grants material prosperity and family well-being.",
  "Protects from negative energies and dark influences.",
  "Embodies the infinite cosmic pillar of light."
];

export const LINGAMS: Lingam[] = Array.from({ length: 68 }, (_, index) => {
  const id = index + 1;
  const name = LINGAM_NAMES[index % LINGAM_NAMES.length];
  const { latitude, longitude } = getSolapurCoords(id);

  // Dynamic crowd assignment
  const crowdLevels: ("Low" | "Medium" | "High" | "Very High")[] = [
    "Low",
    "Medium",
    "High",
    "Very High",
  ];
  const crowdLevel = crowdLevels[id % 4];
  const crowdCount =
    crowdLevel === "Low"
      ? Math.floor(5 + (id % 10))
      : crowdLevel === "Medium"
      ? Math.floor(20 + (id % 30))
      : crowdLevel === "High"
      ? Math.floor(60 + (id % 40))
      : Math.floor(110 + (id % 60));

  const location = `${TEMPLE_LOCATIONS[id % TEMPLE_LOCATIONS.length]}, Solapur`;
  const significance = SIGNIFICANCES[id % SIGNIFICANCES.length];

  return {
    id,
    name: `${name}`,
    location,
    latitude,
    longitude,
    crowdLevel,
    crowdCount,
    significance,
    history: `This sacred shrine of ${name} was consecrated by Yogi Sidharama, the legendary 12th-century spiritual master, to establish 68 distinct lingas in Solapur representing the absolute spiritual topography of India.`
  };
});
