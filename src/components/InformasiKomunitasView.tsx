import React from 'react';
import { Calendar, Users, Award, Eye, Heart } from 'lucide-react';
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
      {/* Dynamic Community Bulletins Section (Separated as requested) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div>
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Warta & Buletin Komunitas
            </h3>
            <p className="font-mono text-[9px] text-zinc-500 uppercase mt-0.5">
              Rilis resmi dan pengumuman keanggotaan Biro BERDON
            </p>
          </div>
          <span className="font-mono text-[9px] text-zinc-400 border border-zinc-900 bg-zinc-950 px-2 py-0.5 rounded">
            {communityContents.length} Rilis
          </span>
        </div>

        {communityContents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-900 rounded bg-zinc-950/40">
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
                className="group cursor-pointer flex gap-4 border border-zinc-850 bg-zinc-950 p-3.5 rounded-md hover:border-zinc-500 hover:bg-zinc-900/40 transition-all duration-300 items-start"
              >
                {/* Thumbnail if exists */}
                {item.image_url ? (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded bg-zinc-900 border border-zinc-850 overflow-hidden flex-shrink-0">
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
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center flex-shrink-0">
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
                    <p className="text-[10.5px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
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
    </div>
  );
}
