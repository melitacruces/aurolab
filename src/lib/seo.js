export const SITE = {
  name: "auroLab",
  language: "en",
  locale: "en_US",
  defaultOrigin: "https://aurolab-rosy.vercel.app",
  creator: {
    name: "dhreian",
    url: "https://dhreian.com",
    social: [
      "https://x.com/dhreian",
      "https://instagram.com/dhreian",
      "https://www.tiktok.com/@dhreian.com",
    ],
  },
};

export const SEO_ROUTES = {
  home: {
    sectionId: "home",
    slug: "",
    path: "/",
    name: "auroLab Music Production Tools",
    title: "auroLab - Free Music Production Tools for Producers",
    description:
      "Free browser-based music production tools: delay and reverb calculator, online metronome, tap tempo, and private BPM and key detection.",
    features: [
      "BPM-synced delay and reverb calculator",
      "Online metronome",
      "Tap tempo calculator",
      "Local BPM and key detection",
    ],
  },
  "delay-reverb": {
    sectionId: "delay-reverb",
    slug: "delay-reverb",
    path: "/delay-reverb/",
    name: "BPM Delay and Reverb Calculator",
    title: "auroLab - BPM Delay & Reverb Calculator (ms & Hz)",
    description:
      "Calculate BPM-synced delay times in milliseconds and Hz, plus pre-delay and decay suggestions for reverb. Free, precise, and browser-based.",
    features: [
      "Delay times in milliseconds and Hz",
      "Normal, dotted, and triplet subdivisions",
      "Tempo-aligned reverb pre-delay and decay suggestions",
    ],
  },
  metronome: {
    sectionId: "metronome",
    slug: "metronome",
    path: "/metronome/",
    name: "Online Metronome",
    title: "auroLab - Online Metronome with Tap Tempo",
    description:
      "Use a precise online metronome with accented downbeats, time signatures, volume control, tap tempo, and keyboard shortcuts. Free in your browser.",
    features: [
      "Web Audio clock scheduling",
      "Accented downbeats and selectable time signatures",
      "Tap tempo and keyboard shortcuts",
    ],
  },
  "tap-tempo": {
    sectionId: "tap-tempo",
    slug: "tap-tempo",
    path: "/tap-tempo/",
    name: "Tap Tempo BPM Calculator",
    title: "auroLab - Tap Tempo BPM Calculator",
    description:
      "Find a song's tempo by tapping the beat. auroLab averages your taps, filters outliers, and supports half-time and double-time BPM. Free online.",
    features: [
      "Robust BPM averaging with outlier rejection",
      "Half-time and double-time conversion",
      "Optional visual and audio tap feedback",
    ],
  },
  detector: {
    sectionId: "detector",
    slug: "bpm-key-detector",
    path: "/bpm-key-detector/",
    name: "BPM and Key Detector",
    title: "auroLab - Free BPM & Key Detector - Local Audio Analysis",
    description:
      "Detect BPM, musical key, confidence, alternatives, and Camelot code from audio. Analysis runs locally in your browser—your file is never uploaded.",
    features: [
      "Local BPM and musical key analysis",
      "Confidence scores and alternative results",
      "Camelot notation for harmonic mixing",
    ],
  },
};

export const INDEXABLE_ROUTES = Object.values(SEO_ROUTES);

export function getSeoRoute(sectionId = "home") {
  return SEO_ROUTES[sectionId] || SEO_ROUTES.home;
}

export function getSectionFromPath(pathname = "/") {
  const normalizedPath = `/${pathname.split("?")[0].split("#")[0].replace(/^\/+|\/+$/g, "")}`;
  if (normalizedPath === "/") return "home";

  const slug = normalizedPath.split("/").filter(Boolean).at(-1);
  return INDEXABLE_ROUTES.find((route) => route.slug === slug)?.sectionId || "home";
}
