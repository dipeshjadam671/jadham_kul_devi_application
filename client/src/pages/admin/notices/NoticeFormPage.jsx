import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  createNotice,
  updateNotice,
  getNoticeById,
} from '../../../services/noticeService';
import { uploadFile } from '../../../services/galleryService';

export const NoticeFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: 'श्री जादम कुलदेवी मंदिर प्रांगण, खलघाट',
    status: 'published',
    isPinned: false,
    bannerImageUrl: '',
  });

  useEffect(() => {
    if (!isEdit) return;

    const fetchNotice = async () => {
      try {
        setLoading(true);
        const res = await getNoticeById(id);
        if (res.success && res.data) {
          const n = res.data;
          setFormData({
            title: n.title || '',
            shortDescription: n.shortDescription || '',
            description: n.description || '',
            eventDate: n.eventDate ? new Date(n.eventDate).toISOString().split('T')[0] : '',
            startTime: n.startTime || '',
            endTime: n.endTime || '',
            location: n.location || '',
            status: n.status || 'draft',
            isPinned: Boolean(n.isPinned),
            bannerImageUrl: n.bannerImageUrl || '',
          });
        }
      } catch (err) {
        console.error('Failed to load notice:', err);
        setErrorMsg('सूचना लोड करने में त्रुटि हुई।');
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setErrorMsg('');
      const res = await uploadFile(file, 'notices');
      if (res.success && res.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, bannerImageUrl: res.data.fileUrl }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setErrorMsg(err.response?.data?.message || 'छवि अपलोड करने में विफल।');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');

      if (isEdit) {
        await updateNotice(id, formData);
      } else {
        await createNotice(formData);
      }

      navigate('/admin/notices');
    } catch (err) {
      console.error('Failed to save notice:', err);
      setErrorMsg(err.response?.data?.message || 'सूचना सहेजने में विफल।');
    } finally {
      setSaving(false);
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            {isEdit ? 'सूचना संपादित करें' : 'नई सूचना / आयोजन बनाएं'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            वेबसाइट बुलेटिन बोर्ड पर सार्वजनिक घोषणा प्रकाशित करें
          </p>
        </div>

        <Link
          to="/admin/notices"
          className="text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          ← वापस सूची पर जाएं
        </Link>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            सूचना का शीर्षक *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="उदा. चैत्र नवरात्रि महापर्व एवं शतचंडी महायज्ञ 2026"
            className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            संक्षिप्त विवरण (Short Summary)
          </label>
          <input
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="होमपेज व कार्ड पर प्रदर्शित होने वाली एक-दो पंक्तियाँ..."
            className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Full Description */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            विस्तृत विवरण (Full Content) *
          </label>
          <textarea
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="सूचना, कार्यक्रम की रूपरेखा एवं श्रद्धालुओं हेतु दिशा-निर्देश..."
            className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Date, Time, Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              कार्यक्रम दिनांक
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              प्रारंभ समय
            </label>
            <input
              type="text"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              placeholder="उदा. 06:00 AM"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              समापन समय
            </label>
            <input
              type="text"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              placeholder="उदा. 10:00 PM"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            स्थान (Venue / Location)
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Banner Image Upload / Link */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <label className="block text-xs font-semibold text-stone-700">
            बैनर / पोस्टर छवि (Banner Image)
          </label>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={uploadingImage}
              className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
            />
            {uploadingImage && <span className="text-xs text-amber-700">छवि अपलोड हो रही है...</span>}
          </div>

          <input
            type="url"
            name="bannerImageUrl"
            value={formData.bannerImageUrl}
            onChange={handleChange}
            placeholder="अथवा छवि का सीधा वेब लिंक (URL) दर्ज करें"
            className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />

          {formData.bannerImageUrl && (
            <div className="mt-2 h-32 w-full max-w-sm rounded-xl overflow-hidden border border-stone-200">
              <img
                src={formData.bannerImageUrl}
                alt="Banner Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Status & Pinned */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-stone-100">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              प्रकाशन स्थिति (Status)
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="published">प्रकाशित (Published - तुरंत सार्वजनिक)</option>
              <option value="draft">प्रारूप (Draft - केवल व्यवस्थापकों को दिखेगा)</option>
              <option value="archived">पुरालेख (Archived)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="isPinned"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
              className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
            />
            <label htmlFor="isPinned" className="text-xs font-semibold text-stone-800 cursor-pointer">
              📌 मुख्य सूचना के रूप में शीर्ष पर पिन करें (अधिकतम 5)
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
          <Link
            to="/admin/notices"
            className="px-5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
          >
            रद्द करें
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {saving ? 'सहेज रहे हैं...' : isEdit ? 'अद्यतन सुरक्षित करें' : 'सूचना प्रकाशित करें'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default NoticeFormPage;
