import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminAlbums,
  createAlbum,
  deleteAlbum,
  uploadFile,
} from '../../../services/galleryService';
import { formatIndianDate } from '../../../utils/sanitize';

const CATEGORIES = [
  'Navratri',
  'Ram Navami',
  'Temple Event',
  'Puja',
  'Yatra',
  'Festival',
  'General',
  'Other',
];

export const GalleryAlbumListPage = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const [form, setForm] = useState({
    name: '',
    category: 'General',
    description: '',
    coverImageUrl: '',
    eventDate: '',
    isPublished: true,
  });

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await getAdminAlbums();
      if (res.success && res.data) {
        setAlbums(res.data.albums || []);
      }
    } catch (err) {
      console.error('Failed to load albums:', err);
      showNotification('error', 'एल्बम लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3500);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const res = await uploadFile(file, 'gallery');
      if (res.success && res.data?.fileUrl) {
        setForm((prev) => ({ ...prev, coverImageUrl: res.data.fileUrl }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showNotification('error', 'कवर छवि अपलोड करने में त्रुटि हुई।');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createAlbum(form);
      showNotification('success', 'नया एल्बम सफलतापूर्वक बनाया गया!');
      setModalOpen(false);
      setForm({
        name: '',
        category: 'General',
        description: '',
        coverImageUrl: '',
        eventDate: '',
        isPublished: true,
      });
      await fetchAlbums();
    } catch (err) {
      console.error('Error creating album:', err);
      showNotification('error', err.response?.data?.message || 'एल्बम बनाने में त्रुटि हुई।');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlbum = async (id, name) => {
    if (!window.confirm(`क्या आप एल्बम "${name}" और इसकी सभी मीडिया फाइलों को हटाना चाहते हैं?`)) return;
    try {
      await deleteAlbum(id);
      showNotification('success', 'एल्बम हटा दिया गया।');
      await fetchAlbums();
    } catch (err) {
      console.error('Error deleting album:', err);
      showNotification('error', 'एल्बम हटाने में त्रुटि हुई।');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            गैलरी एल्बम प्रबंधन
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            मंदिर उत्सवों, अनुष्ठानों व निर्माण की फोटो/वीडियो एल्बम सूची व प्रबंधन
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
        >
          <span>+ नया एल्बम बनाएं</span>
        </button>
      </div>

      {/* Notification */}
      {notification.message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{notification.type === 'success' ? '✅' : '⚠️'}</span> {notification.message}
        </div>
      )}

      {/* Albums Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500 text-sm">
          कोई एल्बम नहीं मिला। नया एल्बम बनाने हेतु ऊपर दिए गए बटन पर क्लिक करें।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div
              key={album._id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between"
            >
              {/* Cover Preview */}
              <div className="relative aspect-16/9 bg-stone-900 overflow-hidden">
                <img
                  src={album.coverImageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'}
                  alt={album.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-600/90 text-white text-xs font-semibold rounded-md shadow-xs">
                  {album.category}
                </span>
                <span className="absolute bottom-3 right-3 text-xs text-white bg-black/60 px-2 py-0.5 rounded-md">
                  📷 {album.photoCount || 0} | 🎬 {album.videoCount || 0}
                </span>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    {album.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                    {album.description || 'कोई विवरण नहीं'}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400">
                    {album.eventDate ? formatIndianDate(album.eventDate) : formatIndianDate(album.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/gallery/albums/${album._id}`}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition"
                    >
                      मीडिया जोड़ें / प्रबंधित करें
                    </Link>
                    <button
                      onClick={() => handleDeleteAlbum(album._id, album.name)}
                      className="text-rose-600 hover:text-rose-800 px-2 py-1 font-medium"
                      title="एल्बम हटाएं"
                    >
                      हटाएं
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Album Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                नया गैलरी एल्बम बनाएं
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  एल्बम का नाम *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="उदा. चैत्र नवरात्रि महोत्सव 2026"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    श्रेणी (Category) *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    आयोजन दिनांक
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  विवरण
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="एल्बम का संक्षिप्त विवरण..."
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Cover Image Upload / URL */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-stone-700">
                  कवर छवि (Cover Image)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                  {uploadingCover && <span className="text-xs text-amber-700">अपलोड हो रहा है...</span>}
                </div>
                <input
                  type="url"
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  placeholder="अथवा सीधा छवि URL दर्ज करें"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'बन रहा है...' : 'एल्बम बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GalleryAlbumListPage;
