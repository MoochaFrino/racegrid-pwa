import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Filter,
  Star,
} from "lucide-react";
import { getCircuits } from "../services/api";
import CountryFlag from "../components/CountryFlag";
import CircuitScheduleCard from "../components/CircuitScheduleCard";
import { downloadIcsForCircuits } from "../utils/ics";
import {
  getSavedCircuits,
  getSavedSessions,
  makeSessionKey,
  matchesSessionCategory,
  STORAGE_EVENT,
  toggleSavedCircuit,
} from "../utils/storage";

function getRaceEndMs(circuit) {
  const sessions = circuit.sessions || [];
  const race = sessions.find((s) => s.name.toLowerCase() === "race");
  const ref = race?.end || race?.start || circuit.end_date_iso;
  return ref ? new Date(ref).getTime() : 0;
}

function getCircuitCountdownInfo(circuit, nowMs) {
  const sessions = circuit.sessions || [];
  const race = sessions.find((s) => s.name.toLowerCase() === "race");
  const raceEndMs = getRaceEndMs(circuit);

  if (raceEndMs <= nowMs) {
    return {
      isZero: true,
      targetLabel: "RACE COMPLETED",
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }

  const nextSession = sessions.find(
    (s) => new Date(s.start).getTime() > nowMs
  );
  const raceStartMs = race ? new Date(race.start).getTime() : raceEndMs;
  const targetMs =
    nextSession
      ? new Date(nextSession.start).getTime()
      : raceStartMs > nowMs
      ? raceStartMs
      : raceEndMs;

  const diff = Math.max(0, targetMs - nowMs);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    isZero: diff === 0,
    targetLabel: nextSession
      ? `MENUJU ${nextSession.name.toUpperCase()}`
      : "MENUJU RACE",
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

const FAVORITE_FILTER_OPTIONS = [
  { id: "all", label: "Semua Favorit (Track & Sesi)" },
  { id: "tracks", label: "Track / Sirkuit Favorit Saja" },
  { id: "sessions", label: "Semua Sesi Favorit" },
  { id: "race", label: "Sesi Favorit: Race" },
  { id: "qualifying", label: "Sesi Favorit: Qualifying" },
  { id: "sprint", label: "Sesi Favorit: Sprint" },
  { id: "practice", label: "Sesi Favorit: Practice (FP1 - FP3)" },
];

export default function Schedule() {
  const [circuits, setCircuits] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [favSubFilter, setFavSubFilter] = useState("all");
  const [favDropdownOpen, setFavDropdownOpen] = useState(false);
  const [timeMode, setTimeMode] = useState("my");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [savedCircuitIds, setSavedCircuitIds] = useState(getSavedCircuits);
  const [savedSessions, setSavedSessions] = useState(getSavedSessions);
  const dropdownRef = useRef(null);

  useEffect(() => {
    getCircuits()
      .then((data) => {
        setCircuits(data);
        const now = Date.now();
        const active =
          data.find((c) => getRaceEndMs(c) > now) || data[data.length - 1];
        if (active) setExpandedId(active.id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Live 1-second countdown ticker for all circuits
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync saved circuits and sessions from localStorage
  useEffect(() => {
    const syncStorage = () => {
      setSavedCircuitIds(getSavedCircuits());
      setSavedSessions(getSavedSessions());
    };
    window.addEventListener(STORAGE_EVENT, syncStorage);
    return () => window.removeEventListener(STORAGE_EVENT, syncStorage);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFavDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nextRound = circuits.find((c) => getRaceEndMs(c) > nowMs);

  const circuitHasFavSession = (circuit, category = "all") => {
    const sessions = circuit.sessions || [];
    return sessions.some((s) => {
      const key = makeSessionKey(circuit.id, s.name);
      if (!savedSessions.includes(key)) return false;
      if (category === "all" || category === "sessions") return true;
      return matchesSessionCategory(s.name, category);
    });
  };

  const totalFavoriteItemsCount =
    savedCircuitIds.length + savedSessions.length;

  const filtered = circuits.filter((c) => {
    if (filter === "upcoming") return getRaceEndMs(c) > nowMs;
    if (filter === "sprint") {
      return (c.sessions || []).some((s) =>
        s.name.toLowerCase().includes("sprint")
      );
    }
    if (filter === "favorites") {
      const isTrackFav = savedCircuitIds.includes(Number(c.id));
      if (favSubFilter === "all") {
        return isTrackFav || circuitHasFavSession(c, "all");
      }
      if (favSubFilter === "tracks") {
        return isTrackFav;
      }
      if (favSubFilter === "sessions") {
        return circuitHasFavSession(c, "sessions");
      }
      return circuitHasFavSession(c, favSubFilter);
    }
    return true;
  });

  const activeFavOption =
    FAVORITE_FILTER_OPTIONS.find((opt) => opt.id === favSubFilter) ||
    FAVORITE_FILTER_OPTIONS[0];

  return (
    <div className="space-y-4">
      <header className="pt-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#E10600]">
            FIA F1 World Championship
          </p>
          <h1 className="text-2xl font-bold">2026 Schedule</h1>
        </div>

        <button
          type="button"
          onClick={() =>
            downloadIcsForCircuits(circuits, "f1-2026-full-season.ics")
          }
          disabled={circuits.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E10600] hover:bg-[#c50500] text-white text-[11px] font-bold transition shrink-0"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          Add Season
        </button>
      </header>

      {/* Global Timezone Toggle (My time vs Track time) + Filters */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5 flex-wrap items-center" ref={dropdownRef}>
          {[
            { id: "upcoming", label: "Upcoming" },
            { id: "all", label: `All (${circuits.length})` },
            { id: "sprint", label: "Sprint" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFilter(tab.id);
                setFavDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                filter === tab.id
                  ? "bg-[#E10600] border-[#E10600] text-white"
                  : "bg-[#1a1a22] border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Favorit Tab with Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (filter !== "favorites") {
                  setFilter("favorites");
                  setFavDropdownOpen(true);
                } else {
                  setFavDropdownOpen((prev) => !prev);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                filter === "favorites"
                  ? "bg-[#E10600] border-[#E10600] text-white"
                  : "bg-[#1a1a22] border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  filter === "favorites"
                    ? "fill-white text-white"
                    : totalFavoriteItemsCount > 0
                    ? "fill-amber-400 text-amber-400"
                    : ""
                }`}
              />
              <span>
                Favorit
                {totalFavoriteItemsCount > 0
                  ? ` (${totalFavoriteItemsCount})`
                  : ""}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  favDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Popup when Favorit is clicked */}
            {favDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-[#16161d] border border-zinc-700/90 shadow-2xl z-30 py-1.5 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-[#E10600]" />
                    Filter Bagian Favorit
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {savedCircuitIds.length} Track • {savedSessions.length} Sesi
                  </span>
                </div>
                {FAVORITE_FILTER_OPTIONS.map((option) => {
                  const isSelected = favSubFilter === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setFilter("favorites");
                        setFavSubFilter(option.id);
                        setFavDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition ${
                        isSelected
                          ? "bg-[#E10600]/15 text-white font-bold border-l-2 border-[#E10600]"
                          : "text-zinc-300 hover:bg-zinc-800/70"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="inline-flex items-center p-0.5 rounded-full bg-[#1a1a22] border border-zinc-800 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setTimeMode("my")}
            className={`px-2.5 py-1 rounded-full transition ${
              timeMode === "my" ? "bg-white text-black" : "text-zinc-400"
            }`}
          >
            My time
          </button>
          <button
            type="button"
            onClick={() => setTimeMode("track")}
            className={`px-2.5 py-1 rounded-full transition ${
              timeMode === "track" ? "bg-white text-black" : "text-zinc-400"
            }`}
          >
            Track time
          </button>
        </div>
      </div>

      {/* Active Favorite Filter Banner & Quick Dropdown Selector */}
      {filter === "favorites" && (
        <div className="p-3 rounded-xl bg-[#16161d] border border-amber-400/30 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                Mode Filter Favorit Aktif
              </p>
              <p className="text-xs font-bold text-white truncate">
                {activeFavOption.label} ({filtered.length} Sirkuit)
              </p>
            </div>
          </div>

          <select
            value={favSubFilter}
            onChange={(e) => setFavSubFilter(e.target.value)}
            aria-label="Filter kategori favorit"
            className="px-2.5 py-1.5 rounded-lg bg-[#111116] border border-zinc-700 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-[#E10600]"
          >
            {FAVORITE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <p className="text-sm text-zinc-400 text-center py-8">
          Memuat jadwal balapan 2026...
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="p-6 rounded-2xl bg-[#16161d] border border-zinc-800 text-center space-y-2">
          <Star className="w-7 h-7 text-amber-400 mx-auto opacity-80" />
          <p className="text-sm font-bold text-white">
            Belum ada jadwal di kategori favorit ini
          </p>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Klik ikon bintang pada kartu sirkuit (track) atau pada masing-masing
            sesi (Practice, Qualifying, Sprint, Race) untuk menyimpannya ke tab
            Favorit.
          </p>
          {filter === "favorites" && favSubFilter !== "all" && (
            <button
              type="button"
              onClick={() => setFavSubFilter("all")}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition"
            >
              Tampilkan Semua Favorit
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((circuit) => {
          const isExpanded =
            expandedId === circuit.id ||
            (filter === "favorites" &&
              favSubFilter !== "tracks" &&
              circuitHasFavSession(circuit, favSubFilter));
          const isNext = nextRound?.id === circuit.id;
          const isCompleted = getRaceEndMs(circuit) <= nowMs;
          const isSprint = (circuit.sessions || []).some((s) =>
            s.name.toLowerCase().includes("sprint")
          );
          const isTrackFav = savedCircuitIds.includes(Number(circuit.id));
          const favSessionsInCircuit = (circuit.sessions || []).filter((s) =>
            savedSessions.includes(makeSessionKey(circuit.id, s.name))
          );
          const cd = getCircuitCountdownInfo(circuit, nowMs);

          return (
            <div
              key={circuit.id}
              className={`rounded-2xl border overflow-hidden transition ${
                isNext
                  ? "bg-[#1a1a24] border-[#E10600]"
                  : isTrackFav
                  ? "bg-[#16161d] border-amber-400/40"
                  : "bg-[#16161d] border-zinc-800"
              }`}
            >
              {/* Card Header: Track Info + Favorite Button + Expand Toggle */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(
                        expandedId === circuit.id ? null : circuit.id
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E10600]">
                        Round {circuit.round} • {circuit.weekend_label}
                      </span>
                      {isNext && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E10600] text-white text-[9px] font-black uppercase tracking-wider">
                          Live / Next GP
                        </span>
                      )}
                      {!isCompleted && !isNext && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[9px] font-bold uppercase">
                          Coming Soon
                        </span>
                      )}
                      {isSprint && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[9px] font-bold uppercase">
                          Sprint
                        </span>
                      )}
                      {isCompleted && !isNext && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase">
                          Done
                        </span>
                      )}
                      {favSessionsInCircuit.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[9px] font-bold uppercase">
                          {favSessionsInCircuit.length} Sesi Favorit
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-extrabold text-white mt-1 flex items-center gap-1.5">
                      <CountryFlag flag={circuit.country_flag} size="sm" />
                      <span className="truncate">{circuit.gp_name}</span>
                    </h2>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {circuit.name} • {circuit.city}
                    </p>
                  </button>

                  {/* Track Favorite Star + Expand Chevron */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSavedCircuit(circuit.id)}
                      title={
                        isTrackFav
                          ? "Hapus Track dari Favorit"
                          : "Simpan Track ke Favorit"
                      }
                      aria-label={`Favoritkan ${circuit.gp_name}`}
                      className={`p-2 rounded-xl border transition ${
                        isTrackFav
                          ? "bg-amber-400/15 border-amber-400/40 text-amber-400"
                          : "bg-[#111116] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isTrackFav ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          expandedId === circuit.id ? null : circuit.id
                        )
                      }
                      aria-label="Buka atau tutup detail sesi"
                      className="p-2 rounded-xl bg-[#111116] border border-zinc-800 text-zinc-400 hover:text-white transition"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Per-Circuit Countdown Box (0 for completed, live countdown for Next & Coming Soon) */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    isCompleted
                      ? "bg-[#111116]/90 border-zinc-800/80"
                      : isNext
                      ? "bg-gradient-to-r from-[#E10600]/15 via-[#141118] to-[#111116] border-[#E10600]/40"
                      : "bg-[#111116] border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider ${
                        isCompleted
                          ? "text-zinc-500"
                          : isNext
                          ? "text-[#ff4d47]"
                          : "text-zinc-300"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {isCompleted
                        ? "Countdown Selesai"
                        : isNext
                        ? "Next GP Countdown"
                        : "Coming Soon Countdown"}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      {cd.targetLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "Hari", value: cd.days },
                      { label: "Jam", value: cd.hours },
                      { label: "Menit", value: cd.minutes },
                      { label: "Detik", value: cd.seconds },
                    ].map((unit) => (
                      <div
                        key={unit.label}
                        className={`py-1.5 px-2 rounded-lg border text-center ${
                          isCompleted
                            ? "bg-zinc-900/60 border-zinc-800/60 text-zinc-500"
                            : isNext
                            ? "bg-black/60 border-[#E10600]/30 text-white"
                            : "bg-zinc-900/90 border-zinc-800 text-zinc-100"
                        }`}
                      >
                        <p className="text-sm font-black font-mono tabular-nums leading-none">
                          {unit.value}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400 mt-1">
                          {unit.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2.5">
                  <CircuitScheduleCard
                    circuit={circuit}
                    externalTimeMode={timeMode}
                    onTimeModeChange={setTimeMode}
                    compact
                    nowMs={nowMs}
                    favoriteFilterMode={
                      filter === "favorites" ? favSubFilter : null
                    }
                  />
                  <Link
                    to={`/circuits/${circuit.id}`}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#111116] border border-zinc-800 hover:border-[#E10600]/60 text-xs font-bold text-zinc-200 transition"
                  >
                    <span>Lihat Peta Resmi &amp; Detail Sirkuit</span>
                    <ChevronRight className="w-4 h-4 text-[#E10600]" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
