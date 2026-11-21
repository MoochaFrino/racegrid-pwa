const BASE_URL = import.meta.env.VITE_API_URL || "https://racegrid-api.vercel.app";

export async function getCircuits() {
  const res = await fetch(`${BASE_URL}/api/circuits`);
  if (!res.ok) throw new Error("Gagal mengambil data sirkuit");
  return res.json();
}

export async function getCircuitById(id) {
  const res = await fetch(`${BASE_URL}/api/circuits/${id}`);
  if (!res.ok) throw new Error("Sirkuit tidak ditemukan");
  return res.json();
}

export async function getTeams() {
  const res = await fetch(`${BASE_URL}/api/teams`);
  if (!res.ok) throw new Error("Gagal mengambil data tim");
  return res.json();
}

export async function getTeamById(id) {
  const res = await fetch(`${BASE_URL}/api/teams/${id}`);
  if (!res.ok) throw new Error("Tim tidak ditemukan");
  return res.json();
}