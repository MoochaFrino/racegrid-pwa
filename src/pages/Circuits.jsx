import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, ChevronRight } from "lucide-react";
import { getCircuits } from "../services/api";

export default function Circuits() {
  const [circuits, setCircuits] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCircuits()
      .then(setCircuits)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = circuits.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.gp_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Circuits</h1>
        <p className="text-xs text-zinc-400">Pilih sirkuit untuk melihat detail lintasan</p>
      </header>

      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nama sirkuit atau negara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a22] border border-zinc-800 text-sm focus:outline-none focus:border-[#E10600]"
        />
      </div>

      {loading && <p className="text-sm text-zinc-400 text-center py-8">Memuat sirkuit...</p>}
      {error && <p className="text-sm text-red-400 text-center py-8">{error}</p>}

      <div className="space-y-3">
        {filtered.map((circuit) => (
          <Link
            key={circuit.id}
            to={`/circuits/${circuit.id}`}
            className="block rounded-xl overflow-hidden bg-[#1a1a22] border border-zinc-800 hover:border-[#E10600]/60 transition"
          >
            <div className="h-32 w-full bg-zinc-900 relative">
              <img
                src={circuit.image_url}
                alt={circuit.name}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className="w-full h-full object-cover opacity-80"
              />
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[11px] font-bold bg-black/75 rounded-md">
                {circuit.race_date}
              </span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#E10600] uppercase">
                  {circuit.gp_name}
                </p>
                <h2 className="font-bold text-base mt-0.5">{circuit.name}</h2>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {circuit.city}, {circuit.country} • {circuit.length_km} km
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}