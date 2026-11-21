import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Flag,
  ChevronRight,
  Gauge,
  Trophy,
  Clock,
  Star,
  MapPin,
  Shield,
  Calendar,
  Plus,
} from "lucide-react";
import { getCircuits, getTeams } from "../services/api";
import CountryFlag from "../components/CountryFlag";
import {
  getSavedCircuits,
  getSavedTeams,
  STORAGE_EVENT,
} from "../utils/storage";

function getNextRaceEvent(circuits) {
  const now = Date.now();
  for (const circuit of circuits) {
    const sessions = circuit.sessions || [];
    const race = sessions.find((s) => s.name.toLowerCase() === "race");
    const nextSession = sessions.find(
      (s) => new Date(s.end || s.start).getTime() > now
    );
    const raceStartMs = race ? new Date(race.start).getTime() : 0;
    const raceEndMs = race ? new Date(race.end || race.start).getTime() : 0;

    if (raceEndMs > now || nextSession) {
      const targetMs =
        raceStartMs > now
          ? raceStartMs
          : nextSession
          ? new Date(nextSession.start).getTime()
          : raceEndMs;
      return {
        circuit,
        targetMs,
        targetLabel:
          raceStartMs > now ? "Hitungan Mundur Balapan" : nextSession?.name || "Race",
      };
    }
  }

  // Fallback if entire 2026 season has finished
  const first = circuits[0];
  if (!first) return null;
  const firstRace = (first.sessions || []).find(
    (s) => s.name.toLowerCase() === "race"
  );
  const nextYearDate = new Date(
    firstRace?.start || first.start_date_iso || "2026-03-08T04:00:00Z"
  );
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  return {
    circuit: first,
    targetMs: nextYearDate.getTime(),
    targetLabel: "Pembuka Musim",
  };
}

