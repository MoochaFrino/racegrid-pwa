const SAVED_CIRCUITS_KEY = "racegrid_saved_circuits";
const SAVED_TEAMS_KEY = "racegrid_saved_teams";
const SAVED_SESSIONS_KEY = "racegrid_saved_sessions";
const PROFILE_PREFS_KEY = "racegrid_profile_prefs";
const VSC_DEMO_KEY = "racegrid_vsc_demo";

export const STORAGE_EVENT = "racegrid-storage-change";

function emitStorageChange() {
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function readJsonArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toggleId(key, id) {
  const numId = Number(id);
  const current = readJsonArray(key);
  const exists = current.includes(numId);
  const next = exists ? current.filter((item) => item !== numId) : [...current, numId];
  localStorage.setItem(key, JSON.stringify(next));
  emitStorageChange();
  return !exists;
}

export function getSavedCircuits() {
  return readJsonArray(SAVED_CIRCUITS_KEY);
}

export function isCircuitSaved(id) {
  return getSavedCircuits().includes(Number(id));
}

export function toggleSavedCircuit(id) {
  return toggleId(SAVED_CIRCUITS_KEY, id);
}

export function getSavedTeams() {
  return readJsonArray(SAVED_TEAMS_KEY);
}

export function isTeamSaved(id) {
  return getSavedTeams().includes(Number(id));
}

export function toggleSavedTeam(id) {
  return toggleId(SAVED_TEAMS_KEY, id);
}

export function makeSessionKey(circuitId, sessionName) {
  return `${Number(circuitId)}::${String(sessionName || "").trim()}`;
}

export function matchesSessionCategory(sessionName, category) {
  const lower = String(sessionName || "").toLowerCase();
  if (category === "race") return lower === "race";
  if (category === "qualifying") return lower.includes("qualifying");
  if (category === "sprint") return lower.includes("sprint");
  if (category === "practice") return lower.includes("practice");
  return true;
}

export function getSavedSessions() {
  return readJsonArray(SAVED_SESSIONS_KEY).filter(
    (item) => typeof item === "string"
  );
}

export function isSessionSaved(circuitId, sessionName) {
  const key = makeSessionKey(circuitId, sessionName);
  return getSavedSessions().includes(key);
}

export function toggleSavedSession(circuitId, sessionName) {
  const sessionKey = makeSessionKey(circuitId, sessionName);
  const current = getSavedSessions();
  const exists = current.includes(sessionKey);
  const next = exists
    ? current.filter((item) => item !== sessionKey)
    : [...current, sessionKey];
  localStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(next));
  emitStorageChange();
  return !exists;
}

const DEFAULT_PREFS = {
  favoriteTeamId: 1,
  favoriteDriverName: "Charles Leclerc",
  driverNumber: "45",
  avatarDataUrl: "",
};

export function getProfilePrefs() {
  try {
    const raw = localStorage.getItem(PROFILE_PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveProfilePrefs(partial) {
  const next = { ...getProfilePrefs(), ...partial };
  localStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(next));
  emitStorageChange();
  return next;
}

export function getVscDemoMode() {
  try {
    return localStorage.getItem(VSC_DEMO_KEY) === "true";
  } catch {
    return false;
  }
}

export function setVscDemoMode(enabled) {
  localStorage.setItem(VSC_DEMO_KEY, enabled ? "true" : "false");
  emitStorageChange();
}
