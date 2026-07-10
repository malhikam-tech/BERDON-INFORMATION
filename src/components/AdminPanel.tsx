import React, { useState, useRef } from 'react';
import {
  Lock,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  FolderOpen,
  Image,
  Upload,
  RefreshCw,
  FileText,
  BookOpen,
  AlertCircle,
  Bookmark,
  CheckCircle,
  HelpCircle,
  XCircle,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ContentItem, ContentCategory } from '../types';

interface AdminPanelProps {
  contents: ContentItem[];
  onRefresh: () => Promise<void>;
  onAddContent: (item: Omit<ContentItem, 'id' | 'likes' | 'views' | 'created_at'>) => Promise<boolean>;
  onUpdateContent: (id: string, item: Partial<ContentItem>) => Promise<boolean>;
  onDeleteContent: (id: string) => Promise<boolean>;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export default function AdminPanel({
  contents,
  onRefresh,
  onAddContent,
  onUpdateContent,
  onDeleteContent,
  isAdmin,
  setIsAdmin,
}: AdminPanelProps) {
  // Authentication State
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Operations States
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ContentCategory>('artikel');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  
  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadErrorDetails, setUploadErrorDetails] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle password submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'BERDONEST2023') {
      setIsAdmin(true);
      setAuthError('');
      setPassword('');
      sessionStorage.setItem('berdon_admin_session', 'authenticated');
    } else {
      setAuthError('Kata sandi tidak valid. Akses ditolak.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('berdon_admin_session');
  };

  // Open creation form
  const handleOpenCreateForm = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('artikel');
    setFormContent('');
    setFormImageUrl('');
    setUploadErrorDetails(null);
    setStatusMessage(null);
    setIsFormOpen(true);
  };

  // Open edit form
  const handleOpenEditForm = (item: ContentItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormContent(item.content);
    setFormImageUrl(item.image_url || '');
    setUploadErrorDetails(null);
    setStatusMessage(null);
    setIsFormOpen(true);
  };

  // Handle File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingFile(true);
    setUploadErrorDetails(null);

    try {
      // 1. Prepare unique file path
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      // 2. Upload using Supabase JS client
      const { data, error } = await supabase.storage
        .from('berdon-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // 3. Obtain public URL
      const { data: urlData } = supabase.storage
        .from('berdon-assets')
        .getPublicUrl(filePath);

      setFormImageUrl(urlData.publicUrl);
      setStatusMessage({ type: 'success', text: 'Gambar berhasil diunggah ke Storage Supabase.' });
    } catch (err: any) {
      console.error('Error uploading file:', err);
      // Construct a descriptive error that explains RLS / missing bucket settings
      const errMsg = err.message || JSON.stringify(err);
      setUploadErrorDetails(
        `Gagal mengunggah file (${errMsg}). ` +
        `Pastikan Anda telah membuat public bucket bernama "berdon-assets" di akun Supabase Anda serta mengaktifkan kebijakan RLS publik (Allow public inserts/selects).`
      );
      setStatusMessage({ 
        type: 'error', 
        text: 'Unggah file gagal. Anda dapat menggunakan opsi input URL Gambar manual di bawah sebagai cadangan.' 
      });
    } finally {
      setUploadingFile(false);
    }
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setStatusMessage({ type: 'error', text: 'Judul dan Konten wajib diisi.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      content: formContent.trim(),
      image_url: formImageUrl.trim() || null,
    };

    try {
      let success = false;
      if (editingItem) {
        success = await onUpdateContent(editingItem.id, payload);
        if (success) {
          setStatusMessage({ type: 'success', text: 'Konten berhasil diperbarui.' });
          setEditingItem(null);
          setTimeout(() => setIsFormOpen(false), 800);
        } else {
          setStatusMessage({ type: 'error', text: 'Gagal memperbarui konten di database.' });
        }
      } else {
        success = await onAddContent(payload);
        if (success) {
          setStatusMessage({ type: 'success', text: 'Konten baru berhasil diterbitkan.' });
          setTimeout(() => setIsFormOpen(false), 800);
        } else {
          setStatusMessage({ type: 'error', text: 'Gagal menambahkan konten baru ke database.' });
        }
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete item handler
  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus konten "${title}"? Tindakan ini tidak dapat dibatalkan.`)) {
      const success = await onDeleteContent(id);
      if (success) {
        setStatusMessage({ type: 'success', text: 'Konten berhasil dihapus.' });
      } else {
        setStatusMessage({ type: 'error', text: 'Gagal menghapus konten.' });
      }
    }
  };

  // Return category label & icon
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'artikel':
        return { label: 'Artikel', color: 'text-zinc-300 bg-zinc-900 border-zinc-800' };
      case 'materi':
        return { label: 'Materi', color: 'text-zinc-400 bg-zinc-950 border-zinc-900' };
      case 'berita':
        return { label: 'Berita', color: 'text-white bg-zinc-800 border-zinc-700' };
      case 'arsip':
        return { label: 'Arsip', color: 'text-zinc-500 bg-black border-zinc-900' };
      case 'info_komunitas':
        return { label: 'Info Komunitas', color: 'text-zinc-300 bg-zinc-900 border-zinc-700' };
      default:
        return { label: cat, color: 'text-zinc-400 bg-zinc-900 border-zinc-800' };
    }
  };

  // Auth gate
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 border border-zinc-800 bg-zinc-950 rounded-md p-6 animate-fade-in shadow-xl shadow-black/50">
        <div className="text-center mb-6">
          <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Lock className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Autentikasi Board Admin
          </h3>
          <p className="font-mono text-[9px] text-zinc-500 uppercase mt-1">
            Area khusus dewan pengurus komunitas BERDON
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400 mb-1.5">
              Masukkan Kata Sandi Keamanan
            </label>
            <input
              type="password"
              placeholder="••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 font-mono transition-colors"
              required
            />
          </div>

          {authError && (
            <div className="bg-red-950/20 border border-red-900/50 rounded p-2.5 flex items-start gap-2">
              <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-red-400 font-mono leading-tight">{authError}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-zinc-100 hover:bg-white text-black font-mono text-[10px] uppercase tracking-widest font-bold py-2.5 rounded transition-all duration-300"
          >
            Verifikasi Akses
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-900 pt-4 text-center">
          <p className="text-[9px] text-zinc-600 font-mono leading-relaxed">
            Sistem mencatat setiap aktivitas otorisasi.<br />
            Hubungi penanggung jawab IT BERDON jika Anda lupa kredensial login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-zinc-800 bg-zinc-950 rounded-md p-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-zinc-300" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
              Workspace Admin Terverifikasi
            </h3>
            <p className="font-mono text-[9px] text-zinc-500 uppercase mt-0.5">
              Kelola Publikasi & Informasi Komunitas BERDON
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleOpenCreateForm}
            className="flex items-center gap-1 bg-zinc-100 hover:bg-white text-black px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider font-bold transition-all"
          >
            <Plus className="h-3 w-3" />
            Tambah Konten
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider transition-all"
          >
            <RefreshCw className="h-3 w-3" />
            Segarkan
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 border border-zinc-800 hover:border-red-900 text-zinc-400 hover:text-red-400 px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider transition-all"
          >
            <LogOut className="h-3 w-3" />
            Keluar
          </button>
        </div>
      </div>

      {/* Database/Action Global Feedback messages */}
      {statusMessage && !isFormOpen && (
        <div className={`border rounded p-3 flex items-start gap-2.5 ${
          statusMessage.type === 'success' 
            ? 'bg-zinc-950 border-zinc-800 text-zinc-300' 
            : 'bg-red-950/20 border-red-900/50 text-red-400'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-[10.5px] font-mono leading-relaxed">{statusMessage.text}</p>
        </div>
      )}

      {/* Create / Edit Form Drawer overlay style */}
      {isFormOpen && (
        <div className="border border-zinc-800 bg-zinc-950 rounded-md p-5 md:p-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">
              {editingItem ? 'Edit Konten Publikasi' : 'Tulis Konten Publikasi Baru'}
            </h4>
            <button
              onClick={() => setIsFormOpen(false)}
              className="font-mono text-[10px] uppercase text-zinc-500 hover:text-white transition-colors"
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                Judul Konten
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Contoh: Menguji Validitas Metodologi Riset Terbuka"
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                Kategori Publikasi
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ContentCategory)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono transition-colors"
              >
                <option value="artikel">Artikel</option>
                <option value="materi">Materi</option>
                <option value="berita">Berita</option>
                <option value="arsip">Arsip</option>
                <option value="info_komunitas">Info Komunitas</option>
              </select>
              <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                PILIH "INFO KOMUNITAS" AGAR DITAMPILKAN DI HALAMAN INFO KOMUNITAS TERPISAH.
              </p>
            </div>

            {/* Image Upload section */}
            <div className="border border-zinc-900 bg-black rounded p-3 space-y-3">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                Media Pendukung (Gambar Ilustrasi)
              </span>

              {/* Upload input */}
              <div className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950 p-4 rounded text-center flex flex-col justify-center items-center">
                <Upload className="h-6 w-6 text-zinc-500 mb-1.5" />
                <span className="font-mono text-[10px] text-zinc-400 uppercase">
                  {uploadingFile ? 'Mengunggah...' : 'Unggah ke Supabase Storage'}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="mt-2.5 border border-zinc-800 bg-black hover:border-zinc-500 text-zinc-400 hover:text-white px-3 py-1.5 rounded font-mono text-[9px] uppercase tracking-wider transition-all"
                >
                  Pilih File Gambar
                </button>
              </div>

              {/* Upload Instructions for User */}
              {uploadErrorDetails && (
                <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px] uppercase">
                    <HelpCircle className="h-3 w-3 text-zinc-500" />
                    Panduan Konfigurasi Supabase Storage:
                  </div>
                  <ol className="list-decimal list-inside text-[9px] text-zinc-500 font-mono leading-relaxed space-y-0.5 pl-1">
                    <li>Masuk ke Dashboard Supabase Anda</li>
                    <li>Buka menu <b>Storage</b> &gt; klik <b>New Bucket</b></li>
                    <li>Beri nama persis: <code className="text-zinc-300">berdon-assets</code></li>
                    <li>Pastikan mencentang pilihan <b>Public bucket</b> &gt; simpan</li>
                    <li>Di tab "Policies" storage, izinkan akses <b>Insert</b> dan <b>Select</b> untuk pengguna anon</li>
                  </ol>
                </div>
              )}

              {/* Image preview */}
              {formImageUrl && (
                <div className="flex items-center gap-3 border-t border-zinc-900 pt-3">
                  <div className="h-10 w-16 bg-zinc-950 border border-zinc-800 rounded overflow-hidden flex-shrink-0">
                    <img src={formImageUrl} alt="Preview" className="h-full w-full object-cover filter grayscale" />
                  </div>
                  <div className="font-mono text-[9px] text-zinc-500 break-all leading-normal flex-grow">
                    <span>URL Gambar Aktif:</span>
                    <span className="block text-zinc-400 select-all">{formImageUrl}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400 mb-1">
                Isi Konten Publikasi
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Tulis artikel atau materi di sini. Gunakan baris baru ganda untuk paragraf baru. Gunakan '>' di awal baris untuk kutipan, atau '-' untuk daftar poin."
                rows={10}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
                required
              />
            </div>

            {/* Form Status Message */}
            {statusMessage && (
              <div className={`border rounded p-2.5 flex items-start gap-2 ${
                statusMessage.type === 'success' 
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-300' 
                  : 'bg-red-950/20 border-red-900/50 text-red-400'
              }`}>
                <p className="text-[10px] font-mono leading-relaxed">{statusMessage.text}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-2 border-t border-zinc-900 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || uploadingFile}
                className="bg-zinc-100 hover:bg-white text-black px-4 py-2 rounded font-mono text-[10px] uppercase tracking-wider font-bold disabled:opacity-50 transition-all duration-300"
              >
                {isSubmitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Terbitkan Konten'}
              </button>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white px-4 py-2 rounded font-mono text-[10px] uppercase tracking-wider transition-all"
              >
                Tutup Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Database Contents List */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-md p-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
          <div className="flex items-center gap-1.5">
            <FolderOpen className="h-4 w-4 text-zinc-500" />
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">
              Arsip Publikasi ({contents.length})
            </h4>
          </div>
          <span className="font-mono text-[9px] text-zinc-500">
            KLIK EDIT ATAU HAPUS UNTUK MEMODIFIKASI DATA
          </span>
        </div>

        {contents.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Tidak ada data publikasi ditemukan.</p>
            <p className="text-[9px] text-zinc-600 mt-1 font-mono">Database kosong atau koneksi Supabase terputus.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-[9px] font-mono text-zinc-500 uppercase">
                  <th className="py-2.5 px-3">Judul</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Views</th>
                  <th className="py-2.5 px-3 text-center">Likes</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {contents.map((item) => {
                  const catDetails = getCategoryDetails(item.category);
                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/30 text-zinc-300 text-[11px] font-sans group">
                      <td className="py-3 px-3 max-w-xs md:max-w-md">
                        <div className="truncate font-medium text-white group-hover:text-zinc-200 transition-colors">
                          {item.title}
                        </div>
                        <div className="font-mono text-[8.5px] text-zinc-500 mt-0.5 uppercase">
                          Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono border uppercase tracking-wider ${catDetails.color}`}>
                          {catDetails.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[10px] text-zinc-400">
                        {item.views}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[10px] text-zinc-400">
                        {item.likes}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditForm(item)}
                            title="Edit"
                            className="p-1 border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-500 rounded transition-all"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            title="Hapus"
                            className="p-1 border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-red-400 hover:border-red-900/50 rounded transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
