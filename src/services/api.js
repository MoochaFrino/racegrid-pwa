import {
  enrichCircuit,
  mergeCircuitsWith2026,
  getCircuit2026ById,
  enrichTeam,
  mergeTeamsWith2026,
  getTeam2026ById,
} from "../data/enrichment2026";

export const BASE_URL =
  import.meta.env.VITE_API_URL || "https://racegrid-api.vercel.app";

export async function getCircuits() {
  try {
    const res = await fetch(`${BASE_URL}/api/circuits`);
    if (res.ok) {
      const data = await res.json();
      return mergeCircuitsWith2026(data);
    }
  } catch {
    // Fallback to full 23-circuit offline dataset
  }
  return mergeCircuitsWith2026([]);
}

export async function getCircuitById(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/circuits/${id}`);
    if (res.ok) {
      const data = await res.json();
      return enrichCircuit(data);
    }
  } catch {
    // Fallback to local 23-circuit dataset if offline or un-deployed API doesn't have circuits 7..23
  }
  const localCircuit = getCircuit2026ById(id);
  if (localCircuit) return localCircuit;
  throw new Error("Sirkuit tidak ditemukan");
}

export async function getTeams() {
  try {
    const res = await fetch(`${BASE_URL}/api/teams`);
    if (res.ok) {
      const data = await res.json();
      return mergeTeamsWith2026(data);
    }
  } catch {
    // Fallback to full 11-team offline dataset
  }
  return mergeTeamsWith2026([]);
}

export async function getTeamById(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/teams/${id}`);
    if (res.ok) {
      const data = await res.json();
      return enrichTeam(data);
    }
  } catch {
    // Fallback to local 11-team dataset
  }
  const localTeam = getTeam2026ById(id);
  if (localTeam) return localTeam;
  throw new Error("Tim tidak ditemukan");
}