function formatCountdown(targetMs) {
  const diff = Math.max(0, targetMs - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export default function Home() {
  const [circuits, setCircuits] = useState([]);
  const [teams, setTeams] = useState([]);
  const [savedCircuitIds, setSavedCircuitIds] = useState(getSavedCircuits);
  const [savedTeamIds, setSavedTeamIds] = useState(getSavedTeams);
  const [nextRace, setNextRace] = useState(null);
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    Promise.all([getCircuits(), getTeams()])
      .then(([circuitsData, teamsData]) => {
        setCircuits(circuitsData);
        setTeams(teamsData);
        const upcoming = getNextRaceEvent(circuitsData);
        setNextRace(upcoming);
        if (upcoming) {
          setCountdown(formatCountdown(upcoming.targetMs));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!nextRace) return;
    const timer = setInterval(() => {
      setCountdown(formatCountdown(nextRace.targetMs));
    }, 1000);
    return () => clearInterval(timer);
  }, [nextRace]);

  useEffect(() => {
    const syncSaved = () => {
      setSavedCircuitIds(getSavedCircuits());
      setSavedTeamIds(getSavedTeams());
    };
    window.addEventListener(STORAGE_EVENT, syncSaved);
    return () => window.removeEventListener(STORAGE_EVENT, syncSaved);
  }, []);

  const featuredCircuit = nextRace?.circuit || circuits[0] || null;
  const savedCircuits = circuits.filter((c) =>
    savedCircuitIds.includes(Number(c.id))
  );
  const savedTeams = teams.filter((t) => savedTeamIds.includes(Number(t.id)));
  const totalSaved = savedCircuits.length + savedTeams.length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#E10600]">
            Musim 2026 • Active Aero
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">RaceGrid</h1>
        </div>
        <div className="w-10 h-10 rounded-md bg-[#E10600]/15 border border-[#E10600]/40 flex items-center justify-center">
          <Flag className="w-5 h-5 text-[#E10600]" />
        </div>
      </header>

      {/* Next Race Live Countdown Banner */}
      <section className="relative overflow-hidden rounded-lg bg-[#181216] shadow-lg border border-red-500/35">
        {featuredCircuit?.image_url && (
          <img
            src={featuredCircuit.image_url}
            alt={featuredCircuit.name}
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E10600]/85 via-[#5c0404]/85 to-[#121016]/95" />

        <div className="relative p-5">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/50 rounded-md border border-white/10">
              <Clock className="w-3 h-3 text-red-400" />{" "}
              {nextRace?.targetLabel || "Grand Prix Berikutnya"}
            </span>
            {featuredCircuit?.round && (
              <span className="px-2 py-0.5 rounded-md bg-black/45 text-[10px] font-mono font-bold text-white/90">
                ROUND {featuredCircuit.round} • {featuredCircuit.weekend_label}
              </span>
            )}
          </div>

          <h2 className="text-xl font-black leading-snug flex items-center gap-2">
            {featuredCircuit ? (
              <>
                <CountryFlag flag={featuredCircuit.country_flag} size="md" />
                <span>{featuredCircuit.gp_name}</span>
              </>
            ) : (
              "Kejuaraan Dunia Formula 1"
            )}
          </h2>
          <p className="text-xs text-white/85 mt-0.5">
            {featuredCircuit
              ? `${featuredCircuit.name} • ${featuredCircuit.city}, ${featuredCircuit.country}`
              : "Eksplorasi kalender sirkuit dan roster tim terbaru."}
          </p>

          {/* Live Timer Grid */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: "Hari", value: countdown.days },
              { label: "Jam", value: countdown.hours },
              { label: "Menit", value: countdown.minutes },
              { label: "Detik", value: countdown.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="py-2 rounded-md bg-black/55 border border-white/15 text-center backdrop-blur-xs"
              >
                <p className="text-lg font-black font-mono tabular-nums leading-none">
                  {item.value}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/75 mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {featuredCircuit && (
            <div className="flex items-center gap-2 mt-4">
              <Link
                to={`/circuits/${featuredCircuit.id}`}
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-white text-black text-xs font-bold rounded-md hover:bg-zinc-200 transition"
              >
                Detail Sirkuit <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/schedule"
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-black/50 text-white border border-white/20 text-xs font-bold rounded-md hover:bg-black/70 transition"
              >
                <Calendar className="w-3.5 h-3.5" /> Jadwal Sesi
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Counts: Motorsport Left-Border Telemetry Cards */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          to="/circuits"
          className="p-4 rounded-md border-l-4 border-red-600 bg-gradient-to-br from-red-950/20 to-zinc-900 hover:from-red-950/35 hover:to-zinc-800/90 transition shadow-sm"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Gauge className="w-5 h-5 text-[#E10600]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              TRK-26
            </span>
          </div>
          <p className="text-4xl font-black tracking-tight font-mono tabular-nums text-white leading-none">
            {circuits.length}
          </p>
          <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mt-2">
            Sirkuit Musim 2026
          </p>
        </Link>
        <Link
          to="/teams"
          className="p-4 rounded-md border-l-4 border-red-600 bg-gradient-to-br from-red-950/20 to-zinc-900 hover:from-red-950/35 hover:to-zinc-800/90 transition shadow-sm"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Trophy className="w-5 h-5 text-[#E10600]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              CON-26
            </span>
          </div>
          <p className="text-4xl font-black tracking-tight font-mono tabular-nums text-white leading-none">
            {teams.length}
          </p>
          <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mt-2">
            Tim Konstruktor
          </p>
        </Link>
      </section>

      {/* Saved Grid Section */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Saved Grid
          </h3>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {totalSaved > 0 ? `${totalSaved} TERSIMPAN • OFFLINE READY` : "OFFLINE READY"}
          </span>
        </div>

        {totalSaved === 0 ? (
          <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800/90 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-md bg-amber-400/10 border border-amber-400/25 flex items-center justify-center shrink-0 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Belum ada sirkuit atau tim favorit. Tandai item untuk akses cepat.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <Link
                to="/circuits"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold border border-zinc-700/80 transition"
              >
                <Plus className="w-3 h-3 text-[#E10600]" />
                Jelajahi Sirkuit
              </Link>
              <Link
                to="/teams"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold border border-zinc-700/80 transition"
              >
                <Plus className="w-3 h-3 text-[#E10600]" />
                Pilih Tim
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {savedCircuits.map((circuit) => (
              <Link
                key={`sc-${circuit.id}`}
                to={`/circuits/${circuit.id}`}
                className="flex items-center justify-between p-3 rounded-md bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-[#E10600]/15 border border-[#E10600]/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#E10600]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{circuit.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {circuit.gp_name} • {circuit.length_km} km
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
              </Link>
            ))}

            {savedTeams.map((team) => (
              <Link
                key={`st-${team.id}`}
                to={`/teams/${team.id}`}
                className="flex items-center justify-between p-3 rounded-md bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {team.logo_url ? (
                    <div
                      className="w-9 h-9 rounded-md border border-white/15 p-1.5 flex items-center justify-center shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${
                          team.gradient_from || "#1a1a22"
                        }, ${team.gradient_to || team.primary_color || "#333"})`,
                      }}
                    >
                      <img
                        src={team.logo_url}
                        alt={team.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-zinc-300" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{team.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {team.engine} • {team.chassis}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Paddock & Telemetry Navigation Hierarchy */}
      <section className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
          Paddock &amp; Telemetry
        </h3>

        {/* Featured Full-Width Card: Jadwal Balapan 2026 */}
        <Link
          to="/schedule"
          className="block p-4 rounded-lg bg-gradient-to-r from-red-950/35 via-zinc-900 to-zinc-900 border border-red-500/30 hover:border-red-500/60 transition shadow-sm"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#E10600]/20 border border-[#E10600]/40 text-[#ff4d47] text-[10px] font-mono font-bold uppercase tracking-wider">
              <Calendar className="w-3 h-3" />
              {featuredCircuit?.round
                ? `MUSIM 2026 • NEXT: ROUND ${featuredCircuit.round}`
                : "MUSIM 2026 • 23 SERI"}
            </span>
            <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
          </div>
          <p className="font-bold text-sm text-white">Jadwal Balapan 2026</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kalender musim, sesi kualifikasi &amp; konversi zona waktu
          </p>
        </Link>

        {/* 2-Column Grid for Circuits & Teams */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/circuits"
            className="flex flex-col justify-between p-3.5 rounded-lg bg-zinc-900/95 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/70 transition"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#E10600]" />
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Direktori Sirkuit</p>
              <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                Peta lintasan, Straight Mode Zones &amp; rekor lap
              </p>
            </div>
          </Link>

          <Link
            to="/teams"
            className="flex flex-col justify-between p-3.5 rounded-lg bg-zinc-900/95 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/70 transition"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#E10600]" />
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Tim &amp; Pembalap</p>
              <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                Lineup 2026, konstruktor &amp; pemasok mesin
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
