import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  Smartphone,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { getUsers, activateUser, deactivateUser } from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

export const UserListPage = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Status toggle confirmation modal
  const [confirmModal, setConfirmModal] = useState({ open: false, user: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await getUsers(params);
      if (res.success) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'उपयोगकर्ता सूची लोड करने में विफल।');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openStatusConfirm = (user, action) => {
    setConfirmModal({ open: true, user, action });
  };

  const handleStatusChange = async () => {
    if (!confirmModal.user) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      if (confirmModal.action === 'deactivate') {
        const res = await deactivateUser(confirmModal.user._id);
        setActionMessage({ type: 'success', text: res.message || 'खाता सफलतापूर्वक निष्क्रिय कर दिया गया।' });
      } else {
        const res = await activateUser(confirmModal.user._id);
        setActionMessage({ type: 'success', text: res.message || 'खाता सफलतापूर्वक सक्रिय कर दिया गया।' });
      }
      setConfirmModal({ open: false, user: null, action: null });
      fetchUsers();
    } catch (err) {
      console.error('Status change error:', err);
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'स्थिति बदलने में त्रुटि हुई।',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="maroon" size="sm">मुख्य प्रशासक (Admin)</Badge>;
      case 'committee':
        return <Badge variant="gold" size="sm">समिति सदस्य (Committee)</Badge>;
      default:
        return <Badge variant="default" size="sm">सामान्य (Public)</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">सक्रिय (Active)</Badge>;
      case 'inactive':
        return <Badge variant="warning" size="sm">निष्क्रिय (Inactive)</Badge>;
      case 'suspended':
        return <Badge variant="danger" size="sm">निलंबित (Suspended)</Badge>;
      default:
        return <Badge variant="default" size="sm">{status || 'अज्ञात'}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-saffron-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Phase 6 — उपयोगकर्ता एवं समिति प्रशासन</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            सदस्य व उपयोगकर्ता प्रबंधन (User Directory)
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            सभी पंजीकृत उपयोगकर्ताओं, समिति सदस्यों एवं व्यवस्थापक खातों की केंद्रीय सूची।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/committee">
            <Button variant="gold" size="sm" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>समिति सदस्य डायरेक्टरी</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश</span>
          </Button>
        </div>
      </div>

      {/* Action Messages */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            actionMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-bold underline ml-4 hover:opacity-75"
          >
            बंद करें
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <Card variant="default" className="p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="नाम या मोबाइल नंबर से खोजें..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
            >
              <option value="">सभी भूमिकाएं (All Roles)</option>
              <option value="admin">मुख्य प्रशासक (Admin)</option>
              <option value="committee">समिति सदस्य (Committee)</option>
              <option value="public">सामान्य सदस्य (Public)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
            >
              <option value="">सभी स्थितियां (All Status)</option>
              <option value="active">सक्रिय (Active)</option>
              <option value="inactive">निष्क्रिय (Inactive)</option>
              <option value="suspended">निलंबित (Suspended)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" className="w-full">
              फ़िल्टर करें
            </Button>
            {(search || roleFilter || statusFilter) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                  setStatusFilter('');
                  setPage(1);
                }}
              >
                रीसेट
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Users Table */}
      <Card variant="default" className="overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="text-sm font-bold text-stone-700">
            कुल रिकॉर्ड्स: <span className="text-saffron-700 font-extrabold">{totalCount}</span>
          </div>
          <div className="text-xs text-stone-500">
            पृष्ठ {page} / {totalPages || 1}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-stone-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-saffron-600 mb-2" />
            <p>डेटा लोड हो रहा है, कृपया प्रतीक्षा करें...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <Users className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <p className="text-base font-semibold text-stone-600">कोई उपयोगकर्ता नहीं मिला</p>
            <p className="text-xs text-stone-400 mt-1">दिए गए खोज या फ़िल्टर मापदंडों के अनुसार कोई परिणाम नहीं हैं।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100/75 text-stone-600 text-xs uppercase font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">उपयोगकर्ता / नाम</th>
                  <th className="py-3 px-4">मोबाइल नंबर</th>
                  <th className="py-3 px-4">भूमिका (Role)</th>
                  <th className="py-3 px-4">प्रमाणीकरण स्थिति</th>
                  <th className="py-3 px-4">खाता स्थिति</th>
                  <th className="py-3 px-4">अंतिम लॉगिन</th>
                  <th className="py-3 px-4 text-right">कार्यवाही (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-medium">
                {users.map((u) => {
                  const isCurrentLoggedIn = currentUser?._id === u._id;
                  const isFirebaseLinked = !!u.firebaseUid;

                  return (
                    <tr key={u._id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span>{u.name || 'नाम दर्ज नहीं'}</span>
                          {isCurrentLoggedIn && (
                            <span className="text-[10px] bg-saffron-100 text-saffron-800 px-1.5 py-0.5 rounded font-bold">
                              (आप)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-400 font-mono">
                          ID: {u._id.slice(-6).toUpperCase()}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-stone-800">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{u.mobile}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-3 px-4">
                        {isFirebaseLinked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>लिंक्ड (Phone OTP)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>प्रथम लॉगिन प्रतीक्षित</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(u.status)}
                      </td>

                      <td className="py-3 px-4 text-xs text-stone-500">
                        {u.lastLoginAt ? (
                          new Date(u.lastLoginAt).toLocaleDateString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="text-stone-400 italic">कभी नहीं</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Permissions Link for Committee or Admin */}
                          {(u.role === 'committee' || u.role === 'admin') && (
                            <Link
                              to={`/admin/users/${u._id}/permissions`}
                              className="p-1.5 rounded-lg border border-stone-200 hover:border-saffron-300 hover:bg-saffron-50 text-stone-600 hover:text-saffron-700 transition"
                              title="अनुमतियां प्रबंधित करें (Manage Permissions)"
                            >
                              <Key className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Toggle Active/Inactive */}
                          {u.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => openStatusConfirm(u, 'deactivate')}
                              disabled={isCurrentLoggedIn}
                              title={
                                isCurrentLoggedIn
                                  ? 'आप स्वयं के सक्रिय खाते को निष्क्रिय नहीं कर सकते'
                                  : 'खाता निष्क्रिय करें (Deactivate)'
                              }
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition ${
                                isCurrentLoggedIn
                                  ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                                  : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openStatusConfirm(u, 'activate')}
                              title="खाता सक्रिय करें (Activate)"
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between bg-stone-50">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← पिछला पृष्ठ
            </Button>
            <span className="text-xs text-stone-600 font-medium">
              पृष्ठ {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              अगला पृष्ठ →
            </Button>
          </div>
        )}
      </Card>

      {/* Status Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  confirmModal.action === 'deactivate'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {confirmModal.action === 'deactivate' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {confirmModal.action === 'deactivate'
                    ? 'खाता निष्क्रिय करने की पुष्टि'
                    : 'खाता पुनः सक्रिय करने की पुष्टि'}
                </h3>
                <p className="text-xs text-stone-500">
                  उपयोगकर्ता: <strong>{confirmModal.user?.name || confirmModal.user?.mobile}</strong>
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-600">
              {confirmModal.action === 'deactivate' ? (
                <>
                  क्या आप निश्चित रूप से <strong>{confirmModal.user?.name}</strong> ({confirmModal.user?.mobile}) का खाता निष्क्रिय करना चाहते हैं?
                  निष्क्रिय होने पर यह उपयोगकर्ता सिस्टम में लॉगिन नहीं कर सकेगा।
                </>
              ) : (
                <>
                  क्या आप <strong>{confirmModal.user?.name}</strong> ({confirmModal.user?.mobile}) के खाते को पुनः सक्रिय करना चाहते हैं?
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModal({ open: false, user: null, action: null })}
                disabled={actionLoading}
              >
                रद्द करें
              </Button>
              <Button
                variant={confirmModal.action === 'deactivate' ? 'danger' : 'primary'}
                size="sm"
                onClick={handleStatusChange}
                disabled={actionLoading}
              >
                {actionLoading ? 'प्रक्रियाधीन...' : 'हां, पुष्टि करें'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage;
