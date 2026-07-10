import React from 'react';
import { Calendar, Users, Award, ShieldAlert, ChevronRight, Eye, Heart, Info, Target, Compass } from 'lucide-react';
import { ContentItem } from '../types';

interface InformasiKomunitasViewProps {
  communityContents: ContentItem[];
  onSelectContent: (item: ContentItem) => void;
}

export default function InformasiKomunitasView({
  communityContents,
  onSelectContent,
}: InformasiKomunitasViewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Community Introduction Hero */}
      <section className="bg-zinc-950 border border-zinc-800 rounded-md p-6 md:p-10 relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 border border-zinc-800 px-2 py-1 rounded bg-black">
            Profil Komunitas
          </span>
          <h2 className="font-display font-bold text-xl md:text-3xl text-white tracking-tight mt-4">
            Bureau for Education and Research In Development of Open Notion
          </h2>
          <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
            𝐁𝐄𝐑𝐃𝐎𝐍 • 9 SEPTEMBER 2023 — SEKARANG
          </p>

          <p className="text-zinc-400 text-xs md:text-sm mt-4 font-light leading-relaxed text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 border-t border-zinc-900 pt-6">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-display font-medium text-[11px] text-zinc-300 uppercase">Motto 𝐁𝐄𝐑𝐃𝐎𝐍</h4>
                <p className="font-serif italic text-[11px] text-zinc-400 mt-0.5">"Unitas et Scientia Vincere Nos Ducunt"</p>
                <p className="text-[9px] font-mono text-zinc-600">"Persatuan & Ilmu Pengetahuan Menuntun Kita Menuju Kemenangan"</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-display font-medium text-[11px] text-zinc-300 uppercase">Visi</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-light leading-snug">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Compass className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-display font-medium text-[11px] text-zinc-300 uppercase">Misi</h4>
                <ul className="text-[10px] text-zinc-400 mt-0.5 font-light list-decimal list-inside space-y-1">
                  <li>Meningkatkan mutu pendidikan & wawasan sejarah</li>
                  <li>Mengembangkan pola pikir terbuka dan kritis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Community Bulletins Section (Separated as requested) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Warta & Buletin Komunitas
            </h3>
            <p className="font-mono text-[9px] text-zinc-500 uppercase mt-0.5">
              Rilis resmi, pengumuman, dan arsip milik 𝐁𝐄𝐑𝐃𝐎𝐍
            </p>
          </div>
          <span className="font-mono text-[9px] text-zinc-400 border border-zinc-800 bg-zinc-950 px-2 py-0.5 rounded">
            {communityContents.length} Rilis
          </span>
        </div>

        {communityContents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded bg-zinc-950">
            <Users className="h-6 w-6 text-zinc-700 mx-auto mb-2" />
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Belum ada informasi komunitas yang diterbitkan</p>
            <p className="text-[9px] text-zinc-600 mt-1 font-mono">Gunakan panel admin untuk menambahkan rilis baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityContents.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectContent(item)}
                className="group cursor-pointer flex gap-4 border border-zinc-800 bg-zinc-950 p-3.5 rounded-md hover:border-zinc-500 hover:bg-zinc-900/40 transition-all duration-300 items-start"
              >
                {/* Thumbnail if exists */}
                {item.image_url ? (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover filter grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                  </div>
                )}

                {/* Info summary */}
                <div className="flex-grow flex flex-col justify-between min-h-16 md:min-h-20">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 mb-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <h4 className="font-display font-medium text-xs text-white group-hover:text-zinc-300 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.content.replace(/[#*`]/g, '')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2 mt-2 font-mono text-[9px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-zinc-600" /> {item.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-zinc-600 group-hover:text-red-500 transition-colors" /> {item.likes} likes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History and Values */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="border border-zinc-800 p-5 rounded bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5 mb-3">
            <Users className="h-4 w-4 text-zinc-500" />
            <h4 className="font-display font-medium text-[11px] text-white uppercase tracking-wider">Latar Belakang</h4>
          </div>
          <p className="text-[11px] text-zinc-400 font-light leading-relaxed text-justify">
            BERDON didirikan pada tanggal 9 September 2023 atas inisiatif kolektif para akademisi dan peneliti muda yang menyadari 
            perlunya wadah alternatif penyebaran karya ilmiah. Sejak pembentukannya, BERDON telah mempublikasikan 
            berbagai kajian penelitian independen di bidang kebijakan teknologi, metodologi sains terbuka, dan sosiologi edukasi.
          </p>
        </div>

        <div className="border border-zinc-800 p-5 rounded bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5 mb-3">
            <Award className="h-4 w-4 text-zinc-500" />
            <h4 className="font-display font-medium text-[11px] text-white uppercase tracking-wider">Nilai Kebersamaan</h4>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2 items-start">
              <span className="text-[9px] font-mono border border-zinc-800 text-zinc-400 px-1 py-0.5 rounded bg-black">01</span>
              <div>
                <h5 className="text-[11px] font-medium text-zinc-300">Integritas Keilmuan</h5>
                <p className="text-[9px] text-zinc-500 font-light mt-0.5">Setiap analisis, jurnal, dan materi pendidikan didasarkan pada metode sains yang sahih.</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-[9px] font-mono border border-zinc-800 text-zinc-400 px-1 py-0.5 rounded bg-black">02</span>
              <div>
                <h5 className="text-[11px] font-medium text-zinc-300">Kedaulatan Akses</h5>
                <p className="text-[9px] text-zinc-500 font-light mt-0.5">Semua hasil kajian publik wajib didistribusikan secara transparan kepada khalayak ramai.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
