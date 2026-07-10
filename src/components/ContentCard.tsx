import React from 'react';
import { Eye, Heart, Calendar, FileText, BookOpen, AlertCircle, Bookmark } from 'lucide-react';
import { ContentItem } from '../types';

interface ContentCardProps {
  item: ContentItem;
  onSelect: (item: ContentItem) => void | Promise<void>;
  isSelected?: boolean;
}

export default function ContentCard({ item, onSelect, isSelected = false }: ContentCardProps) {
  // Utility to format date nicely
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch {
      return dateStr;
    }
  };

  // Get nice category label & icon
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'artikel':
        return { label: 'Artikel', color: 'border-zinc-700 text-zinc-300 bg-zinc-900', icon: FileText };
      case 'materi':
        return { label: 'Materi', color: 'border-zinc-800 text-zinc-400 bg-zinc-950', icon: BookOpen };
      case 'berita':
        return { label: 'Berita', color: 'border-zinc-600 text-white bg-zinc-800', icon: AlertCircle };
      case 'arsip':
        return { label: 'Arsip', color: 'border-zinc-900 text-zinc-500 bg-black', icon: Bookmark };
      default:
        return { label: 'Info Komunitas', color: 'border-zinc-700 text-zinc-300 bg-zinc-900', icon: FileText };
    }
  };

  const catDetails = getCategoryDetails(item.category);
  const IconComponent = catDetails.icon;

  // Placeholder images using minimal CSS pattern or beautiful grayscale default if image is missing
  const fallbackImage = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80`;
  const displayImage = item.image_url || fallbackImage;

  return (
    <article
      onClick={() => onSelect(item)}
      className={`group cursor-pointer border rounded-md transition-all duration-300 overflow-hidden flex flex-col h-full ${
        isSelected
          ? 'border-white bg-zinc-900 shadow-lg shadow-black/40'
          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900/50'
      }`}
    >
      {/* Article Image (Minimal Grayscale Overtones) */}
      <div className="relative h-32 md:h-36 w-full bg-zinc-900 overflow-hidden border-b border-zinc-800">
        <img
          src={displayImage}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale opacity-75 group-hover:opacity-100 group-hover:grayscale-0"
          onError={(e) => {
            // If the user's supabase image upload fails or is private, fallback nicely
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`flex items-center gap-1 border px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${catDetails.color}`}>
            <IconComponent className="h-2.5 w-2.5" />
            {catDetails.label}
          </span>
        </div>
      </div>

      {/* Content Meta & Details */}
      <div className="p-3.5 flex flex-col flex-grow justify-between">
        <div>
          {/* Created At Date */}
          <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 mb-1">
            <Calendar className="h-2.5 w-2.5" />
            {formatDate(item.created_at)}
          </div>

          {/* Title */}
          <h3 className="font-display font-medium text-xs text-white tracking-tight line-clamp-2 leading-snug group-hover:text-zinc-200 transition-colors">
            {item.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[10.5px] text-zinc-400 mt-1.5 line-clamp-2 font-sans font-light leading-relaxed">
            {item.content.replace(/[#*`]/g, '')}
          </p>
        </div>

        {/* Foot Stats */}
        <div className="flex items-center justify-between border-t border-zinc-900 pt-2.5 mt-3 text-[9px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-zinc-600" />
            {item.views} views
          </span>
          <span className="flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
            <Heart className="h-3 w-3 text-zinc-600 group-hover:text-red-500 transition-colors" />
            {item.likes} likes
          </span>
        </div>
      </div>
    </article>
  );
}
