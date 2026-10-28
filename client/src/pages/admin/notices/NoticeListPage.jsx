import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminNotices,
  publishNotice,
  archiveNotice,
  togglePinNotice,
  deleteNotice,
} from '../../../services/noticeService';
import { formatIndianDate } from '../../../utils/sanitize';

export const NoticeListPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await getAdminNotices(params);
      if (res.success && res.data) {
        setNotices(res.data.notices || []);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
      showNotification('error', 'सूचनाएं लोड करने में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [statusFilter]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotices();
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await togglePinNotice(id);
      if (res.success) {
        showNotification('success', res.message || 'पिन स्थिति बदल दी गई।');
        await fetchNotices();
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'पिन करने में त्रुटि हुई (अधिकतम 5 पिन सीमा)।');
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishNotice(id);
      showNotification('success', 'सूचना प्रकाशित कर दी गई!');
      await fetchNotices();
    } catch (err) {
      showNotification('error', 'प्रकाशित करने में त्रुटि हुई।');
    }
  };

  const handleArchive = async (id) => {
    try {
      await archiveNotice(id);
      showNotification('success', 'सूचना अभिलेखागार (Archived) में भेज दी गई।');
      await fetchNotices();
    } catch (err) {
      showNotification('error', 'अभिलेखागार में भेजने में त्रुटि हुई।');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`क्या आप सूचना "${title}" को स्थायी रूप से हटाना चाहते हैं?`)) return;
    try {
      await deleteNotice(id);
      showNotification('success', 'सूचना हटा दी गई।');
      await fetchNotices();
    } catch (err) {
      showNotification('error', 'हटाने में त्रुटि हुई।');
    }
  };

  const pinnedCount = notices.filter((n) => n.isPinned).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              सूचना एवं आयोजन प्रबंधन
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              📌 {pinnedCount}/5 मुख्य पिन
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            वेबसाइट पर प्रकाशित होने वाली उत्सव घोषणाएं, बैठकें व परिपत्र प्रबंधित करें
          </p>
        </div>

        <Link
          to="/admin/notices/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
        >
          <span>+ नई सूचना बनाएं</span>
        </Link>
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        {/* Status Tabs */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            सभी
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'published' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            प्रकाशित
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'draft' ? 'bg-white text-amber-700 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            प्रारूप (Draft)
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'archived' ? 'bg-white text-stone-700 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            पुरालेख (Archived)
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="सूचना खोजें..."
            className="px-3.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-60"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs bg-stone-800 text-white font-semibold rounded-lg hover:bg-stone-900"
          >
            खोजें
          </button>
        </form>
      </div>

      {/* Notices Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500 text-sm">
          कोई सूचना नहीं मिली।
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="p-4">स्थिति</th>
                <th className="p-4">शीर्षक व विवरण</th>
                <th className="p-4">कार्यक्रम दिनांक</th>
                <th className="p-4">पिन (Pin)</th>
                <th className="p-4 text-right">कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {notices.map((notice) => (
                <tr key={notice._id} className="hover:bg-amber-50/20 transition-colors">
                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full font-semibold ${
                        notice.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : notice.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {notice.status === 'published'
                        ? 'प्रकाशित'
                        : notice.status === 'draft'
                        ? 'प्रारूप (Draft)'
                        : 'पुरालेख'}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="p-4 max-w-sm">
                    <div className="font-bold text-stone-900 text-sm">{notice.title}</div>
                    <div className="text-stone-500 line-clamp-1 mt-0.5">
                      {notice.shortDescription || notice.description}
                    </div>
                  </td>

                  {/* Event Date */}
                  <td className="p-4 whitespace-nowrap text-stone-600">
                    {notice.eventDate ? formatIndianDate(notice.eventDate) : '-'}
                  </td>

                  {/* Pin Toggle */}
                  <td className="p-4">
                    <button
                      onClick={() => handleTogglePin(notice._id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        notice.isPinned
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                      title={notice.isPinned ? 'पिन हटाएं' : 'मुख्य पृष्ठ पर पिन करें (अधिकतम 5)'}
                    >
                      <span>📌</span>
                      <span>{notice.isPinned ? 'पिन है' : 'पिन करें'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right whitespace-nowrap space-x-2">
                    {notice.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(notice._id)}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        प्रकाशित करें
                      </button>
                    )}
                    {notice.status === 'published' && (
                      <button
                        onClick={() => handleArchive(notice._id)}
                        className="text-stone-500 hover:underline"
                      >
                        पुरालेख
                      </button>
                    )}
                    <Link
                      to={`/admin/notices/${notice._id}/edit`}
                      className="text-amber-700 hover:underline font-semibold"
                    >
                      संपादित करें
                    </Link>
                    <button
                      onClick={() => handleDelete(notice._id, notice.title)}
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      हटाएं
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default NoticeListPage;
