import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, Star } from "lucide-react";
import { getTeams } from "../services/api";
import CountryFlag from "../components/CountryFlag";
import {
  getSavedTeams,
  toggleSavedTeam,
  STORAGE_EVENT,
} from "../utils/storage";

const ENGINE_FILTERS = [
  "All",
  "Mercedes",
  "Ferrari",
  "Red Bull Ford",
  "Honda",
  "Audi",
];

function splitDriverName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/);
  if (parts.length <= 1) return { first: "", last: fullName || "" };
  const last = parts.pop();
  return { first: parts.join(" "), last };
}

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [engineFilter, setEngineFilter] = useState("All");
  const [onlySaved, setOnlySaved] = useState(false);
  const [savedIds, setSavedIds] = useState(getSavedTeams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sync = () => setSavedIds(getSavedTeams());
    window.addEventListener(STORAGE_EVENT, sync);
    return () => window.removeEventListener(STORAGE_EVENT, sync);
  }, []);

  const filtered = teams.filter((team) => {
    const matchesEngine =
      engineFilter === "All" || team.engine === engineFilter;
    if (!matchesEngine) return false;

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      team.name.toLowerCase().includes(q) ||
      team.full_name.toLowerCase().includes(q) ||
      team.driver_1_name.toLowerCase().includes(q) ||
      team.driver_2_name.toLowerCase().includes(q) ||
      team.chassis.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (onlySaved) return savedIds.includes(Number(team.id));
    return true;
  });

  return (
    <div className="space-y-4">
      <header className="pt-2 flex items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Teams 2026</h1>
          <p className="text-xs text-zinc-400">
            Grid lengkap {teams.length || 11} konstruktor &amp; mobil musim 2026
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E10600]/20 text-red-300 border border-[#E10600]/40">
          {filtered.length} Tim
        </span>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari tim, sasis, atau pembalap..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a22] border border-zinc-800 text-sm focus:outline-none focus:border-[#E10600]"
        />
      </div>

      {/* Engine Supplier & Saved Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {ENGINE_FILTERS.map((engine) => {
          const active = engineFilter === engine && !onlySaved;
          return (
            <button
              key={engine}
              type="button"
              onClick={() => {
                setEngineFilter(engine);
                setOnlySaved(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition ${
                active
                  ? "bg-[#E10600] border-[#E10600] text-white"
                  : "bg-[#1a1a22] border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {engine}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setOnlySaved((prev) => !prev)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition ${
            onlySaved
              ? "bg-amber-400/20 border-amber-400 text-amber-300"
              : "bg-[#1a1a22] border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Star className="w-3 h-3" />
          Saved ({savedIds.length})
        </button>
      </div>

      {loading && (
        <p className="text-sm text-zinc-400 text-center py-8">
          Memuat 11 tim grid 2026...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400 text-center py-8">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="p-6 rounded-xl bg-[#1a1a22] border border-zinc-800 text-center text-xs text-zinc-400">
          {onlySaved
            ? "Belum ada tim yang di-bookmark ke Saved Grid."
            : "Tidak ada tim yang cocok dengan filter."}
        </div>
      )}

      {/* Full Livery Team Cards matching 2026 F1 Design */}
      <div className="space-y-3">
        {filtered.map((team) => {
          const isSaved = savedIds.includes(Number(team.id));
          const d1 = splitDriverName(team.driver_1_name);
          const d2 = splitDriverName(team.driver_2_name);
          const gradFrom = team.gradient_from || "#18181f";
          const gradTo = team.gradient_to || team.primary_color || "#E10600";

          return (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="block rounded-2xl overflow-hidden border border-white/15 shadow-lg hover:scale-[1.01] transition-transform relative"
              style={{
                background: `linear-gradient(125deg, ${gradFrom} 0%, ${gradTo} 100%)`,
              }}
            >
              {/* Subtle Halftone Grid Pattern */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                }}
              />

              <div className="relative p-4 pb-2 space-y-2.5">
                {/* Top Header: Team Name + Drivers + Logo + Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black tracking-tight text-white drop-shadow-xs truncate">
                        {team.name}
                      </h2>
                      <span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono font-bold text-white/90">
                        {team.chassis}
                      </span>
                    </div>

                    {/* Drivers inline strip */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      {[
                        {
                          parts: d1,
                          img: team.driver_1_image,
                          name: team.driver_1_name,
                          flag: team.driver_1_flag,
                        },
                        {
                          parts: d2,
                          img: team.driver_2_image,
                          name: team.driver_2_name,
                          flag: team.driver_2_flag,
                        },
                      ].map((drv) => (
                        <span
                          key={drv.name}
                          className="inline-flex items-center gap-1.5 text-[11px] text-white drop-shadow-xs"
                        >
                          {drv.img && (
                            <img
                              src={drv.img}
                              alt={drv.name}
                              className="w-5 h-5 rounded-full object-cover object-top bg-black/35 border border-white/30"
                            />
                          )}
                          <CountryFlag flag={drv.flag} size="xs" />
                          <span>
                            {drv.parts.first}{" "}
                            <strong className="uppercase font-extrabold">
                              {drv.parts.last}
                            </strong>
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top-right Logo Badge & Bookmark */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSavedTeam(team.id);
                      }}
                      aria-label="Bookmark tim"
                      className="p-1.5 rounded-full bg-black/30 hover:bg-black/45 border border-white/15 transition"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isSaved
                            ? "fill-amber-300 text-amber-300"
                            : "text-white/85"
                        }`}
                      />
                    </button>

                    {team.logo_url && (
                      <div className="w-9 h-9 rounded-full bg-black/30 border border-white/20 p-1.5 flex items-center justify-center backdrop-blur-xs">
                        <img
                          src={team.logo_url}
                          alt={`Logo ${team.name}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Full 2026 Car Side Profile */}
                <div className="relative flex items-center justify-between pt-1">
                  {team.car_image ? (
                    <img
                      src={team.car_image}
                      alt={`${team.name} ${team.chassis}`}
                      className="w-[92%] h-20 object-contain object-left drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
                    />
                  ) : (
                    <div className="h-20" />
                  )}
                  <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
