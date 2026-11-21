import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { getCircuits } from "../services/api";
import CircuitScheduleCard from "../components/CircuitScheduleCard";
import { downloadIcsForCircuits } from "../utils/ics";

function getRaceEndMs(circuit) {
  const sessions = circuit.sessions || [];
  const race = sessions.find((s) => s.name.toLowerCase() === "race");
  const ref = race?.end || race?.start || circuit.end_date_iso;
  return ref ? new Date(ref).getTime() : 0;
}

export default function Schedule() {
  const [circuits, setCircuits] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [timeMode, setTimeMode] = useState("my");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nowMs] = useState(() => Date.now());

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

  const nextRound = circuits.find((c) => getRaceEndMs(c) > nowMs);

  const filtered = circuits.filter((c) => {
    if (filter === "upcoming") return getRaceEndMs(c) > nowMs;
    if (filter === "sprint") {
      return (c.sessions || []).some((s) =>
        s.name.toLowerCase().includes("sprint")
      );
    }
    return true;
  });

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
        <div className="flex gap-1.5">
          {[
            { id: "upcoming", label: "Upcoming" },
            { id: "all", label: `All (${circuits.length})` },
            { id: "sprint", label: "Sprint" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                filter === tab.id
                  ? "bg-[#E10600] border-[#E10600] text-white"
                  : "bg-[#1a1a22] border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
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

      {loading && (
        <p className="text-sm text-zinc-400 text-center py-8">
          Memuat jadwal balapan 2026...
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((circuit) => {
          const isExpanded = expandedId === circuit.id;
          const isNext = nextRound?.id === circuit.id;
          const isCompleted = getRaceEndMs(circuit) <= nowMs;
          const isSprint = (circuit.sessions || []).some((s) =>
            s.name.toLowerCase().includes("sprint")
          );

          return (
            <div
              key={circuit.id}
              className={`rounded-2xl border overflow-hidden transition ${
                isNext
                  ? "bg-[#1a1a24] border-[#E10600]"
                  : "bg-[#16161d] border-zinc-800"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : circuit.id)
                }
                className="w-full p-4 flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E10600]">
                      Round {circuit.round} • {circuit.weekend_label}
                    </span>
                    {isNext && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E10600] text-white text-[9px] font-black uppercase tracking-wider">
                        Live / Next GP
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
                  </div>

                  <h2 className="text-base font-extrabold text-white mt-1 flex items-center gap-1.5">
                    <span>{circuit.country_flag}</span>
                    <span className="truncate">{circuit.gp_name}</span>
                  </h2>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {circuit.name} • {circuit.city}
                  </p>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2.5">
                  <CircuitScheduleCard
                    circuit={circuit}
                    externalTimeMode={timeMode}
                    onTimeModeChange={setTimeMode}
                    compact
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
