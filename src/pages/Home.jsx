import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, ChevronRight, Gauge, Trophy } from "lucide-react";
import { getCircuits, getTeams } from "../services/api";

export default function Home() {
  const [stats, setStats] = useState({ circuits: 0, teams: 0 });
  const [featuredCircuit, setFeaturedCircuit] = useState(null);

  useEffect(() => {
    Promise.all([getCircuits(), getTeams()])
      .then(([circuitsData, teamsData]) => {
        setStats({ circuits: circuitsData.length, teams: teamsData.length });
        if (circuitsData.length > 0) setFeaturedCircuit(circuitsData[0]);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E10600]">
            Season 2026
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">RaceGrid</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#E10600]/15 border border-[#E10600]/40 flex items-center justify-center">
          <Flag className="w-5 h-5 text-[#E10600]" />
        </div>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E10600] to-[#7a0300] p-5 shadow-lg">
        <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-black/30 rounded-full mb-3">
          Featured Grand Prix
        </span>
        <h2 className="text-xl font-bold leading-snug">
          {featuredCircuit ? featuredCircuit.gp_name : "Formula 1 World Championship"}
        </h2>
        <p className="text-sm text-white/80 mt-1">
          {featuredCircuit
            ? `${featuredCircuit.name} • ${featuredCircuit.race_date}`
            : "Eksplorasi kalender sirkuit dan roster tim terbaru."}
        </p>
        {featuredCircuit && (
          <Link
            to={`/circuits/${featuredCircuit.id}`}
            className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition"
          >
            Lihat Detail Sirkuit <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          to="/circuits"
          className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:border-[#E10600]/60 transition"
        >
          <Gauge className="w-6 h-6 text-[#E10600] mb-2" />
          <p className="text-2xl font-bold">{stats.circuits}</p>
          <p className="text-xs text-zinc-400">Sirkuit Terdaftar</p>
        </Link>
        <Link
          to="/teams"
          className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:border-[#E10600]/60 transition"
        >
          <Trophy className="w-6 h-6 text-[#E10600] mb-2" />
          <p className="text-2xl font-bold">{stats.teams}</p>
          <p className="text-xs text-zinc-400">Tim Konstruktor</p>
        </Link>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Menu Cepat
        </h3>
        <Link
          to="/circuits"
          className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:bg-zinc-800/80 transition"
        >
          <div>
            <p className="font-semibold text-sm">Direktori Sirkuit</p>
            <p className="text-xs text-zinc-400">Panjang lintasan, lap, zona DRS, dan lap record</p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500" />
        </Link>
        <Link
          to="/teams"
          className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:bg-zinc-800/80 transition"
        >
          <div>
            <p className="font-semibold text-sm">Roster Tim & Pembalap</p>
            <p className="text-xs text-zinc-400">Spesifikasi mesin, sasis, dan lineup pembalap</p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500" />
        </Link>
      </section>
    </div>
  );
}