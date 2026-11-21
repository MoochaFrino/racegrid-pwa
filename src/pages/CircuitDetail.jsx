import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Timer, Repeat, Zap } from "lucide-react";
import { getCircuitById } from "../services/api";

export default function CircuitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [circuit, setCircuit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCircuitById(id)
      .then(setCircuit)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-zinc-400 text-center py-10">Memuat detail...</p>;
  if (!circuit) return <p className="text-sm text-red-400 text-center py-10">Data tidak ditemukan.</p>;

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white pt-2"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="rounded-2xl overflow-hidden bg-[#1a1a22] border border-zinc-800">
        <div className="h-48 w-full bg-zinc-900 relative">
          <img
            src={circuit.image_url}
            alt={circuit.name}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a22] via-transparent to-transparent" />
        </div>
        <div className="p-5 -mt-6 relative">
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase bg-[#E10600] rounded-md">
            {circuit.gp_name}
          </span>
          <h1 className="text-2xl font-extrabold mt-2">{circuit.name}</h1>
          <p className="text-sm text-zinc-400 flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-[#E10600]" />
            {circuit.city}, {circuit.country} • {circuit.race_date}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-xl bg-[#1a1a22] border border-zinc-800 text-center">
          <p className="text-[11px] text-zinc-400">Panjang</p>
          <p className="text-lg font-bold mt-0.5">{circuit.length_km} km</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1a1a22] border border-zinc-800 text-center">
          <Repeat className="w-3.5 h-3.5 text-[#E10600] mx-auto mb-0.5" />
          <p className="text-[11px] text-zinc-400">Total Lap</p>
          <p className="text-lg font-bold">{circuit.laps}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1a1a22] border border-zinc-800 text-center">
          <Zap className="w-3.5 h-3.5 text-[#E10600] mx-auto mb-0.5" />
          <p className="text-[11px] text-zinc-400">Zona DRS</p>
          <p className="text-lg font-bold">{circuit.drs_zones}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 flex items-start gap-3">
        <Timer className="w-5 h-5 text-[#E10600] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-zinc-400">Lap Record</p>
          <p className="font-semibold text-sm">{circuit.lap_record}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
          Karakteristik Sirkuit
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">{circuit.description}</p>
      </div>
    </div>
  );
}