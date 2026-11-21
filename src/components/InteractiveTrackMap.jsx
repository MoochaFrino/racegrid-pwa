import { useState } from "react";
import {
  Gauge,
  HelpCircle,
  Map as MapIcon,
  Maximize2,
  Navigation,
  Ruler,
  X,
  Zap,
} from "lucide-react";

export default function InteractiveTrackMap({ circuit, onOpenInfo }) {
  const zones = Array.isArray(circuit?.straight_mode_zones)
    ? circuit.straight_mode_zones
    : [];
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [zoomMap, setZoomMap] = useState(false);

  if (!circuit?.map_image_url) return null;

  const selectedZone =
    zones.find((z) => z.id === selectedZoneId) || zones[0] || null;
  const speedPercent = selectedZone
    ? Math.min(100, Math.round((selectedZone.top_speed_kmh / 380) * 100))
    : 0;

  return (
    <section className="rounded-2xl bg-[#181c26] border border-zinc-800 p-4 space-y-3.5 shadow-lg">
      {/* Top Official Badge + Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-[#E10600] text-white text-[10px] font-extrabold uppercase tracking-wider">
            On 2026 calendar
          </span>
          {circuit.country_flag && (
            <span className="text-base leading-none">{circuit.country_flag}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenInfo && (
            <button
              type="button"
              onClick={onOpenInfo}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-200 transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Info 2026
            </button>
          )}
          <button
            type="button"
            onClick={() => setZoomMap(true)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
            title="Perbesar peta sirkuit"
            aria-label="Perbesar peta sirkuit"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Unified Official 2026 Map with Clickable Straight Mode Hotspots */}
      <div className="relative rounded-xl bg-[#f1f5f9] border border-zinc-300/60 overflow-hidden p-3">
        <img
          src={circuit.map_image_url}
          alt={`Peta Detail Resmi ${circuit.name}`}
          className="w-full h-52 object-contain select-none"
        />

        {/* Interactive Hotspot Pins placed directly on the official track map */}
        {zones.map((zone, idx) => {
          const isSelected = selectedZone?.id === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedZoneId(zone.id)}
              style={{
                left: `${zone.hotspot_pct_x ?? 50}%`,
                top: `${zone.hotspot_pct_y ?? 50}%`,
              }}
              aria-label={`Pilih ${zone.name}`}
              className={`-translate-x-1/2 -translate-y-1/2 absolute w-7 h-7 rounded-full font-black text-[11px] flex items-center justify-center border-2 shadow-md transition-transform ${
                isSelected
                  ? "bg-[#E10600] text-white border-white scale-115 ring-4 ring-cyan-400/55 z-20"
                  : "bg-[#0e7490] text-white border-white hover:scale-110 z-10"
              }`}
            >
              Z{idx + 1}
            </button>
          );
        })}
      </div>

      {/* Official Circuit Facts Strip */}
      <div>
        <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
          <MapIcon className="w-4 h-4 text-[#E10600]" />
          {circuit.name}
        </h2>
        <p className="text-xs text-zinc-400">
          {circuit.city}, {circuit.country}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-zinc-800">
        <div>
          <p className="text-[11px] text-zinc-400">Length</p>
          <p className="text-sm font-bold text-white">{circuit.length_km} km</p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-400">Corners</p>
          <p className="text-sm font-bold text-white">{circuit.corners || "-"}</p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-400">First GP</p>
          <p className="text-sm font-bold text-white">{circuit.first_gp || "-"}</p>
        </div>
      </div>

      {/* Straight Mode Zone Selector Pills */}
      {zones.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Ketuk Pin atau Zona Straight Mode (2026)
          </p>
          <div className="flex flex-wrap gap-2">
            {zones.map((zone, idx) => {
              const active = selectedZone?.id === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`flex-1 min-w-[125px] px-3 py-2 rounded-xl text-left border transition ${
                    active
                      ? "bg-cyan-500/15 border-cyan-400 text-white"
                      : "bg-[#121218] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                    Zona Z{idx + 1}
                  </span>
                  <span className="text-xs font-semibold truncate block">
                    {zone.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Telemetry Readout Card */}
      {selectedZone && (
        <div className="p-3.5 rounded-xl bg-[#121218] border border-cyan-500/30 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Active Aero Telemetry
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {selectedZone.name}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase">
              X-Mode Open
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg bg-[#1a1a22] border border-zinc-800">
              <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-cyan-400" /> Panjang Zona
              </p>
              <p className="text-base font-extrabold font-mono mt-0.5">
                {selectedZone.length_m}{" "}
                <span className="text-xs font-normal text-zinc-400">meter</span>
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1a1a22] border border-zinc-800">
              <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-[#E10600]" /> Est. Top Speed
              </p>
              <p className="text-base font-extrabold font-mono text-cyan-300 mt-0.5">
                {selectedZone.top_speed_kmh}{" "}
                <span className="text-xs font-normal text-zinc-400">km/h</span>
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Speed Potential (Active Aero)</span>
              <span className="font-mono text-cyan-300">
                {selectedZone.top_speed_kmh} / 380 km/h
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-[#E10600] transition-all duration-300"
                style={{ width: `${speedPercent}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Aktivasi: {selectedZone.activation_point}</span>
          </p>
        </div>
      )}

      {/* Fullscreen Map Zoom Lightbox */}
      {zoomMap && (
        <div
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomMap(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#f1f5f9] p-4 space-y-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-zinc-900">
              <p className="text-xs font-extrabold uppercase">
                {circuit.name} • 2026 Track Map
              </p>
              <button
                type="button"
                onClick={() => setZoomMap(false)}
                className="p-1 rounded-lg bg-zinc-200 hover:bg-zinc-300"
                aria-label="Tutup peta"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={circuit.map_image_url}
              alt={circuit.name}
              className="w-full max-h-[70vh] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
