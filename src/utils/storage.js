const SAVED_CIRCUITS_KEY = "racegrid_saved_circuits";
const SAVED_TEAMS_KEY = "racegrid_saved_teams";
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

const DEFAULT_PREFS = {
  favoriteTeamId: 1,
  favoriteDriverName: "Charles Leclerc",
  driverNumber: "45",
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
