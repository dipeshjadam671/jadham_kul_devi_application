import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckSquare,
  Square,
  Save,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  User,
  Smartphone,
  Lock,
} from 'lucide-react';
import { getUserById, updateUserPermissions } from '../../../services/userService';
import { PERMISSION_GROUPS } from '../../../constants/permissions';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

export const UserPermissionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUserById(id);
        if (res.success) {
          const u = res.data.user;
          setUser(u);
          setSelectedPermissions(new Set(u.permissions || []));
        }
      } catch (err) {
        console.error('Error fetching user permissions:', err);
        setError(err.response?.data?.message || 'उपयोगकर्ता जानकारी लोड करने में विफल।');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const toggleGroup = (groupId) => {
    const group = PERMISSION_GROUPS.find((g) => g.groupId === groupId);
    if (!group) return;

    const groupPermIds = group.permissions.map((p) => p.id);
    const allSelected = groupPermIds.every((pid) => selectedPermissions.has(pid));

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupPermIds.forEach((pid) => next.delete(pid));
      } else {
        groupPermIds.forEach((pid) => next.add(pid));
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const all = new Set();
    PERMISSION_GROUPS.forEach((g) => {
      g.permissions.forEach((p) => all.add(p.id));
    });
    setSelectedPermissions(all);
  };

  const handleDeselectAll = () => {
    setSelectedPermissions(new Set());
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const permArray = Array.from(selectedPermissions);
      const res = await updateUserPermissions(id, permArray);
      if (res.success) {
        setSuccessMessage('उपयोगकर्ता अनुमतियां सफलतापूर्वक अद्यतन की गईं!');
        setUser(res.data.user);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error updating permissions:', err);
      setError(err.response?.data?.message || 'अनुमतियां सहेजने में त्रुटि हुई।');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-stone-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-saffron-600 mb-2" />
        <p>अनुमति विवरण लोड हो रहा है...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200 max-w-xl mx-auto mt-8">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')} className="mt-4">
          ← उपयोगकर्ता सूची पर वापस जाएं
        </Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="space-y-1">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>उपयोगकर्ता सूची पर वापस जाएं</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
            <Key className="w-6 h-6 text-saffron-700" />
            <span>अनुमति मैट्रिक्स प्रबंधन (Permissions Matrix)</span>
          </h1>
          <p className="text-stone-500 text-sm">
            प्रत्येक प्रशासनिक मॉड्यूल के लिए व्यक्तिगत अनुमतियों का विन्यास।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={isAdmin || saving}
          >
            सभी चुनें (All)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={isAdmin || saving}
          >
            सभी हटाएं (None)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isAdmin || saving}
            className="flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'सहेजा जा रहा है...' : 'अनुमतियां सहेजें'}</span>
          </Button>
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* User Info Card */}
      <Card variant="default" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-lg">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {user?.name || 'अनामित सदस्य'}
              </h2>
              <div className="flex items-center gap-3 text-xs text-stone-600 mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Smartphone className="w-3.5 h-3.5 text-stone-400" />
                  {user?.mobile}
                </span>
                <span className="text-stone-300">•</span>
                <span>खाता स्थिति: <strong className="text-emerald-700 font-semibold capitalize">{user?.status === 'active' ? 'सक्रिय (Active)' : user?.status}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isAdmin ? 'maroon' : user?.role === 'committee' ? 'gold' : 'default'} size="md">
              {isAdmin ? '🛡️ मुख्य प्रशासक (Admin)' : user?.role === 'committee' ? '🎖️ समिति सदस्य (Committee)' : 'सामान्य उपयोगकर्ता'}
            </Badge>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-medium">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>मुख्य प्रशासक (Super Administrator):</strong> इस उपयोगकर्ता के पास संपूर्ण सिस्टम की सभी अनुमतियां पहले से ही स्वतः उपलब्ध हैं। इन्हें बदलने की आवश्यकता नहीं है।
            </span>
          </div>
        )}
      </Card>

      {/* Permission Groups Matrix */}
      <div className="space-y-6">
        {PERMISSION_GROUPS.map((group) => {
          const groupPermIds = group.permissions.map((p) => p.id);
          const allInGroupSelected = groupPermIds.every((pid) => selectedPermissions.has(pid));
          const someInGroupSelected = groupPermIds.some((pid) => selectedPermissions.has(pid));

          return (
            <Card key={group.groupId} variant="default" className="overflow-hidden">
              {/* Group Header */}
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                    {group.title}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {group.permissions.length} उपलब्ध अनुमतियां
                  </p>
                </div>

                {!isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleGroup(group.groupId)}
                    className="text-xs py-1 px-2.5"
                  >
                    {allInGroupSelected ? 'समूह हटाएं' : 'समूह चुनें'}
                  </Button>
                )}
              </div>

              {/* Group Checkboxes */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.permissions.map((perm) => {
                  const isChecked = isAdmin || selectedPermissions.has(perm.id);

                  return (
                    <label
                      key={perm.id}
                      onClick={() => !isAdmin && togglePermission(perm.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? 'border-saffron-300 bg-saffron-50/50 text-stone-900'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-600'
                      } ${isAdmin ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-saffron-700" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold leading-tight">{perm.label}</p>
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">{perm.id}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Floating or Bottom Save Bar */}
      {!isAdmin && (
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-300 shadow-xl flex items-center justify-between">
          <div className="text-xs text-stone-600">
            चयनित अनुमतियां:{' '}
            <strong className="text-saffron-700 font-extrabold text-sm">
              {selectedPermissions.size}
            </strong>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/users')}
            >
              रद्द करें
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'सहेजा जा रहा है...' : 'अनुमतियां सहेजें'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPermissionsPage;
