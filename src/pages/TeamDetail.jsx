import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, UserCheck, Wrench, Trophy } from "lucide-react";
import { getTeamById } from "../services/api";

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamById(id)
      .then(setTeam)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-zinc-400 text-center py-10">Memuat detail tim...</p>;
  if (!team) return <p className="text-sm text-red-400 text-center py-10">Tim tidak ditemukan.</p>;

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white pt-2"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div
        className="p-5 rounded-2xl border border-zinc-800 bg-[#1a1a22]"
        style={{ borderTop: `4px solid ${team.primary_color}` }}
      >
        <p className="text-xs text-zinc-400">{team.full_name}</p>
        <h1 className="text-2xl font-extrabold mt-1">{team.name}</h1>
        <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-2">
          <MapPin className="w-3.5 h-3.5" /> {team.base}
        </p>
      </div>

      <section className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Driver Lineup
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800">
            <span
              className="text-2xl font-black"
              style={{ color: team.primary_color }}
            >
              #{team.driver_1_number}
            </span>
            <p className="font-bold text-sm mt-1">{team.driver_1_name}</p>
            <p className="text-[11px] text-zinc-400">Driver 1</p>
          </div>
          <div className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800">
            <span
              className="text-2xl font-black"
              style={{ color: team.primary_color }}
            >
              #{team.driver_2_number}
            </span>
            <p className="font-bold text-sm mt-1">{team.driver_2_name}</p>
            <p className="text-[11px] text-zinc-400">Driver 2</p>
          </div>
        </div>
      </section>

      <section className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Spesifikasi Teknis
        </h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Team Principal
          </span>
          <span className="font-semibold">{team.team_principal}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Power Unit / Sasis
          </span>
          <span className="font-semibold">{team.engine} ({team.chassis})</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Juara Konstruktor
          </span>
          <span className="font-semibold">{team.championships}x</span>
        </div>
      </section>

      <div className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
          Profil Tim
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">{team.description}</p>
      </div>
    </div>
  );
}