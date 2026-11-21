import { X, Wind, CornerDownRight, Zap, Info } from "lucide-react";

export default function Regulation2026Modal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#181820] border border-zinc-700 p-5 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
              <Info className="w-3 h-3" /> Regulasi FIA 2026
            </span>
            <h3 className="text-lg font-extrabold mt-1.5">
              Active Aero: Straight Mode vs DRS
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Mulai musim <strong>Formula 1 2026</strong>, sistem DRS tradisional dihapus dan digantikan oleh <strong>Active Aerodynamics</strong> yang menggerakkan elemen sayap depan &amp; belakang secara bersamaan di setiap lap.
        </p>

        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-[#111116] border border-cyan-500/30 flex gap-3">
            <Wind className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-cyan-300">
                Straight Mode (X-Mode)
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Sayap depan &amp; belakang membuka di zona trek lurus yang ditentukan FIA untuk memangkas <em>drag</em> dan meningkatkan kecepatan puncak (tidak perlu selisih &lt; 1 detik).
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111116] border border-zinc-800 flex gap-3">
            <CornerDownRight className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-300">
                Corner Mode (Z-Mode)
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Elemen sayap kembali ke sudut penuh sebelum zona pengereman untuk menghasilkan <em>downforce</em> dan stabilitas maksimal di tikungan.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111116] border border-[#E10600]/30 flex gap-3">
            <Zap className="w-5 h-5 text-[#E10600] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-400">
                Overtake Mode (Manual Override)
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Pengganti fungsi menyalip DRS: pembalap dalam jarak 1 detik mendapat ekstra energi listrik dari MGU-K 350 kW untuk mempertahankan daya akselerasi di kecepatan tinggi.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#E10600] hover:bg-[#c50500] text-xs font-bold uppercase tracking-wider text-white transition"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
