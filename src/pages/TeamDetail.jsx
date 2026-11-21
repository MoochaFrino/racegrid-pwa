import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  UserCheck,
  Wrench,
  Trophy,
  Star,
} from "lucide-react";
import { getTeamById } from "../services/api";
import CountryFlag from "../components/CountryFlag";
import {
  isTeamSaved,
  toggleSavedTeam,
  STORAGE_EVENT,
} from "../utils/storage";

function splitName(name) {
  const parts = String(name || "").trim().split(/\s+/);
  if (parts.length <= 1) return { first: "", last: name || "" };
  const last = parts.pop();
  return { first: parts.join(" "), last };
}

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState({ loadedId: null, team: null });
  const [saved, setSaved] = useState(() => isTeamSaved(id));

  useEffect(() => {
    let active = true;
    getTeamById(id)
      .then((data) => {
        if (active) setResult({ loadedId: id, team: data });
      })
      .catch((err) => {
        console.error(err);
        if (active) setResult({ loadedId: id, team: null });
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const sync = () => setSaved(isTeamSaved(id));
    window.addEventListener(STORAGE_EVENT, sync);
    return () => window.removeEventListener(STORAGE_EVENT, sync);
  }, [id]);

  const loading = result.loadedId !== id;
  const team = result.team;

  if (loading)
    return (
      <p className="text-sm text-zinc-400 text-center py-10">
        Memuat detail tim...
      </p>
    );
  if (!team)
    return (
      <p className="text-sm text-red-400 text-center py-10">
        Tim tidak ditemukan.
      </p>
    );

  const gradFrom = team.gradient_from || "#1a1a22";
  const gradTo = team.gradient_to || team.primary_color || "#E10600";

  const drivers = [
    {
      role: "Driver 1",
      name: team.driver_1_name,
      number: team.driver_1_number,
      flag: team.driver_1_flag,
      image: team.driver_1_image,
    },
    {
      role: "Driver 2",
      name: team.driver_2_name,
      number: team.driver_2_number,
      flag: team.driver_2_flag,
      image: team.driver_2_image,
    },
  ];

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
          onClick={() => setSaved(toggleSavedTeam(team.id))}
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

      {/* Team Hero Header + 2026 Car */}
      <div
        className="rounded-2xl border border-white/15 overflow-hidden relative shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div className="relative p-5 pb-3 space-y-3">
          <div className="flex items-center gap-3.5">
            {team.logo_url && (
              <div className="w-14 h-14 rounded-2xl bg-black/30 border border-white/20 p-2 flex items-center justify-center shrink-0 backdrop-blur-xs">
                <img
                  src={team.logo_url}
                  alt={`Logo ${team.name}`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-white/80 truncate">{team.full_name}</p>
              <h1 className="text-2xl font-black text-white mt-0.5 truncate">
                {team.name}
              </h1>
              <p className="text-xs text-white/85 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {team.base}
              </p>
            </div>
          </div>

          {team.car_image && (
            <div className="pt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mb-1">
                2026 Challenger • {team.chassis}
              </p>
              <img
                src={team.car_image}
                alt={`${team.name} ${team.chassis}`}
                className="w-full h-28 object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.5)]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Official F1 2026 Driver Lineup Cards (Horizontal Gradient Style) */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Drivers • 2026 Lineup
        </h2>
        <div className="space-y-3">
          {drivers.map((driver) => {
            const { first, last } = splitName(driver.name);
            return (
              <div
                key={driver.role}
                className="rounded-2xl overflow-hidden border border-white/15 relative h-40 flex items-stretch shadow-lg"
                style={{
                  background: `linear-gradient(115deg, ${gradFrom} 0%, ${gradTo} 100%)`,
                }}
              >
                {/* Halftone Dot Pattern */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
                    backgroundSize: "9px 9px",
                  }}
                />

                {/* Left Info */}
                <div className="relative z-10 flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-sm font-semibold text-white/95 leading-tight">
                      {first}
                    </p>
                    <p className="text-xl font-black text-white leading-tight truncate">
                      {last}
                    </p>
                    <p className="text-[11px] font-medium text-white/80 mt-0.5">
                      {team.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-2xl font-black tracking-tighter text-transparent"
                      style={{
                        WebkitTextStroke: "1.5px rgba(255,255,255,0.92)",
                      }}
                    >
                      {driver.number}
                    </span>
                    {driver.flag && (
                      <CountryFlag
                        flag={driver.flag}
                        size="sm"
                        showName
                        className="drop-shadow-xs"
                      />
                    )}
                  </div>
                </div>

                {/* Right Cutout Driver Portrait (Top-anchored so head is never cropped) */}
                <div className="relative z-10 w-36 shrink-0 overflow-hidden pt-1.5 flex items-start justify-center">
                  {driver.image && (
                    <img
                      src={driver.image}
                      alt={driver.name}
                      className="w-full h-[215%] object-cover object-top drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Specs */}
      <section className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Spesifikasi Teknis
        </h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Team Principal
          </span>
          <span className="font-semibold">{team.team_principal}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Power Unit / Sasis
          </span>
          <span className="font-semibold">
            {team.engine} ({team.chassis})
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Juara Konstruktor
          </span>
          <span className="font-semibold">{team.championships}x</span>
        </div>
      </section>

      <div className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
          Profil Tim
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {team.description}
        </p>
      </div>
    </div>
  );
}
