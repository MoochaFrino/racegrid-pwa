import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Wrench } from "lucide-react";
import { getTeams } from "../services/api";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Teams</h1>
        <p className="text-xs text-zinc-400">Pilih tim untuk melihat spesifikasi dan pembalap</p>
      </header>

      {loading && <p className="text-sm text-zinc-400 text-center py-8">Memuat daftar tim...</p>}
      {error && <p className="text-sm text-red-400 text-center py-8">{error}</p>}

      <div className="space-y-3">
        {teams.map((team) => (
          <Link
            key={team.id}
            to={`/teams/${team.id}`}
            className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:border-zinc-600 transition relative overflow-hidden"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5"
              style={{ backgroundColor: team.primary_color }}
            />
            <div className="pl-2">
              <h2 className="font-bold text-base">{team.name}</h2>
              <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                <Wrench className="w-3.5 h-3.5" />
                Engine: {team.engine} • Chassis: {team.chassis}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 text-[11px] bg-zinc-800 rounded text-zinc-300">
                  #{team.driver_1_number} {team.driver_1_name}
                </span>
                <span className="px-2 py-0.5 text-[11px] bg-zinc-800 rounded text-zinc-300">
                  #{team.driver_2_number} {team.driver_2_name}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}