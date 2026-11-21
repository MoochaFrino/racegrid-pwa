import { useState } from "react";
import { CalendarPlus, Flag } from "lucide-react";
import { downloadIcsForCircuits } from "../utils/ics";

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
}) {
  const [internalMode, setInternalMode] = useState("my");
  const [nowMs] = useState(() => Date.now());
  const timeMode = externalTimeMode ?? internalMode;
  const setTimeMode = onTimeModeChange ?? setInternalMode;

  const sessions = circuit?.sessions || [];
  if (sessions.length === 0) return null;

  const nextIdx = sessions.findIndex((s) => new Date(s.end || s.start).getTime() > nowMs);

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

      {/* Sessions Timetable */}
      <div className="divide-y divide-zinc-800/80">
        {sessions.map((session, idx) => {
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
          const isNext = idx === nextIdx;

          return (
            <div
              key={session.name}
              className={`flex items-center justify-between gap-3 ${
                compact ? "py-2.5" : "py-3"
              }`}
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

              {/* Status Pill */}
              <div className="shrink-0">
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
