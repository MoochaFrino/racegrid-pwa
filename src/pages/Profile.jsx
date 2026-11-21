import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Camera,
  Code2,
  Download,
  ExternalLink,
  GraduationCap,
  Heart,
  Info,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldCheck,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import { BASE_URL, getTeams } from "../services/api";
import { FULL_TEAMS_2026 } from "../data/enrichment2026";
import {
  getProfilePrefs,
  saveProfilePrefs,
  getVscDemoMode,
  setVscDemoMode,
  STORAGE_EVENT,
} from "../utils/storage";
import {
  getPwaInstallState,
  subscribePwaInstall,
  triggerPwaInstall,
} from "../utils/pwaInstall";

function resizeImageToDataUrl(file, size = 256) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Pilih file gambar (JPG, PNG, atau WebP)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format gambar tidak didukung."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const [teams, setTeams] = useState(FULL_TEAMS_2026);
  const [prefs, setPrefs] = useState(getProfilePrefs);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [vscDemo, setVscDemo] = useState(getVscDemoMode);
  const [apiStatus, setApiStatus] = useState({
    state: "checking",
    latencyMs: null,
  });
  const [pwaState, setPwaState] = useState(getPwaInstallState);
  const [installMessage, setInstallMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);
  const swSupported =
    typeof navigator !== "undefined" && "serviceWorker" in navigator;

  useEffect(() => {
    getTeams()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTeams(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const syncNetwork = () => setIsOnline(navigator.onLine);
    const syncPrefs = () => {
      setPrefs(getProfilePrefs());
      setVscDemo(getVscDemoMode());
    };

    window.addEventListener("online", syncNetwork);
    window.addEventListener("offline", syncNetwork);
    window.addEventListener(STORAGE_EVENT, syncPrefs);
    const unsubPwa = subscribePwaInstall(setPwaState);

    return () => {
      window.removeEventListener("online", syncNetwork);
      window.removeEventListener("offline", syncNetwork);
      window.removeEventListener(STORAGE_EVENT, syncPrefs);
      unsubPwa();
    };
  }, []);

  const checkApiHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}/`, { cache: "no-store" });
      const latencyMs = Math.round(performance.now() - start);
      if (!res.ok) throw new Error("API error");
      return { state: "online", latencyMs };
    } catch {
      return { state: "offline", latencyMs: null };
    }
  };

  const pingApi = async () => {
    setApiStatus({ state: "checking", latencyMs: null });
    const result = await checkApiHealth();
    setApiStatus(result);
  };

  useEffect(() => {
    let active = true;
    checkApiHealth().then((result) => {
      if (active) setApiStatus(result);
    });
    return () => {
      active = false;
    };
  }, [isOnline]);

  const activeTeam =
    teams.find((t) => Number(t.id) === Number(prefs.favoriteTeamId)) ||
    teams[0];
  const accentColor = activeTeam?.primary_color || "#E10600";

  const allDrivers = teams.flatMap((t) => [
    { name: t.driver_1_name, number: t.driver_1_number, teamName: t.name },
    { name: t.driver_2_name, number: t.driver_2_number, teamName: t.name },
  ]);

  const handleSelectTeam = (team) => {
    saveProfilePrefs({
      favoriteTeamId: team.id,
      favoriteDriverName: team.driver_1_name,
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarError("");
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      saveProfilePrefs({ avatarDataUrl: dataUrl });
    } catch (err) {
      setAvatarError(err.message || "Gagal memproses foto.");
    }
  };

  const handleInstallClick = async () => {
    const result = await triggerPwaInstall();
    if (result.outcome === "unavailable") {
      setInstallMessage(
        "Gunakan menu browser ('Add to Home screen' / ikon Install di address bar) untuk memasang PWA."
      );
    } else if (result.outcome === "accepted") {
      setInstallMessage("RaceGrid berhasil diinstal sebagai PWA!");
    }
  };

  return (
    <div className="space-y-5">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Profile &amp; Paddock Pass</h1>
        <p className="text-xs text-zinc-400">
          Kartu lisensi pengembang, preferensi tim favorit, dan diagnostik PWA
        </p>
      </header>

      {/* 1. FIA Paddock Pass / Super License Card */}
      <section
        className="rounded-2xl overflow-hidden bg-[#16161e] border shadow-xl transition-colors duration-300"
        style={{
          borderColor: `${accentColor}75`,
          boxShadow: `0 12px 32px -12px ${accentColor}55`,
        }}
      >
        {/* Top Lanyard Slot & Header */}
        <div
          className="px-4 py-3 flex items-center justify-between text-white"
          style={{
            background: `linear-gradient(120deg, ${accentColor} 0%, #181820 95%)`,
          }}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              FIA FORMULA 1 • 2026
            </p>
            <p className="text-xs font-extrabold tracking-wider uppercase">
              PADDOCK SUPER LICENSE
            </p>
          </div>
          <div className="w-10 h-3 rounded-full bg-black/50 border border-white/30" />
        </div>

        {/* Identity Body */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            {/* Hidden Local File Input for Profile Picture */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            {/* Profile Picture (Uploaded Photo or Default Driver Helmet SVG) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Ubah foto profil"
              aria-label="Ubah foto profil"
              className="w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 bg-[#111116] relative group focus:outline-none"
              style={{ borderColor: accentColor }}
            >
              {prefs.avatarDataUrl ? (
                <>
                  <img
                    src={prefs.avatarDataUrl}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                  <span
                    className="absolute top-1 right-1.5 text-[11px] font-black italic drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    style={{ color: accentColor }}
                  >
                    #{prefs.driverNumber || "45"}
                  </span>
                </>
              ) : (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="pass-bg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#111116" />
                    </linearGradient>
                  </defs>
                  <rect width="100" height="100" fill="url(#pass-bg)" />
                  <path
                    d="M14 100 C18 74 34 66 50 66 C66 66 82 74 86 100 Z"
                    fill="#1f1f29"
                    stroke={accentColor}
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="50"
                    cy="42"
                    r="22"
                    fill="#f4f4f5"
                    stroke={accentColor}
                    strokeWidth="2.5"
                  />
                  <path
                    d="M30 37 Q50 25 70 37"
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M32 39 Q50 36 68 39 L66 50 Q50 53 34 50 Z"
                    fill="#09090d"
                  />
                  <text
                    x="88"
                    y="24"
                    textAnchor="end"
                    fontSize="16"
                    fontWeight="900"
                    fontStyle="italic"
                    fill={accentColor}
                  >
                    #{prefs.driverNumber || "45"}
                  </text>
                </svg>
              )}

              {/* Camera Upload Overlay Badge */}
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/75 border border-white/25 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Camera className="w-3 h-3" />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <span
                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-1"
                style={{ backgroundColor: accentColor }}
              >
                ALL ACCESS • #{prefs.driverNumber || "45"}
              </span>
              <h2 className="text-base font-extrabold leading-tight">
                Christopher Justin Harto Oematan
              </h2>
              <p className="text-xs font-mono text-zinc-300 mt-1">
                NIM: 21120124140145
              </p>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                Teknik Komputer — UNDIP
              </p>
            </div>
          </div>

          {/* Dynamic Favorite Team & Driver Strip */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
            <div className="p-2.5 rounded-xl bg-[#111116] border border-zinc-800 flex items-center gap-2 min-w-0">
              {activeTeam?.logo_url && (
                <div
                  className="w-8 h-8 rounded-lg p-1.5 flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${
                      activeTeam.gradient_from || "#18181f"
                    }, ${activeTeam.gradient_to || accentColor})`,
                  }}
                >
                  <img
                    src={activeTeam.logo_url}
                    alt={activeTeam.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-400 uppercase">
                  Favorite Team
                </p>
                <p className="text-xs font-bold truncate">{activeTeam?.name}</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111116] border border-zinc-800 min-w-0">
              <p className="text-[10px] text-zinc-400 uppercase">
                Favorite Driver
              </p>
              <p className="text-xs font-bold truncate mt-0.5">
                {prefs.favoriteDriverName}
              </p>
            </div>
          </div>

          {/* Barcode Footer */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-dashed border-zinc-800">
            <svg
              viewBox="0 0 180 28"
              className="h-7 w-40 opacity-85"
              aria-hidden="true"
            >
              {[
                2, 6, 9, 14, 17, 21, 27, 30, 35, 39, 44, 49, 52, 58, 63, 67, 73,
                77, 83, 88, 92, 97, 102, 108, 112, 118, 123, 128, 134, 138, 144,
                149, 155, 160, 165, 171,
              ].map((x, idx) => (
                <rect
                  key={x}
                  x={x}
                  y="2"
                  width={idx % 3 === 0 ? 3 : 1.5}
                  height="24"
                  fill="#e4e4e7"
                />
              ))}
            </svg>
            <div className="text-right">
              <p className="text-[9px] font-mono text-zinc-400">
                UNDIP-CE-2026-145
              </p>
              <p className="text-[9px] font-bold uppercase text-emerald-400">
                VERIFIED PASS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Pilih Tim & Pembalap Favorit (localStorage) */}
      <section className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-[#E10600]" /> Kustomisasi Paddock Pass
          </h3>
          <span className="text-[10px] text-zinc-500">Tersimpan Otomatis</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 block">
            Tim Favorit (Mengubah Livery Kartu)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {teams.map((team) => {
              const selected = Number(team.id) === Number(activeTeam?.id);
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleSelectTeam(team)}
                  className={`p-2 rounded-xl border text-left transition flex items-center gap-1.5 ${
                    selected
                      ? "bg-zinc-800 text-white"
                      : "bg-[#111116] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                  style={selected ? { borderColor: team.primary_color } : {}}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: team.primary_color }}
                  />
                  <span className="text-[11px] font-bold truncate">
                    {team.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="col-span-2 space-y-1">
            <label
              htmlFor="fav-driver-select"
              className="text-[11px] font-semibold text-zinc-300 block"
            >
              Pembalap Favorit
            </label>
            <select
              id="fav-driver-select"
              value={prefs.favoriteDriverName}
              onChange={(e) =>
                saveProfilePrefs({ favoriteDriverName: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-[#111116] border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#E10600]"
            >
              {allDrivers.map((d) => (
                <option key={d.name} value={d.name}>
                  #{d.number} {d.name} ({d.teamName})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="driver-number-input"
              className="text-[11px] font-semibold text-zinc-300 block"
            >
              No. Balap
            </label>
            <input
              id="driver-number-input"
              type="text"
              maxLength={2}
              value={prefs.driverNumber}
              onChange={(e) =>
                saveProfilePrefs({
                  driverNumber: e.target.value.replace(/[^0-9]/g, ""),
                })
              }
              placeholder="45"
              className="w-full px-3 py-2 rounded-xl bg-[#111116] border border-zinc-800 text-xs font-mono font-bold text-center text-white focus:outline-none focus:border-[#E10600]"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111116] border border-zinc-800 hover:border-zinc-600 text-xs font-semibold text-zinc-200 transition"
            >
              <Camera className="w-3.5 h-3.5 text-[#E10600]" />
              {prefs.avatarDataUrl ? "Ganti Foto Profil" : "Upload Foto Profil"}
            </button>
            {prefs.avatarDataUrl && (
              <button
                type="button"
                onClick={() => saveProfilePrefs({ avatarDataUrl: "" })}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-300 transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
          {avatarError && (
            <span className="text-[11px] text-red-400">{avatarError}</span>
          )}
        </div>
      </section>

      {/* 3. Panel Status PWA & Koneksi API (Live Diagnostics) */}
      <section className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" /> Status PWA &amp; API Diagnostics
          </h3>
          <button
            type="button"
            onClick={pingApi}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 transition"
          >
            <RefreshCw className="w-3 h-3" /> Ping
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111116] border border-zinc-800">
            <span className="flex items-center gap-2 text-zinc-300">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-400" />
              )}
              Status Jaringan
            </span>
            <span
              className={`font-bold ${
                isOnline ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111116] border border-zinc-800">
            <span className="flex items-center gap-2 text-zinc-300">
              <Server className="w-4 h-4 text-cyan-400" />
              racegrid-api.vercel.app
            </span>
            <span className="font-mono font-bold">
              {apiStatus.state === "checking" && (
                <span className="text-zinc-400">Checking...</span>
              )}
              {apiStatus.state === "online" && (
                <span className="text-emerald-400">
                  OK ({apiStatus.latencyMs} ms)
                </span>
              )}
              {apiStatus.state === "offline" && (
                <span className="text-amber-400">Offline / Cache</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111116] border border-zinc-800">
            <span className="flex items-center gap-2 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Service Worker Workbox
            </span>
            <span className="font-bold text-emerald-400">
              {swSupported ? "READY (OFFLINE CACHE)" : "UNSUPPORTED"}
            </span>
          </div>
        </div>

        {/* PWA Install & VSC Simulator Controls */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={pwaState.isInstalled}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              pwaState.isInstalled
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 cursor-default"
                : "bg-[#E10600] hover:bg-[#c50500] text-white"
            }`}
          >
            <Download className="w-4 h-4" />
            {pwaState.isInstalled
              ? "Aplikasi RaceGrid Terinstal (Standalone)"
              : pwaState.canInstall
              ? "Install Aplikasi RaceGrid"
              : "Install Aplikasi RaceGrid (PWA)"}
          </button>

          <button
            type="button"
            onClick={() => setVscDemoMode(!vscDemo)}
            className={`w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
              vscDemo
                ? "bg-amber-400/20 border-amber-400 text-amber-300"
                : "bg-[#111116] border-zinc-800 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            {vscDemo
              ? "Matikan Simulasi Offline (VSC Banner)"
              : "Demo Banner Virtual Safety Car (Offline)"}
          </button>

          {installMessage && (
            <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
              {installMessage}
            </p>
          )}
        </div>
      </section>

      {/* 4. Tautan Cepat Pengembang & Tech Stack */}
      <section className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#E10600]" /> Tautan Pengembang &amp; API
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          RaceGrid adalah Progressive Web App (PWA) direktori sirkuit dan roster tim Formula 1 era Active Aero 2026 untuk Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (PPB).
        </p>

        <div className="grid grid-cols-1 gap-2">
          <a
            href="https://github.com/MoochaFrino"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-[#111116] border border-zinc-800 hover:border-zinc-600 transition text-xs font-semibold"
          >
            <span className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-white shrink-0"
                aria-hidden="true"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-1.95c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18.92-.25 1.9-.38 2.88-.38.98 0 1.96.13 2.88.38 2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.07.78 2.15v3.19c0 .31.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
              </svg>
              GitHub Developer (MoochaFrino)
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`${BASE_URL}/api/circuits`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#111116] border border-zinc-800 hover:border-zinc-600 transition text-[11px] font-mono text-zinc-300"
            >
              <span>/api/circuits</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
            <a
              href={`${BASE_URL}/api/teams`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#111116] border border-zinc-800 hover:border-zinc-600 transition text-[11px] font-mono text-zinc-300"
            >
              <span>/api/teams</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>
      </section>

      <section className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-[#E10600]" /> Tech Stack
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            "React",
            "Vite",
            "Tailwind CSS",
            "PWA Workbox",
            "SVG Telemetry",
            "Node.js",
            "Express.js",
            "Supabase",
            "Vercel",
          ].map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
