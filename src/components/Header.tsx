import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Layers, Shield, MoreVertical, LogOut } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function Header({ currentTab, setCurrentTab, isAdmin, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabSelect = (tab: 'informasi' | 'komunitas' | 'admin') => {
    setCurrentTab(tab);
    setMenuOpen(false);
  };

  return (
    <header className="border-b border-zinc-900 bg-[#0d0d0d] py-5 px-4 md:px-8 relative z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Branding & Logo */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
          <h1 className="font-display text-sm font-bold uppercase tracking-widest text-white">
            BERDON INFORMATION CENTER
          </h1>
        </div>

        {/* Minimalist Three-Dot Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded border border-zinc-850 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all duration-200 focus:outline-none"
            aria-label="Menu"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Smooth Dropdown List */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-zinc-850 rounded shadow-xl py-1 z-50 animate-fade-in divide-y divide-zinc-900">
              <div className="py-1">
                <button
                  onClick={() => handleTabSelect('informasi')}
                  className={`w-full text-left px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    currentTab === 'informasi'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Pusat Informasi
                </button>
                
                <button
                  onClick={() => handleTabSelect('komunitas')}
                  className={`w-full text-left px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    currentTab === 'komunitas'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Info Komunitas
                </button>

                <button
                  onClick={() => handleTabSelect('admin')}
                  className={`w-full text-left px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    currentTab === 'admin'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  {isAdmin ? 'Admin Panel' : 'Admin'}
                </button>
              </div>

              {isAdmin && (
                <div className="py-1">
                  <button
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Keluar Admin
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

