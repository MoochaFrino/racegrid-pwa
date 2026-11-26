import { useEffect, useState } from "react";
import { CalendarPlus, Flag, Star } from "lucide-react";
import { downloadIcsForCircuits } from "../utils/ics";
import {
  getSavedSessions,
  makeSessionKey,
  matchesSessionCategory,
  STORAGE_EVENT,
  toggleSavedSession,
} from "../utils/storage";

const MONTHS_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function formatSessionTime(isoStr, mode, utcOffsetHours) {
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) return { day: "--", month: "---", time: "--:--" };

  if (mode === "track") {
    const shifted = new Date(date.getTime() + (utcOffsetHours || 0) * 3600 * 1000);
    return {
      day: String(shifted.getUTCDate()).padStart(2, "0"),
      month: MONTHS_SHORT[shifted.getUTCMonth()],
      time: `${String(shifted.getUTCHours()).padStart(2, "0")}:${String(
        shifted.getUTCMinutes()
      ).padStart(2, "0")}`,
    };
  }

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: MONTHS_SHORT[date.getMonth()],
    time: `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`,
  };
}

export default function CircuitScheduleCard({
  circuit,
  externalTimeMode,
  onTimeModeChange,
  compact = false,
  nowMs: externalNowMs,
  favoriteFilterMode = null,
}) {
  const [internalMode, setInternalMode] = useState("my");
  const [internalNowMs] = useState(() => Date.now());
  const [savedSessions, setSavedSessions] = useState(getSavedSessions);
  const [overrideFilterMode, setOverrideFilterMode] = useState(null);

  const showAllSessionsOverride =
    Boolean(favoriteFilterMode) && overrideFilterMode === favoriteFilterMode;
  const nowMs = externalNowMs ?? internalNowMs;
  const timeMode = externalTimeMode ?? internalMode;
  const setTimeMode = onTimeModeChange ?? setInternalMode;

  useEffect(() => {
    const sync = () => setSavedSessions(getSavedSessions());
    window.addEventListener(STORAGE_EVENT, sync);
    return () => window.removeEventListener(STORAGE_EVENT, sync);
  }, []);

  const allSessions = circuit?.sessions || [];
  if (allSessions.length === 0) return null;

  const isFilteringSessions =
    !showAllSessionsOverride &&
    favoriteFilterMode &&
    ["sessions", "race", "qualifying", "sprint", "practice"].includes(
      favoriteFilterMode
    );

  const visibleSessions = isFilteringSessions
    ? allSessions.filter((s) => {
        const key = makeSessionKey(circuit.id, s.name);
        const isFav = savedSessions.includes(key);
        if (!isFav) return false;
        if (favoriteFilterMode === "sessions") return true;
        return matchesSessionCategory(s.name, favoriteFilterMode);
      })
    : allSessions;

  const nextSessionName = allSessions.find(
    (s) => new Date(s.end || s.start).getTime() > nowMs
  )?.name;

  return (
    <section className="rounded-2xl bg-[#16161d] border border-zinc-800 p-4 space-y-3">
      {/* Top Toolbar matching formula1.com schedule */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={() =>
            downloadIcsForCircuits([circuit], `f1-2026-${circuit.slug}.ics`)
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E10600] hover:bg-[#c50500] text-white text-[11px] font-bold transition"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          Add F1 calendar
        </button>

        <div className="inline-flex items-center p-0.5 rounded-full bg-[#0f0f14] border border-zinc-800 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setTimeMode("my")}
            className={`px-3 py-1 rounded-full transition ${
              timeMode === "my"
                ? "bg-white text-black shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            My time
          </button>
          <button
            type="button"
            onClick={() => setTimeMode("track")}
            className={`px-3 py-1 rounded-full transition ${
              timeMode === "track"
                ? "bg-white text-black shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Track time
          </button>
        </div>
      </div>

      {isFilteringSessions && visibleSessions.length < allSessions.length && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/25 text-[11px]">
          <span className="text-amber-300 font-semibold">
            Menampilkan {visibleSessions.length} dari {allSessions.length} sesi (Filter Favorit)
          </span>
          <button
            type="button"
            onClick={() => setOverrideFilterMode(favoriteFilterMode)}
            className="text-white font-bold underline hover:text-amber-200 transition"
          >
            Lihat Semua Sesi
          </button>
        </div>
      )}

      {/* Sessions Timetable */}
      <div className="divide-y divide-zinc-800/80">
        {visibleSessions.map((session) => {
          const start = formatSessionTime(
            session.start,
            timeMode,
            circuit.utc_offset
          );
          const end = formatSessionTime(
            session.end,
            timeMode,
            circuit.utc_offset
          );
          const isRace = session.name.toLowerCase() === "race";
          const endMs = new Date(session.end || session.start).getTime();
          const isFinished = endMs <= nowMs;
          const isNext = session.name === nextSessionName;
          const sessionKey = makeSessionKey(circuit.id, session.name);
          const isFavSession = savedSessions.includes(sessionKey);

          return (
            <div
              key={session.name}
              className={`flex items-center justify-between gap-3 rounded-lg transition ${
                compact ? "py-2.5 px-1.5" : "py-3 px-1.5"
              } ${isFavSession ? "bg-amber-400/[0.04]" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Date badge */}
                <div className="w-9 text-center shrink-0">
                  <p className="text-sm font-black leading-none text-white">
                    {start.day}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
                    {start.month}
                  </p>
                </div>

                {/* Flag & Session Name + Time */}
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-white flex items-center gap-1.5">
                    <Flag
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isNext
                          ? "text-[#E10600]"
                          : isFinished
                          ? "text-zinc-500"
                          : "text-zinc-300"
                      }`}
                    />
                    <span className="truncate">{session.name}</span>
                  </p>
                  <p className="text-xs font-mono text-zinc-300 mt-0.5 pl-5">
                    {isRace ? start.time : `${start.time} - ${end.time}`}
                  </p>
                </div>
              </div>

              {/* Status Pill + Favorite Session Button */}
              <div className="flex items-center gap-2 shrink-0">
                {isNext ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#E10600]/20 border border-[#E10600]/50 text-[10px] font-bold uppercase text-red-300">
                    Next
                  </span>
                ) : isFinished ? (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-semibold uppercase text-zinc-400">
                    Done
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase text-zinc-500">
                    Upcoming
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleSavedSession(circuit.id, session.name)}
                  title={
                    isFavSession
                      ? `Hapus sesi ${session.name} dari favorit`
                      : `Simpan sesi ${session.name} ke favorit`
                  }
                  aria-label={`Favoritkan sesi ${session.name}`}
                  className={`p-1.5 rounded-lg border transition ${
                    isFavSession
                      ? "bg-amber-400/15 border-amber-400/40 text-amber-400"
                      : "bg-[#111116] border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isFavSession ? "fill-amber-400 text-amber-400" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
