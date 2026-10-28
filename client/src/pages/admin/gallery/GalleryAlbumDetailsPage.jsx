import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getAlbumById,
  getAlbumMedia,
  createMedia,
  deleteMedia,
  uploadFile,
} from '../../../services/galleryService';

export const GalleryAlbumDetailsPage = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Media upload form state
  const [mediaForm, setMediaForm] = useState({
    title: '',
    description: '',
    type: 'image',
    fileUrl: '',
    thumbnailUrl: '',
    duration: '',
  });

  const fetchAlbumData = async () => {
    try {
      setLoading(true);
      const [albumRes, mediaRes] = await Promise.all([
        getAlbumById(id),
        getAlbumMedia(id),
      ]);

      if (albumRes.success && albumRes.data) {
        setAlbum(albumRes.data);
      }
      if (mediaRes.success && mediaRes.data) {
        setMediaList(mediaRes.data.media || []);
      }
    } catch (err) {
      console.error('Failed to load album media:', err);
      showNotification('error', 'एल्बम डेटा लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbumData();
  }, [id]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3500);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect type
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
    const detectedType = isVideo ? 'video' : 'image';

    try {
      setUploading(true);
      const res = await uploadFile(file, 'gallery');
      if (res.success && res.data?.fileUrl) {
        setMediaForm((prev) => ({
          ...prev,
          type: detectedType,
          fileUrl: res.data.fileUrl,
          thumbnailUrl: res.data.thumbnailUrl || res.data.fileUrl,
        }));
        showNotification('success', 'फाइल सर्वर पर अपलोड हो गई! विवरण दर्ज कर सहेजें।');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showNotification('error', err.response?.data?.message || 'फाइल अपलोड करने में त्रुटि हुई (अधिकतम 10MB फोटो, 100MB वीडियो)।');
    } finally {
      setUploading(false);
    }
  };

  const handleAddMedia = async (e) => {
    e.preventDefault();
    if (!mediaForm.fileUrl) {
      showNotification('error', 'कृपया पहले फाइल अपलोड करें अथवा URL दर्ज करें।');
      return;
    }

    try {
      setUploading(true);
      const payload = {
        albumId: id,
        type: mediaForm.type,
        title: mediaForm.title,
        description: mediaForm.description,
        fileUrl: mediaForm.fileUrl,
        thumbnailUrl: mediaForm.thumbnailUrl || mediaForm.fileUrl,
        duration: mediaForm.duration ? Number(mediaForm.duration) : undefined,
        isPublished: true,
      };

      await createMedia(payload);
      showNotification('success', 'मीडिया सफलतापूर्वक एल्बम में जोड़ा गया!');
      setMediaForm({
        title: '',
        description: '',
        type: 'image',
        fileUrl: '',
        thumbnailUrl: '',
        duration: '',
      });
      await fetchAlbumData();
    } catch (err) {
      console.error('Failed to add media:', err);
      showNotification('error', err.response?.data?.message || 'मीडिया सहेजने में त्रुटि हुई।');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId, title) => {
    if (!window.confirm(`क्या आप इस मीडिया फाइल को हटाना चाहते हैं?`)) return;
    try {
      await deleteMedia(mediaId);
      showNotification('success', 'मीडिया फाइल हटा दी गई।');
      await fetchAlbumData();
    } catch (err) {
      console.error('Failed to delete media:', err);
      showNotification('error', 'हटाने में त्रुटि हुई।');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin/gallery" className="text-xs font-semibold text-stone-500 hover:text-stone-800">
              ← एल्बम सूची
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              {album?.category || 'General'}
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1">
            {album?.name}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            कुल मीडिया: {mediaList.length} (तस्वीरें व वीडियो)
          </p>
        </div>

        <Link
          to={`/gallery/${album?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition inline-flex items-center gap-1.5"
        >
          <span>सार्वजनिक पृष्ठ देखें ↗</span>
        </Link>
      </div>

      {/* Notifications */}
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

      {/* Upload Media Section */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
          नया फोटो अथवा वीडियो अपलोड करें
        </h2>

        <form onSubmit={handleAddMedia} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                फाइल चुनें (Image ≤ 10MB, Video ≤ 100MB) *
              </label>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
              {uploading && <p className="text-xs text-amber-700 mt-1">अपलोड हो रहा है...</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                फाइल URL (स्वचालित अथवा मैन्युअल लिंक)
              </label>
              <input
                type="url"
                value={mediaForm.fileUrl}
                onChange={(e) => setMediaForm({ ...mediaForm, fileUrl: e.target.value })}
                placeholder="फाइल लिंक यहाँ दिखाई देगा..."
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                शीर्षक / विवरण (Title / Caption)
              </label>
              <input
                type="text"
                value={mediaForm.title}
                onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                placeholder="उदा. माताजी का दिव्य श्रृंगार दर्शन"
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                मीडिया प्रकार (Type)
              </label>
              <select
                value={mediaForm.type}
                onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="image">फोटो (Image)</option>
                <option value="video">वीडियो (Video)</option>
              </select>
            </div>
          </div>

          {mediaForm.type === 'video' && (
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                वीडियो अवधि (Duration in Seconds)
              </label>
              <input
                type="number"
                value={mediaForm.duration}
                onChange={(e) => setMediaForm({ ...mediaForm, duration: e.target.value })}
                placeholder="उदा. 120 (सेकंड)"
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading || !mediaForm.fileUrl}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
            >
              + एल्बम में सुरक्षित करें
            </button>
          </div>
        </form>
      </div>

      {/* Existing Media Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-serif font-bold text-stone-900">
          एल्बम में मौजूद मीडिया ({mediaList.length})
        </h2>

        {mediaList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500 text-sm">
            इस एल्बम में अभी कोई मीडिया फाइल नहीं है। ऊपर दिए गए फॉर्म से फोटो या वीडियो जोड़ें।
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaList.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-stone-900">
                  <img
                    src={item.thumbnailUrl || item.fileUrl}
                    alt={item.title || 'दर्शन'}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                      item.type === 'video' ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                  >
                    {item.type === 'video' ? '🎬 वीडियो' : '📷 फोटो'}
                  </span>
                  {item.duration && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                      {item.duration}s
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-1">
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {item.title || 'अनाम मीडिया'}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-[11px]">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 hover:underline"
                    >
                      देखें ↗
                    </a>
                    <button
                      onClick={() => handleDeleteMedia(item._id, item.title)}
                      className="text-rose-600 hover:underline"
                    >
                      हटाएं
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default GalleryAlbumDetailsPage;
