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
} from "lucide-react";
import { getCircuits, getTeams } from "../services/api";
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
        targetLabel: raceStartMs > now ? "Race Lights Out" : nextSession?.name || "Race",
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
    targetLabel: "Season Opener",
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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E10600]">
            Season 2026 • Active Aero
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">RaceGrid</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#E10600]/15 border border-[#E10600]/40 flex items-center justify-center">
          <Flag className="w-5 h-5 text-[#E10600]" />
        </div>
      </header>

      {/* Next Race Live Countdown Banner (Las Vegas GP 2026) */}
      <section className="relative overflow-hidden rounded-2xl bg-[#181216] shadow-lg border border-red-500/35">
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/50 rounded-full border border-white/10">
              <Clock className="w-3 h-3 text-red-400" />{" "}
              {nextRace?.targetLabel || "Next Grand Prix"}
            </span>
            {featuredCircuit?.round && (
              <span className="px-2 py-0.5 rounded bg-black/45 text-[10px] font-mono font-bold text-white/90">
                ROUND {featuredCircuit.round} • {featuredCircuit.weekend_label}
              </span>
            )}
          </div>

          <h2 className="text-xl font-black leading-snug">
            {featuredCircuit
              ? `${featuredCircuit.country_flag || ""} ${featuredCircuit.gp_name}`
              : "Formula 1 World Championship"}
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
                className="py-2 rounded-xl bg-black/50 border border-white/15 text-center backdrop-blur-xs"
              >
                <p className="text-lg font-black font-mono leading-none">
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
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition"
              >
                Detail Sirkuit <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/schedule"
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-black/50 text-white border border-white/20 text-xs font-bold rounded-lg hover:bg-black/70 transition"
              >
                <Calendar className="w-3.5 h-3.5" /> Jadwal Sesi
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Counts */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          to="/circuits"
          className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:border-[#E10600]/60 transition"
        >
          <Gauge className="w-6 h-6 text-[#E10600] mb-2" />
          <p className="text-2xl font-bold">{circuits.length}</p>
          <p className="text-xs text-zinc-400">Sirkuit Kalender 2026</p>
        </Link>
        <Link
          to="/teams"
          className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:border-[#E10600]/60 transition"
        >
          <Trophy className="w-6 h-6 text-[#E10600] mb-2" />
          <p className="text-2xl font-bold">{teams.length}</p>
          <p className="text-xs text-zinc-400">Tim Konstruktor 2026</p>
        </Link>
      </section>

      {/* Saved Grid Section */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Saved Grid
          </h3>
          <span className="text-[11px] text-zinc-500">
            {savedCircuits.length + savedTeams.length} Tersimpan Offline
          </span>
        </div>

        {savedCircuits.length === 0 && savedTeams.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#1a1a22] border border-dashed border-zinc-800 text-xs text-zinc-400">
            Belum ada sirkuit atau tim favorit. Ketuk ikon{" "}
            <strong className="text-amber-300">★</strong> di halaman Circuits
            atau Teams untuk menyimpannya di sini (bekerja saat offline).
          </div>
        ) : (
          <div className="space-y-2">
            {savedCircuits.map((circuit) => (
              <Link
                key={`sc-${circuit.id}`}
                to={`/circuits/${circuit.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:border-amber-400/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#E10600]/15 border border-[#E10600]/30 flex items-center justify-center shrink-0">
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
                className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:border-amber-400/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {team.logo_url ? (
                    <div
                      className="w-9 h-9 rounded-lg border border-white/15 p-1.5 flex items-center justify-center shrink-0"
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
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
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

      {/* Quick Menu */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Menu Cepat
        </h3>
        <Link
          to="/schedule"
          className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:bg-zinc-800/80 transition"
        >
          <div>
            <p className="font-semibold text-sm">Jadwal Balapan 2026</p>
            <p className="text-xs text-zinc-400">
              Practice, Sprint, Qualifying &amp; Race dalam My Time / Track Time
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500" />
        </Link>
        <Link
          to="/circuits"
          className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:bg-zinc-800/80 transition"
        >
          <div>
            <p className="font-semibold text-sm">Direktori 23 Sirkuit</p>
            <p className="text-xs text-zinc-400">
              Peta resmi interaktif, Straight Mode Zones 2026, dan Fastest Lap
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500" />
        </Link>
        <Link
          to="/teams"
          className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 hover:bg-zinc-800/80 transition"
        >
          <div>
            <p className="font-semibold text-sm">Roster 11 Tim &amp; 22 Pembalap</p>
            <p className="text-xs text-zinc-400">
              Mobil 2026, filter pabrikan mesin, dan lineup pembalap resmi
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-500" />
        </Link>
      </section>
    </div>
  );
}
