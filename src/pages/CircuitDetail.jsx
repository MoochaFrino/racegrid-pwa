import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Timer,
  Repeat,
  Zap,
  HelpCircle,
  Star,
  Calendar,
  Award,
} from "lucide-react";
import { getCircuitById } from "../services/api";
import InteractiveTrackMap from "../components/InteractiveTrackMap";
import CircuitScheduleCard from "../components/CircuitScheduleCard";
import Regulation2026Modal from "../components/Regulation2026Modal";
import {
  isCircuitSaved,
  toggleSavedCircuit,
  STORAGE_EVENT,
} from "../utils/storage";

export default function CircuitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState({ loadedId: null, circuit: null });
  const [saved, setSaved] = useState(() => isCircuitSaved(id));
  const [showRegModal, setShowRegModal] = useState(false);

  useEffect(() => {
    let active = true;
    getCircuitById(id)
      .then((data) => {
        if (active) setResult({ loadedId: id, circuit: data });
      })
      .catch((err) => {
        console.error(err);
        if (active) setResult({ loadedId: id, circuit: null });
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const sync = () => setSaved(isCircuitSaved(id));
    window.addEventListener(STORAGE_EVENT, sync);
    return () => window.removeEventListener(STORAGE_EVENT, sync);
  }, [id]);

  const loading = result.loadedId !== id;
  const circuit = result.circuit;

  if (loading)
    return (
      <p className="text-sm text-zinc-400 text-center py-10">
        Memuat detail sirkuit...
      </p>
    );
  if (!circuit)
    return (
      <p className="text-sm text-red-400 text-center py-10">
        Data tidak ditemukan.
      </p>
    );

  const straightModeCount =
    circuit.straight_mode_zones_count ?? circuit.drs_zones;
  const lapTime = circuit.lap_record_time || circuit.lap_record;
  const lapDriver = circuit.lap_record_driver;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <button
          type="button"
          onClick={() => setSaved(toggleSavedCircuit(circuit.id))}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
            saved
              ? "bg-amber-400/15 border-amber-400/60 text-amber-300"
              : "bg-[#1a1a22] border-zinc-800 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <Star
            className={`w-3.5 h-3.5 ${
              saved ? "fill-amber-400 text-amber-400" : ""
            }`}
          />
          {saved ? "Tersimpan" : "Simpan"}
        </button>
      </div>

      {/* Real-Life Circuit Photo Hero Card */}
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
          {circuit.round && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-black/80 text-[11px] font-bold text-white border border-white/10">
              ROUND {circuit.round} • {circuit.weekend_label || circuit.race_date}
            </span>
          )}
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

      {/* Stats Row */}
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
        <div className="p-3.5 rounded-xl bg-[#1a1a22] border border-cyan-500/30 text-center relative">
          <button
            type="button"
            onClick={() => setShowRegModal(true)}
            className="absolute top-1.5 right-1.5 text-zinc-400 hover:text-cyan-400 transition"
            aria-label="Info Regulasi Straight Mode 2026"
            title="Info Regulasi 2026"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <Zap className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
          <p className="text-[11px] text-cyan-300 font-semibold">Straight Mode</p>
          <p className="text-lg font-bold">{straightModeCount} Zona</p>
        </div>
      </div>

      {/* Unified Official 2026 Map + Interactive Straight Mode Hotspots */}
      <InteractiveTrackMap
        circuit={circuit}
        onOpenInfo={() => setShowRegModal(true)}
      />

      {/* Weekend Schedule for This Circuit */}
      <CircuitScheduleCard circuit={circuit} />

      {/* Fastest Lap Showcase (Historical Car Matching Exact Record Year) */}
      <section className="p-4 rounded-2xl bg-[#1a1a22] border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#E10600]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Fastest Lap Showcase
            </h2>
          </div>
          {circuit.lap_record_year && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] font-bold text-zinc-200">
              <Calendar className="w-3 h-3 text-[#E10600]" />
              {circuit.lap_record_year}
            </span>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <p className="text-2xl font-black font-mono tracking-tight text-white">
            {lapTime}
          </p>
          {circuit.lap_record_team && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E10600]/15 border border-[#E10600]/40 text-[11px] font-bold text-red-300">
              <Award className="w-3 h-3" />
              {circuit.lap_record_team}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-300">
          {lapDriver && (
            <span>
              Pembalap: <strong className="text-white">{lapDriver}</strong>
            </span>
          )}
          {circuit.lap_record_car_name && (
            <span className="text-zinc-400">
              • Mobil Rekor ({circuit.lap_record_year}):{" "}
              <strong className="text-zinc-200">
                {circuit.lap_record_car_name}
              </strong>
            </span>
          )}
        </div>

        {circuit.lap_record_car_image && (
          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#121218]">
            <img
              src={circuit.lap_record_car_image}
              alt={circuit.lap_record_car_name || "Record Car"}
              className="w-full h-44 object-cover"
            />
          </div>
        )}
      </section>

      {/* Circuit Characteristics */}
      <div className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
          Karakteristik Sirkuit
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {circuit.description}
        </p>
      </div>

      <Regulation2026Modal
        open={showRegModal}
        onClose={() => setShowRegModal(false)}
      />
    </div>
  );
}
