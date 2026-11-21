import { Code2, GraduationCap, Info } from "lucide-react";

export default function Profile() {
  return (
    <div className="space-y-5">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Profile & About</h1>
        <p className="text-xs text-zinc-400">Informasi pengembang dan aplikasi</p>
      </header>

      <section className="p-5 rounded-2xl bg-[#1a1a22] border border-zinc-800 text-center space-y-2">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#E10600]/20 border-2 border-[#E10600] flex items-center justify-center text-2xl font-black text-[#E10600]">
          CJ
        </div>
        <h2 className="text-lg font-bold">Christopher Justin Harto Oematan</h2>
        <p className="text-sm text-[#E10600] font-mono">NIM: 21120124140145</p>
        <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
          <GraduationCap className="w-4 h-4" />
          Teknik Komputer — Universitas Diponegoro
        </p>
      </section>

      <section className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#E10600]" /> Tentang RaceGrid
        </h3>
        <p className="text-sm text-zinc-300 leading-relaxed">
          RaceGrid adalah Progressive Web App (PWA) direktori sirkuit dan roster tim Formula 1 yang dibangun untuk Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (PPB) 2026.
        </p>
      </section>

      <section className="p-4 rounded-xl bg-[#1a1a22] border border-zinc-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-[#E10600]" /> Tech Stack
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {["React", "Vite", "Tailwind CSS", "PWA", "Node.js", "Express.js", "Supabase", "Vercel"].map(
            (tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-200"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </section>
    </div>
  );
}