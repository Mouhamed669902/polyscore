/* ==========================================================================
   PolyScore : données de démonstration

   Ces données remplacent, pour l'instant, la base de données.
   Quand le back-end existera, ce fichier disparaîtra : main.js recevra
   les mêmes objets, mais depuis une API (fetch). Le reste du code ne change pas.
   ========================================================================== */

/* Mettre à false quand les vrais scores arriveront du serveur. */
const DEMO_LIVE = true;

/**
 * Crée une date ISO relative à aujourd'hui, pour que la démo reste vivante.
 * at(2, "15:00") = après-demain à 15h00.
 */
function at(dayOffset, time) {
  const date = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const SCHOOLS = [
  { id: "ESI", name: "École Supérieure d'Industrie" },
  { id: "ESCAE", name: "École Supérieure de Commerce et d'Administration des Entreprises" },
  { id: "ESMG", name: "École Supérieure des Mines et de Géologie" },
  { id: "EPGE", name: "École Préparatoire aux Grandes Écoles" },
  { id: "EP", name: "École Projet" },
  { id: "ESTP", name: "École Supérieure des Travaux Publics" },
  { id: "ESA", name: "École Supérieure d'Agronomie" },
];

const SPORTS = [
  { id: "football", label: "Football" },
  { id: "basketball", label: "Basketball" },
  { id: "volleyball", label: "Volleyball" },
  { id: "handball", label: "Handball" },
];

const COMPETITIONS = [
  {
    id: "ie",
    short: "IE",
    name: "Inter-Écoles",
    description: "La compétition principale entre les sept écoles de l'INP-HB.",
  },
  {
    id: "leaguey",
    short: "Leaguey League",
    name: "Leaguey League",
    description: "Nom et modalités à confirmer avec les organisateurs.",
  },
  {
    id: "oissu",
    short: "OISSU",
    name: "OISSU",
    description: "Office Ivoirien des Sports Scolaires et Universitaires.",
  },
];

/*
  Statuts : "upcoming" | "live" | "finished" | "postponed" | "cancelled"
  "clock" n'existe que pour un match en direct (minute ou période).
  Les lieux sont des exemples à remplacer par les vrais terrains.
*/
const MATCHES = [
  /* --- En direct --- */
  { id: 1, sport: "football", competition: "ie", home: "ESI", away: "ESTP", homeScore: 1, awayScore: 1, status: "live", clock: "54'", date: at(0, "15:00"), venue: "Stade de l'INP-HB" },
  { id: 2, sport: "basketball", competition: "oissu", home: "ESCAE", away: "EPGE", homeScore: 48, awayScore: 44, status: "live", clock: "3e quart-temps", date: at(0, "14:30"), venue: "Gymnase de l'INP-HB" },

  /* --- À venir --- */
  { id: 3, sport: "football", competition: "ie", home: "ESMG", away: "ESA", homeScore: null, awayScore: null, status: "upcoming", date: at(1, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 4, sport: "handball", competition: "ie", home: "ESI", away: "EPGE", homeScore: null, awayScore: null, status: "postponed", date: at(2, "17:00"), venue: "Gymnase de l'INP-HB" },
  { id: 5, sport: "basketball", competition: "ie", home: "ESTP", away: "ESA", homeScore: null, awayScore: null, status: "upcoming", date: at(2, "15:00"), venue: "Gymnase de l'INP-HB" },
  { id: 6, sport: "volleyball", competition: "oissu", home: "EP", away: "ESI", homeScore: null, awayScore: null, status: "upcoming", date: at(3, "09:30"), venue: "Gymnase de l'INP-HB" },
  { id: 7, sport: "handball", competition: "leaguey", home: "ESCAE", away: "ESMG", homeScore: null, awayScore: null, status: "upcoming", date: at(3, "17:00"), venue: "Gymnase de l'INP-HB" },
  { id: 8, sport: "football", competition: "ie", home: "EPGE", away: "ESI", homeScore: null, awayScore: null, status: "upcoming", date: at(5, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 9, sport: "basketball", competition: "oissu", home: "ESA", away: "EP", homeScore: null, awayScore: null, status: "upcoming", date: at(6, "14:00"), venue: "Gymnase de l'INP-HB" },
  { id: 10, sport: "volleyball", competition: "leaguey", home: "ESTP", away: "ESCAE", homeScore: null, awayScore: null, status: "upcoming", date: at(7, "10:00"), venue: "Gymnase de l'INP-HB" },

  /* --- Terminés : football Inter-Écoles (alimentent le classement) --- */
  { id: 11, sport: "football", competition: "ie", home: "ESI", away: "ESMG", homeScore: 2, awayScore: 1, status: "finished", date: at(-14, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 12, sport: "football", competition: "ie", home: "ESCAE", away: "EPGE", homeScore: 0, awayScore: 3, status: "finished", date: at(-13, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 13, sport: "football", competition: "ie", home: "ESTP", away: "ESA", homeScore: 1, awayScore: 1, status: "finished", date: at(-12, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 14, sport: "football", competition: "ie", home: "EP", away: "ESI", homeScore: 0, awayScore: 2, status: "finished", date: at(-10, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 15, sport: "football", competition: "ie", home: "ESMG", away: "ESCAE", homeScore: 3, awayScore: 2, status: "finished", date: at(-9, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 16, sport: "football", competition: "ie", home: "EPGE", away: "ESTP", homeScore: 2, awayScore: 0, status: "finished", date: at(-8, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 17, sport: "football", competition: "ie", home: "ESA", away: "EP", homeScore: 1, awayScore: 0, status: "finished", date: at(-7, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 18, sport: "football", competition: "ie", home: "ESI", away: "ESA", homeScore: 3, awayScore: 0, status: "finished", date: at(-5, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 19, sport: "football", competition: "ie", home: "EPGE", away: "ESMG", homeScore: 1, awayScore: 1, status: "finished", date: at(-4, "16:00"), venue: "Stade de l'INP-HB" },
  { id: 20, sport: "football", competition: "ie", home: "ESCAE", away: "EP", homeScore: 2, awayScore: 2, status: "finished", date: at(-3, "16:00"), venue: "Stade de l'INP-HB" },

  /* --- Terminés : autres sports --- */
  { id: 21, sport: "basketball", competition: "oissu", home: "ESI", away: "ESTP", homeScore: 64, awayScore: 58, status: "finished", date: at(-6, "15:00"), venue: "Gymnase de l'INP-HB" },
  { id: 22, sport: "volleyball", competition: "leaguey", home: "EP", away: "ESA", homeScore: 3, awayScore: 1, status: "finished", date: at(-2, "10:00"), venue: "Gymnase de l'INP-HB" },
  { id: 23, sport: "handball", competition: "ie", home: "ESMG", away: "EPGE", homeScore: 27, awayScore: 24, status: "finished", date: at(-1, "17:00"), venue: "Gymnase de l'INP-HB" },
];
