import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Edit2,
  Lock,
  Calendar,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import {
  getRestrictedPersonById,
  revokeRestriction,
} from '../../../services/restrictedPersonService';

/**
 * RestrictedPersonDetailsPage Component - Phase 6
 * Detailed case view for confidential restricted person records.
 */
export const RestrictedPersonDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Revoke Modal
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [revocationReason, setRevocationReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getRestrictedPersonById(id);
      if (res.success) {
        setRecord(res.data);
      }
    } catch (err) {
      console.error('Error loading restricted person details:', err);
      setError('रिकॉर्ड लोड करने में असमर्थ।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRevokeConfirm = async () => {
    try {
      setRevoking(true);
      await revokeRestriction(id, revocationReason.trim());
      setIsRevokeOpen(false);
      setRevocationReason('');
      fetchDetails();
    } catch (err) {
      console.error('Error revoking restriction:', err);
      alert('प्रतिबंध निरस्त करने में त्रुटि आई।');
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-stone-500 text-sm">
        प्रतिबंधित व्यक्ति विवरण लोड हो रहा है...
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-rose-700 font-bold">{error || 'रिकॉर्ड नहीं मिला।'}</p>
        <Link to="/admin/restricted-persons">
          <Button variant="outline" size="sm">
            सूची पर वापस जाएं
          </Button>
        </Link>
      </div>
    );
  }

  const effStatus = record.effectiveStatus || record.status;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. TOP ACTIONS & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/restricted-persons"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-black text-red-900">
                {record.recordNumber}
              </span>
              <Badge variant={effStatus === 'active' ? 'danger' : effStatus === 'revoked' ? 'success' : 'warning'} size="sm">
                {effStatus}
              </Badge>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              प्रकार: {record.restrictionType?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {effStatus === 'active' && !record.isCurrentlyExpired && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRevokeOpen(true)}
              className="text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>प्रतिबंध निरस्त करें</span>
            </Button>
          )}

          <Link to={`/admin/restricted-persons/${record._id}/edit`}>
            <Button variant="outline" size="sm" className="text-xs">
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              <span>संपादित करें</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. CONFIDENTIAL NOTICE */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-red-900 font-medium">
        <Lock className="w-4 h-4 text-red-700 shrink-0" />
        <span>यह रिकॉर्ड अत्यंत गोपनीय है। इसे केवल अधिकृत ट्रस्टियों द्वारा ही देखा जा सकता है।</span>
      </div>

      {/* 3. CASE SUMMARY CARD */}
      <Card variant="default" className="p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-red-900 border-b border-stone-100 pb-2">
          व्यक्ति एवं प्रतिबंध विवरण (Case Details)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-stone-400 block text-xs font-medium">व्यक्ति का नाम:</span>
            <span className="font-bold text-stone-900 text-base">{record.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[11px]">मोबाइल:</span>
              <span className="font-mono font-bold text-stone-800">{record.mobile || 'उल्लेखित नहीं'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[11px]">स्थान:</span>
              <span className="font-semibold text-stone-800">
                {record.village ? `${record.village}, ` : ''}{record.city || ''}
              </span>
            </div>
          </div>

          <div>
            <span className="text-stone-400 block text-xs font-medium">निवास पता:</span>
            <span className="text-stone-700">{record.address || '-'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[11px]">प्रारंभ तिथि:</span>
              <span className="font-semibold text-stone-800">
                {record.startDate ? new Date(record.startDate).toLocaleDateString('hi-IN') : '-'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[11px]">समाप्ति तिथि:</span>
              <span className="font-semibold text-stone-800">
                {record.endDate ? new Date(record.endDate).toLocaleDateString('hi-IN') : 'स्थायी प्रतिबंध'}
              </span>
            </div>
          </div>
        </div>

        {/* Reason & Description */}
        <div className="space-y-3 pt-3 border-t border-stone-100">
          <div className="bg-red-50/50 border border-red-200/60 p-4 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
              प्रतिबंध का प्राथमिक कारण:
            </span>
            <p className="text-sm font-bold text-stone-900">{record.reason}</p>
          </div>

          {record.description && (
            <div className="text-xs text-stone-700 space-y-1">
              <span className="font-bold text-stone-500 block">घटना का विस्तृत विवरण:</span>
              <p className="leading-relaxed bg-sand-50/60 p-3 rounded-xl border border-stone-200">
                {record.description}
              </p>
            </div>
          )}

          {record.notes && (
            <div className="text-xs text-stone-700 space-y-1">
              <span className="font-bold text-stone-500 block">प्रशासनिक टिप्पणी / प्रस्ताव क्र.:</span>
              <p className="bg-sand-50/60 p-3 rounded-xl border border-stone-200">{record.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 4. REVOCATION HISTORY (If Revoked) */}
      {record.status === 'revoked' && (
        <Card variant="warm" className="p-6 space-y-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>प्रतिबंध निरस्तीकरण विवरण (Revocation Record)</span>
          </div>
          <div className="text-xs text-stone-700 space-y-1">
            <p><strong>निरस्त दिनांक:</strong> {record.revokedAt ? new Date(record.revokedAt).toLocaleString('hi-IN') : '-'}</p>
            <p><strong>निरस्तीकरण का कारण:</strong> {record.revocationReason || 'प्रशासनिक निर्णय'}</p>
          </div>
        </Card>
      )}

      {/* 5. AUDIT TIMESTAMPS */}
      <div className="text-xs text-stone-400 flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-stone-200">
        <span>दर्ज दिनांक: {new Date(record.createdAt).toLocaleString('hi-IN')}</span>
        <span>अंतिम संशोधन: {new Date(record.updatedAt).toLocaleString('hi-IN')}</span>
      </div>

      {/* 6. REVOKE MODAL */}
      {isRevokeOpen && (
        <Modal
          isOpen={isRevokeOpen}
          onClose={() => setIsRevokeOpen(false)}
          title="प्रतिबंध निरस्तीकरण पुष्टि"
        >
          <div className="space-y-4 text-xs sm:text-sm text-stone-700">
            <p>
              क्या आप सुनिश्चित हैं कि आप व्यक्ति{' '}
              <strong className="text-stone-900 font-bold">{record.name}</strong> पर लगे प्रतिबंध को
              निरस्त करना चाहते हैं?
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                निरस्तीकरण का कारण / प्रस्ताव विवरण:
              </label>
              <textarea
                rows="3"
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                placeholder="उदा. कार्यकारिणी बैठक में समीक्षा उपरांत माफीनामा स्वीकार..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRevokeOpen(false)}
                disabled={revoking}
              >
                रद्द करें
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRevokeConfirm}
                isLoading={revoking}
              >
                निरस्त करें
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RestrictedPersonDetailsPage;
