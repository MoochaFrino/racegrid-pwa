import { useEffect, useState } from "react";
import { AlertTriangle, WifiOff, X } from "lucide-react";
import { getVscDemoMode, setVscDemoMode, STORAGE_EVENT } from "../utils/storage";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [vscDemo, setVscDemo] = useState(getVscDemoMode);

  useEffect(() => {
    const syncOnline = () => setIsOnline(navigator.onLine);
    const syncDemo = () => setVscDemo(getVscDemoMode());

    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    window.addEventListener(STORAGE_EVENT, syncDemo);
    return () => {
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
      window.removeEventListener(STORAGE_EVENT, syncDemo);
    };
  }, []);

  if (isOnline && !vscDemo) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-400 text-zinc-950 border-b-2 border-zinc-950 shadow-md">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-zinc-950 text-amber-400 flex items-center justify-center shrink-0">
            {!isOnline ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wider leading-tight flex items-center gap-1.5">
              <span>VIRTUAL SAFETY CAR</span>
              <span className="px-1.5 py-0.2 bg-zinc-950 text-amber-400 rounded text-[9px]">
                {!isOnline ? "OFFLINE" : "SIMULASI"}
              </span>
            </p>
            <p className="text-[11px] font-semibold text-zinc-900 truncate">
              Menampilkan Data Cache Offline Workbox PWA
            </p>
          </div>
        </div>
        {isOnline && vscDemo && (
          <button
            type="button"
            onClick={() => setVscDemoMode(false)}
            className="p-1 rounded-md bg-zinc-950/15 hover:bg-zinc-950/25 shrink-0"
            title="Matikan simulasi VSC"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
