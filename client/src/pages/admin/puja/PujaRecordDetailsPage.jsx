import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Flame,
  ArrowLeft,
  Edit2,
  Printer,
  Calendar,
  MapPin,
  Phone,
  Users,
  HeartHandshake,
  Coins,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { getPujaRecordById } from '../../../services/pujaService';
import { formatINR } from '../../../utils/formatters';

/**
 * PujaRecordDetailsPage Component - Phase 6
 * Detailed view for a specific Mata Ji Annual Puja record.
 */
export const PujaRecordDetailsPage = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await getPujaRecordById(id);
        if (res.success) {
          setRecord(res.data);
        }
      } catch (err) {
        console.error('Error loading puja record:', err);
        setError('रिकॉर्ड लोड करने में असमर्थ।');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-stone-500 text-sm">
        पूजा रिकॉर्ड विवरण लोड हो रहा है...
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-rose-700 font-bold">{error || 'रिकॉर्ड नहीं मिला।'}</p>
        <Link to="/admin/puja/records">
          <Button variant="outline" size="sm">
            सूची पर वापस जाएं
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. TOP ACTIONS & RECORD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/puja/records"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-900">
                {record.recordNumber}
              </span>
              <Badge variant={record.pujaStatus === 'completed' ? 'success' : 'gold'} size="sm">
                {record.pujaStatus}
              </Badge>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              वर्ष {record.year} • {record.pujaType?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition shadow-xs"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>प्रिंट रसीद</span>
          </button>

          <Link to={`/admin/puja/records/${record._id}/edit`}>
            <Button variant="gold" size="sm" className="text-xs">
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              <span>संपादित करें</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">कुल श्रद्धालु</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{record.numberOfPeople} सदस्य</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">दंपति जोड़े</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{record.numberOfCouples || 0} जोड़े</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">जमाल निकासी</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{record.jamalCount || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">सहयोग राशि</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {record.amount > 0 ? formatINR(record.amount) : 'निःशुल्क'}
          </p>
        </div>
      </div>

      {/* 3. DEVOTEE & EVENT OVERVIEW */}
      <Card variant="default" className="p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 border-b border-stone-100 pb-2">
          यजमान एवं धार्मिक अनुष्ठान विवरण
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-stone-400 block text-xs font-medium">मुख्य यजमान का नाम:</span>
            <span className="font-bold text-stone-900 text-base">{record.primaryPersonName}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-xs font-medium">पारिवारिक शाखा / नाम:</span>
            <span className="font-semibold text-stone-800">{record.familyName || 'उल्लेखित नहीं'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[11px]">संपर्क मोबाइल:</span>
              <span className="font-mono font-bold text-stone-800">{record.mobile || 'उल्लेखित नहीं'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[11px]">पूजा तिथि:</span>
              <span className="font-semibold text-stone-800">
                {record.pujaDate ? new Date(record.pujaDate).toLocaleDateString('hi-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : '-'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[11px]">स्थान (Village & City):</span>
              <span className="font-semibold text-stone-800">
                {record.village ? `${record.village}, ` : ''}{record.city || ''}
              </span>
            </div>
          </div>

          <div>
            <span className="text-stone-400 block text-xs font-medium">निवास पता:</span>
            <span className="text-stone-700">{record.address || '-'}</span>
          </div>
        </div>

        {record.notes && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-stone-700">
            <strong className="text-amber-900 block font-bold mb-0.5">प्रशासनिक टिप्पणी:</strong>
            {record.notes}
          </div>
        )}
      </Card>

      {/* 4. COUPLE PARTICIPANTS LIST */}
      {record.couples && record.couples.length > 0 && (
        <Card variant="default" className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-900 border-b border-stone-100 pb-2 flex items-center justify-between">
            <span>सहभागी दंपति जोड़े ({record.couples.length})</span>
            <HeartHandshake className="w-4 h-4 text-rose-600" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {record.couples.map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-sand-50/40 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>{c.husbandName || 'पति'} एवं {c.wifeName || 'पत्नी'}</span>
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                    जोड़ा #{idx + 1}
                  </span>
                </div>
                {c.village && <p className="text-stone-500">गांव: {c.village}</p>}
                {c.mobile && <p className="text-stone-500 font-mono">मो: {c.mobile}</p>}
                {c.notes && <p className="text-stone-400 italic">{c.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. JAMAL / NIKASI RECORDS */}
      {record.jamalDetails && record.jamalDetails.length > 0 && (
        <Card variant="default" className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 border-b border-stone-100 pb-2 flex items-center justify-between">
            <span>जमाल निकासी प्रविष्टियां ({record.jamalDetails.length})</span>
            <Flame className="w-4 h-4 text-indigo-600" />
          </h2>

          <div className="divide-y divide-stone-100 text-xs">
            {record.jamalDetails.map((j, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 block">{j.name}</span>
                  <span className="text-stone-500 text-[11px]">{j.village} • मात्रा: {j.quantity}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 text-[11px] block">
                    {j.date ? new Date(j.date).toLocaleDateString('hi-IN') : '-'}
                  </span>
                  {j.notes && <span className="text-stone-500 italic text-[11px]">{j.notes}</span>}
                </div>
              </div>
            ))}
          </div>

          {record.jamalNotes && (
            <p className="text-xs text-stone-500 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
              <strong>जमाल टिप्पणी:</strong> {record.jamalNotes}
            </p>
          )}
        </Card>
      )}

      {/* 6. AUDIT METADATA */}
      <div className="text-xs text-stone-400 flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-stone-200">
        <span>दर्ज दिनांक: {new Date(record.createdAt).toLocaleString('hi-IN')}</span>
        <span>अंतिम संशोधन: {new Date(record.updatedAt).toLocaleString('hi-IN')}</span>
      </div>
    </div>
  );
};

export default PujaRecordDetailsPage;
