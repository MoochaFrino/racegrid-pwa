import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, ChevronRight, Star, Zap } from "lucide-react";
import { getCircuits } from "../services/api";
import {
  getSavedCircuits,
  toggleSavedCircuit,
  STORAGE_EVENT,
} from "../utils/storage";

export default function Circuits() {
  const [circuits, setCircuits] = useState([]);
  const [search, setSearch] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const [savedIds, setSavedIds] = useState(getSavedCircuits);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCircuits()
      .then(setCircuits)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sync = () => setSavedIds(getSavedCircuits());
    window.addEventListener(STORAGE_EVENT, sync);
    return () => window.removeEventListener(STORAGE_EVENT, sync);
  }, []);

  const filtered = circuits.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.gp_name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (onlySaved) return savedIds.includes(Number(c.id));
    return true;
  });

  return (
    <div className="space-y-4">
      <header className="pt-2 flex items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Circuits 2026</h1>
          <p className="text-xs text-zinc-400">
            Seluruh {circuits.length || 23} sirkuit resmi kalender Formula 1 2026
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E10600]/20 text-red-300 border border-[#E10600]/40">
          {filtered.length} Sirkuit
        </span>
      </header>

      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nama sirkuit, kota, atau negara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a22] border border-zinc-800 text-sm focus:outline-none focus:border-[#E10600]"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOnlySaved(false)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            !onlySaved
              ? "bg-[#E10600] border-[#E10600] text-white"
              : "bg-[#1a1a22] border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Semua ({circuits.length})
        </button>
        <button
          type="button"
          onClick={() => setOnlySaved(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            onlySaved
              ? "bg-amber-400/20 border-amber-400 text-amber-300"
              : "bg-[#1a1a22] border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          Saved Grid ({savedIds.length})
        </button>
      </div>

      {loading && (
        <p className="text-sm text-zinc-400 text-center py-8">
          Memuat 23 sirkuit 2026...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400 text-center py-8">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="p-6 rounded-xl bg-[#1a1a22] border border-zinc-800 text-center text-xs text-zinc-400">
          {onlySaved
            ? "Belum ada sirkuit yang di-bookmark ke Saved Grid."
            : "Sirkuit tidak ditemukan."}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((circuit) => {
          const isSaved = savedIds.includes(Number(circuit.id));
          const zoneCount =
            circuit.straight_mode_zones_count ?? circuit.drs_zones;

          return (
            <Link
              key={circuit.id}
              to={`/circuits/${circuit.id}`}
              className="block rounded-xl overflow-hidden bg-[#1a1a22] border border-zinc-800 hover:border-[#E10600]/60 transition"
            >
              <div className="h-36 w-full bg-zinc-900 relative">
                <img
                  src={circuit.image_url}
                  alt={circuit.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[11px] font-bold bg-black/80 backdrop-blur-sm rounded-md border border-white/10">
                  {circuit.round ? `R${circuit.round} • ` : ""}
                  {circuit.race_date}
                </span>
                <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded-md">
                  <Zap className="w-3 h-3" /> {zoneCount} Straight Mode
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSavedCircuit(circuit.id);
                  }}
                  aria-label="Bookmark sirkuit"
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/75 border border-white/10 hover:bg-black transition"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isSaved
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-300"
                    }`}
                  />
                </button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-[#E10600] uppercase flex items-center gap-1.5">
                    <span>{circuit.country_flag}</span>
                    <span className="truncate">{circuit.gp_name}</span>
                  </p>
                  <h2 className="font-bold text-base mt-0.5 truncate">
                    {circuit.name}
                  </h2>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {circuit.city}, {circuit.country} • {circuit.length_km} km
                    </span>
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
