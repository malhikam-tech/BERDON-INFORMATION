import React, { useState, useEffect } from 'react';
import {
  Search,
  Info,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { ContentItem, ContentCategory } from './types';
import Header from './components/Header';
import ContentCard from './components/ContentCard';
import ContentDetail from './components/ContentDetail';
import InformasiKomunitasView from './components/InformasiKomunitasView';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<'informasi' | 'komunitas' | 'admin'>('informasi');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('semua');

  // Supabase Database Connection States
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Likes Tracking (Local Session cache to prevent spamming)
  const [likedSessionItems, setLikedSessionItems] = useState<string[]>([]);

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize and check sessionStorage
  useEffect(() => {
    const adminSession = sessionStorage.getItem('berdon_admin_session');
    if (adminSession === 'authenticated') {
      setIsAdmin(true);
    }

    // Load liked items from localStorage
    const liked = JSON.parse(localStorage.getItem('berdon_liked_items') || '[]');
    setLikedSessionItems(liked);

    // Initial Database Fetch
    fetchDatabaseContents();
  }, []);

  // Fetch from Supabase
  const fetchDatabaseContents = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setContents(data || []);
    } catch (err: any) {
      console.error('Supabase fetch failed:', err);
      setDbError(err.message || 'Database connection error');
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  // Add Content action (called by Admin Panel)
  const handleAddContent = async (
    newItem: Omit<ContentItem, 'id' | 'likes' | 'views' | 'created_at'>
  ): Promise<boolean> => {
    const freshPayload = {
      ...newItem,
      likes: 0,
      views: 0,
      created_at: new Date().toISOString(),
    };

    try {
      // Supabase insert
      const { error } = await supabase
        .from('contents')
        .insert([freshPayload]);

      if (error) throw error;

      await fetchDatabaseContents();
      return true;
    } catch (err: any) {
      console.error('Insert error:', err);
      alert(`Gagal menambahkan konten ke database: ${err.message || 'Error'}`);
      return false;
    }
  };

  // Update Content action (called by Admin Panel)
  const handleUpdateContent = async (id: string, updatedFields: Partial<ContentItem>): Promise<boolean> => {
    try {
      // Supabase update
      const { error } = await supabase
        .from('contents')
        .update(updatedFields)
        .eq('id', id);

      if (error) throw error;

      await fetchDatabaseContents();
      if (selectedItem?.id === id) {
        setSelectedItem(prev => (prev ? { ...prev, ...updatedFields } : null));
      }
      return true;
    } catch (err: any) {
      console.error('Update error:', err);
      alert(`Gagal memperbarui konten di database: ${err.message || 'Error'}`);
      return false;
    }
  };

  // Delete Content action (called by Admin Panel)
  const handleDeleteContent = async (id: string): Promise<boolean> => {
    try {
      // Supabase delete
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchDatabaseContents();
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      return true;
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Gagal menghapus konten di database: ${err.message || 'Error'}`);
      return false;
    }
  };

  // Increment views dynamically when a user opens an item
  const handleSelectContent = async (item: ContentItem) => {
    setSelectedItem(item);
    
    // Increment local state views instantly
    setContents(prev =>
      prev.map(c => (c.id === item.id ? { ...c, views: c.views + 1 } : c))
    );
    setSelectedItem(prev => (prev ? { ...prev, views: prev.views + 1 } : null));

    // Async increment in database
    try {
      await supabase
        .from('contents')
        .update({ views: item.views + 1 })
        .eq('id', item.id);
    } catch (err) {
      console.warn('Gagal mencatatkan views ke server:', err);
    }
  };

  // Handle like increments
  const handleLikeContent = async (id: string) => {
    if (likedSessionItems.includes(id)) return;

    const newLiked = [...likedSessionItems, id];
    setLikedSessionItems(newLiked);
    localStorage.setItem('berdon_liked_items', JSON.stringify(newLiked));

    // Update local states
    setContents(prev =>
      prev.map(c => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
    if (selectedItem?.id === id) {
      setSelectedItem(prev => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }

    // Async increment in database
    try {
      const itemToLike = contents.find(c => c.id === id);
      if (itemToLike) {
        await supabase
          .from('contents')
          .update({ likes: itemToLike.likes + 1 })
          .eq('id', id);
      }
    } catch (err) {
      console.warn('Gagal mencatatkan likes ke server:', err);
    }
  };

  // Filter & Search contents for "Pusat Informasi" (tab: 'informasi')
  // We exclude 'info_komunitas' here as it has its own dedicated Tab!
  const filteredInformasiContents = contents.filter(item => {
    if (item.category === 'info_komunitas') return false;

    // Apply category sub-filter tag
    if (activeFilter !== 'semua' && item.category !== activeFilter) return false;

    // Apply keyword search
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchContent = item.content.toLowerCase().includes(query);
      return matchTitle || matchContent;
    }

    return true;
  });

  // Filter contents for "Info Komunitas" tab
  const communityContents = contents.filter(item => item.category === 'info_komunitas');

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-sans flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* BERDON Header Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedItem(null); // Clear selected reading pane
        }}
        isAdmin={isAdmin}
        onLogout={() => {
          setIsAdmin(false);
          sessionStorage.removeItem('berdon_admin_session');
        }}
      />

      {/* Main Content Body */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col">
        {/* Loading Spinner */}
        {loading && contents.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center py-24">
            <RefreshCw className="h-6 w-6 text-zinc-500 animate-spin mb-3" />
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              Memuat Pusat Informasi...
            </span>
          </div>
        ) : (
          <>
            {/* TAB 1: PUSAT INFORMASI */}
            {currentTab === 'informasi' && (
              <div className="flex-grow flex flex-col gap-6">
                {/* Details pane overlay/split layout */}
                {selectedItem ? (
                  <ContentDetail
                    item={selectedItem}
                    onLike={handleLikeContent}
                    onBack={() => setSelectedItem(null)}
                    isLiked={likedSessionItems.includes(selectedItem.id)}
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
                    
                    {/* LEFT BAR: Interactive Filter Tags & Document Search */}
                    <aside className="lg:col-span-3 space-y-6">
                      {/* Brand Statement Card */}
                      <div className="border border-zinc-900 bg-zinc-950/40 p-4 rounded-md">
                        <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider block mb-1">
                          𝐁𝐄𝐑𝐃𝐎𝐍 𝐂𝐄𝐍𝐓𝐄𝐑
                        </span>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-zinc-400" />
                          <h4 className="font-display font-medium text-xs text-white uppercase tracking-tight">
                            Pusat Informasi Komunitas
                          </h4>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed font-light">
                          Gunakan panel pencarian dan penyaring di bawah untuk menelusuri naskah ilmiah, riset, serta modul materi instruksional kami.
                        </p>
                      </div>

                      {/* Search Bar */}
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                          Pencarian Dokumen
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Cari judul atau isi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 pl-8 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors font-sans"
                          />
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-600" />
                        </div>
                      </div>

                      {/* Filter Sub-categories */}
                      <div className="space-y-2">
                        <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                          Saring Kategori
                        </span>
                        <div className="flex flex-col gap-1 border border-zinc-900 bg-zinc-950 rounded p-1">
                          {[
                            { value: 'semua', label: 'Semua' },
                            { value: 'artikel', label: 'Artikel' },
                            { value: 'materi', label: 'Materi' },
                            { value: 'berita', label: 'Berita' },
                            { value: 'arsip', label: 'Arsip' }
                          ].map((tab) => (
                            <button
                              key={tab.value}
                              onClick={() => setActiveFilter(tab.value)}
                              className={`w-full text-left px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wide transition-all ${
                                activeFilter === tab.value
                                  ? 'bg-zinc-900 text-white font-medium border-l-2 border-zinc-400'
                                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </aside>

                    {/* RIGHT BAR: List Grid */}
                    <section className="lg:col-span-9 space-y-4 flex-grow">
                      {/* Grid Header Info */}
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">
                          Katalog Hasil Pencarian
                        </span>
                        <span className="font-mono text-[9px] text-zinc-400">
                          {filteredInformasiContents.length} publikasi ditemukan
                        </span>
                      </div>

                      {/* List Cards */}
                      {filteredInformasiContents.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-zinc-900 rounded bg-zinc-950/20">
                          <Info className="h-6 w-6 text-zinc-800 mx-auto mb-2" />
                          <p className="font-mono text-[10px] text-zinc-500 uppercase">
                            Tidak ada naskah publikasi ditemukan
                          </p>
                          <p className="text-[9px] text-zinc-600 mt-1 font-mono">
                            Coba ubah kata kunci pencarian Anda atau segarkan halaman.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {filteredInformasiContents.map((item) => (
                            <React.Fragment key={item.id}>
                              <ContentCard
                                item={item}
                                onSelect={handleSelectContent}
                              />
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </section>

                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INFORMASI KOMUNITAS */}
            {currentTab === 'komunitas' && (
              <div>
                {selectedItem ? (
                  <ContentDetail
                    item={selectedItem}
                    onLike={handleLikeContent}
                    onBack={() => setSelectedItem(null)}
                    isLiked={likedSessionItems.includes(selectedItem.id)}
                  />
                ) : (
                  <InformasiKomunitasView
                    communityContents={communityContents}
                    onSelectContent={handleSelectContent}
                  />
                )}
              </div>
            )}

            {/* TAB 3: ADMIN PANEL */}
            {currentTab === 'admin' && (
              <AdminPanel
                contents={contents}
                onRefresh={fetchDatabaseContents}
                onAddContent={handleAddContent}
                onUpdateContent={handleUpdateContent}
                onDeleteContent={handleDeleteContent}
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
              />
            )}
          </>
        )}
      </main>

      {/* Aesthetic Footer Block */}
      <footer className="border-t border-zinc-950 bg-black py-8 px-4 md:px-8 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
            © 2026 BERDON ORGANIZATION
          </p>
          <div className="flex gap-4 font-mono text-[9px] text-zinc-500 uppercase">
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setCurrentTab('informasi')}>Pusat Informasi</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setCurrentTab('komunitas')}>Info Komunitas</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setCurrentTab('admin')}>Admin</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
