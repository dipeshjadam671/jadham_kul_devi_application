import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle,
  Clock,
  Key,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  Award,
} from 'lucide-react';
import { getCommitteeMembers, createCommitteeMember } from '../../../services/userService';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

export const CommitteeListPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    designation: '',
    role: 'committee',
  });

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCommitteeMembers();
      if (res.success) {
        setMembers(res.data.committeeMembers || []);
      }
    } catch (err) {
      console.error('Error fetching committee members:', err);
      setError(err.response?.data?.message || 'समिति सदस्यों की सूची लोड करने में विफल।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validation
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setFormError('कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('कृपया सदस्य का नाम दर्ज करें।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createCommitteeMember({
        name: formData.name.trim(),
        mobile: cleanMobile,
        role: formData.role,
        designation: formData.designation.trim() || undefined,
      });

      if (res.success) {
        setFormSuccess('समिति सदस्य सफलतापूर्वक जोड़ दिया गया है!');
        setFormData({ name: '', mobile: '', designation: '', role: 'committee' });
        setTimeout(() => {
          setIsAddModalOpen(false);
          setFormSuccess(null);
          fetchMembers();
        }, 1200);
      }
    } catch (err) {
      console.error('Create committee member error:', err);
      setFormError(err.response?.data?.message || 'सदस्य जोड़ने में त्रुटि हुई।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-saffron-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Phase 6 — मंदिर ट्रस्ट एवं प्रबंधन समिति</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            मंदिर समिति सदस्य डायरेक्टरी (Committee Directory)
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            जादम परिवार कुलदेवी मंदिर, खलघाट के सभी अधिकृत समिति सदस्य एवं प्रशासक।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>नया समिति सदस्य जोड़ें</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMembers}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश</span>
          </Button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>पूर्व-पंजीकरण (Pre-provisioning):</strong> समिति सदस्यों को पहले से अधिकृत किया जा सकता है। जब वे पहली बार अपने पंजीकृत मोबाइल नंबर से <strong>Phone OTP</strong> के माध्यम से लॉगिन करेंगे, तो उनका Firebase खाता स्वतः लिंक हो जाएगा और उन्हें निर्धारित अनुमतियां प्राप्त हो जाएंगी।
        </div>
      </div>

      {/* Grid of Committee Members */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-saffron-600 mb-2" />
          <p>समिति सदस्यों की सूची लोड हो रही है...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
          <Users className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <p className="text-base font-semibold text-stone-600">कोई समिति सदस्य नहीं मिला</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => {
            const isFirebaseLinked = !!member.firebaseUid;
            const isAdmin = member.role === 'admin';
            const permCount = isAdmin ? 'सभी (All)' : (member.permissions?.length || 0);

            return (
              <Card key={member._id} variant="default" className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                        {member.name || 'अनामित सदस्य'}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {member.designation || (isAdmin ? 'मुख्य प्रशासक (Administrator)' : 'समिति सदस्य (Member)')}
                      </p>
                    </div>
                    <Badge variant={isAdmin ? 'maroon' : 'gold'} size="sm">
                      {isAdmin ? 'प्रशासक' : 'समिति'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">मोबाइल:</span>
                      <span className="font-mono text-stone-900 font-bold flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-stone-400" />
                        {member.mobile}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">स्थिति:</span>
                      <span className={`capitalize font-semibold ${member.status === 'active' ? 'text-emerald-700' : 'text-stone-500'}`}>
                        {member.status === 'active' ? 'सक्रिय (Active)' : member.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">प्रमाणीकरण:</span>
                      {isFirebaseLinked ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> लिंक्ड
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          <Clock className="w-3 h-3" /> प्रथम लॉगिन शेष
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">सक्रिय अनुमतियां:</span>
                      <span className="font-bold text-saffron-800 bg-saffron-50 px-2 py-0.5 rounded border border-saffron-200">
                        {permCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">
                    ID: {member._id.slice(-6).toUpperCase()}
                  </span>
                  <Link
                    to={`/admin/users/${member._id}/permissions`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-saffron-700 hover:text-saffron-800 hover:underline"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>अनुमतियां बदलें →</span>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Committee Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-saffron-700" />
                <h3 className="text-lg font-bold text-stone-900">
                  नया समिति सदस्य जोड़ें
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  पूरा नाम (Full Name) *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="उदा. श्री जगदीश जादम"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  मोबाइल नंबर (10-Digit Mobile) *
                </label>
                <Input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="उदा. 9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  यह मोबाइल नंबर उपयोगकर्ता के Firebase OTP लॉगिन हेतु अधिकृत होगा।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  पद / दायित्व (Designation / Title)
                </label>
                <Input
                  type="text"
                  placeholder="उदा. अध्यक्ष / सचिव / कोषाध्यक्ष / सदस्य"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  भूमिका (Role)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full py-2 px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
                >
                  <option value="committee">समिति सदस्य (Committee Member)</option>
                  <option value="admin">मुख्य प्रशासक (Administrator)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  रद्द करें
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? 'सहेजा जा रहा है...' : 'सदस्य जोड़ें'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeListPage;
