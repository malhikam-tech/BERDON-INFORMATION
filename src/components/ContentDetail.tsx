import React from 'react';
import { Heart, Eye, Calendar, ArrowLeft, Share2, CornerDownRight } from 'lucide-react';
import { ContentItem } from '../types';

interface ContentDetailProps {
  item: ContentItem;
  onLike: (id: string) => void;
  onBack: () => void;
  isLiked: boolean;
}

export default function ContentDetail({ item, onLike, onBack, isLiked }: ContentDetailProps) {
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch {
      return dateStr;
    }
  };

  const fallbackImage = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`;
  const displayImage = item.image_url || fallbackImage;

  // Split content by double newlines into elegant paragraphs
  const paragraphs = item.content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4 md:p-8 animate-fade-in">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Kembali ke Daftar
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
            Kategori: <strong className="text-zinc-300">
              {item.category === 'artikel' && 'Artikel'}
              {item.category === 'materi' && 'Materi'}
              {item.category === 'berita' && 'Berita'}
              {item.category === 'arsip' && 'Arsip'}
              {item.category === 'info_komunitas' && 'Info Komunitas'}
            </strong>
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto">
        {/* Title & Metadata */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              BERDON ACADEMIC PLATFORM
            </span>
          </div>
          <h2 className="font-display font-bold text-lg md:text-2xl text-white tracking-tight leading-tight">
            {item.title}
          </h2>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[10px] font-mono text-zinc-500 border-t border-b border-zinc-900 py-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-zinc-600" />
              {formatDate(item.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-zinc-600" />
              {item.views} Kali Dilihat
            </span>
            <span className="flex items-center gap-1">
              <Heart className={`h-3.5 w-3.5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-zinc-600'}`} />
              {item.likes} Menyukai
            </span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-video w-full rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 mb-8">
          <img
            src={displayImage}
            alt={item.title}
            className="w-full h-full object-cover filter grayscale"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Document Content */}
        <div className="text-zinc-300 text-xs md:text-sm leading-relaxed font-sans space-y-5 antialiased font-light max-w-none">
          {paragraphs.map((para, idx) => {
            // Check if paragraph is an quote or list item or header to render beautifully
            if (para.startsWith('>')) {
              return (
                <blockquote key={idx} className="border-l-2 border-zinc-500 pl-4 py-1 italic text-zinc-400 my-4 bg-zinc-900/30 rounded-r">
                  {para.replace(/^>\s*/, '')}
                </blockquote>
              );
            }
            if (para.startsWith('-') || para.startsWith('*')) {
              const listItems = para.split(/\n[-*]\s*/).filter(item => item.trim().length > 0);
              return (
                <ul key={idx} className="list-none space-y-2 my-4 pl-2">
                  {listItems.map((li, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-2 text-zinc-300">
                      <CornerDownRight className="h-3.5 w-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-justify font-sans leading-relaxed tracking-wide">
                {para}
              </p>
            );
          })}
        </div>

        {/* Article Footer & Interactive Action Button */}
        <div className="border-t border-zinc-800 mt-12 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="font-mono text-[9px] text-zinc-500 leading-snug">
            <div>PENERBIT: DEPARTEMEN PENELITIAN & PUBLIKASI BERDON</div>
            <div>DOKUMEN INTEGRITAS: VERIFIKASI DIGITAL BERDON-OK</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onLike(item.id)}
              disabled={isLiked}
              className={`flex items-center gap-2 px-4 py-2 border rounded font-mono text-[10px] uppercase tracking-wider transition-all duration-300 ${
                isLiked
                  ? 'border-red-900/50 bg-red-950/20 text-red-400 cursor-not-allowed'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-500 text-zinc-300 hover:text-white'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-zinc-500'}`} />
              {isLiked ? 'Disukai' : 'Sukai Konten'}
            </button>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Tautan artikel berhasil disalin ke papan klip!');
              }}
              className="flex items-center gap-1.5 px-3 py-2 border border-zinc-800 bg-zinc-900 hover:border-zinc-500 text-zinc-300 hover:text-white rounded font-mono text-[10px] uppercase tracking-wider transition-all"
            >
              <Share2 className="h-3 w-3" />
              Bagikan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
