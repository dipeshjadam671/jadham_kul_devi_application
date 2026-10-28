import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  PlusCircle,
  FileSpreadsheet,
  Eye,
  Edit2,
  CheckCircle2,
  Archive,
  RefreshCw,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import {
  getRestrictedPersons,
  revokeRestriction,
  archiveRestrictedPerson,
  exportRestrictedCsv,
} from '../../../services/restrictedPersonService';

/**
 * RestrictedPersonListPage Component - Phase 6
 * Strictly confidential directory for managing restricted person records.
 */
export const RestrictedPersonListPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [restrictionType, setRestrictionType] = useState('');
  const [page, setPage] = useState(1);

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Revoke Modal State
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  // Archive Modal State
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRestrictedPersons({
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: status || undefined,
        restrictionType: restrictionType || undefined,
      });

      if (res.success) {
        setRecords(res.data || []);
        setPagination(res.pagination || { total: 0, pages: 1, limit: 20 });
      }
    } catch (err) {
      console.error('Error fetching restricted records:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, restrictionType]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(true);
      await revokeRestriction(revokeTarget._id, revocationReason.trim());
      setRevokeTarget(null);
      setRevocationReason('');
      fetchRecords();
    } catch (err) {
      console.error('Error revoking restriction:', err);
      alert('प्रतिबंध निरस्त करने में त्रुटि आई।');
    } finally {
      setRevoking(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    try {
      setArchiving(true);
      await archiveRestrictedPerson(archiveTarget._id);
      setArchiveTarget(null);
      fetchRecords();
    } catch (err) {
      console.error('Error archiving record:', err);
      alert('रिकॉर्ड संग्रहीत करने में त्रुटि आई।');
    } finally {
      setArchiving(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await exportRestrictedCsv({
        search: search.trim() || undefined,
        status: status || undefined,
        restrictionType: restrictionType || undefined,
      });
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('CSV निर्यात करने में त्रुटि आई।');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (r) => {
    const effStatus = r.effectiveStatus || r.status;
    switch (effStatus) {
      case 'active':
        return <Badge variant="danger" size="sm">सक्रिय प्रतिबंध (Active)</Badge>;
      case 'expired':
        return <Badge variant="warning" size="sm">कालबाधित (Expired)</Badge>;
      case 'revoked':
        return <Badge variant="success" size="sm">निरस्त (Revoked)</Badge>;
      case 'archived':
        return <Badge variant="default" size="sm">संग्रहीत (Archived)</Badge>;
      default:
        return <Badge variant="default" size="sm">{effStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. CONFIDENTIALITY ALERT BANNER */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-red-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-red-500/40 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-red-600/30 text-red-300 border border-red-500/30 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-red-200">
              अत्यंत गोपनीय प्रशासनिक सुरक्षा रिकॉर्ड (Strictly Confidential)
            </span>
            <Badge variant="maroon" size="sm">Private</Badge>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            यह रिकॉर्ड्स केवल अधिकृत ट्रस्टियों एवं सुरक्षा समिति हेतु हैं। यह जानकारी किसी भी सार्वजनिक पृष्ठ,
            खोज इंजन अथवा बाहरी पोर्टल पर कभी भी प्रदर्शित नहीं की जाती है।
          </p>
        </div>
      </div>

      {/* 2. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <span>प्रतिबंधित व्यक्ति रिकॉर्ड (Restricted Persons)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            कुल {pagination.total} प्रशासनिक प्रविष्टियां दर्ज हैं
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{exporting ? 'निर्यात हो रहा...' : 'CSV निर्यात'}</span>
          </button>

          <Link to="/admin/restricted-persons/new">
            <Button variant="danger" size="sm" className="text-xs shadow-xs">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>+ नया प्रतिबंध जोड़ें</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <Card variant="default" className="p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="खोजें: नाम, मोबाइल, गांव, कारण..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-sand-50/50"
              />
            </div>

            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-sand-50/50"
              >
                <option value="">सभी स्थिति (All Status)</option>
                <option value="active">सक्रिय (Active)</option>
                <option value="expired">कालबाधित (Expired)</option>
                <option value="revoked">निरस्त (Revoked)</option>
              </select>
            </div>

            <div>
              <select
                value={restrictionType}
                onChange={(e) => setRestrictionType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-sand-50/50"
              >
                <option value="">सभी प्रकार (All Types)</option>
                <option value="temporary_restriction">अस्थायी (Temporary)</option>
                <option value="permanent_restriction">स्थायी (Permanent)</option>
                <option value="event_specific">कार्यक्रम-विशिष्ट (Event Specific)</option>
                <option value="other">अन्य (Other)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatus('');
                setRestrictionType('');
                setPage(1);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 px-3 py-1 font-medium transition"
            >
              साफ़ करें
            </button>
            <Button type="submit" variant="secondary" size="sm" className="text-xs">
              फ़िल्टर करें
            </Button>
          </div>
        </form>
      </Card>

      {/* 4. TABLE */}
      <Card variant="default" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-sand-100/60 text-stone-600 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">रिकॉर्ड क्र.</th>
                <th className="py-3 px-4">व्यक्ति का नाम</th>
                <th className="py-3 px-4">स्थान</th>
                <th className="py-3 px-4">प्रतिबंध प्रकार</th>
                <th className="py-3 px-4">स्थिति</th>
                <th className="py-3 px-4">प्रारंभ तिथि</th>
                <th className="py-3 px-4">समाप्ति तिथि</th>
                <th className="py-3 px-4 text-right">कार्य</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                    <span>प्रतिबंधित रिकॉर्ड्स लोड हो रहे हैं...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-400 font-medium">
                    कोई प्रतिबंधित रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-sand-50/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-red-900 whitespace-nowrap">
                      {r.recordNumber}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900 block">{r.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{r.mobile || '-'}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-stone-800 font-medium">{r.village || '-'}</span>
                      {r.city && <span className="text-[10px] text-stone-400 block">{r.city}</span>}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="capitalize text-stone-700">
                        {r.restrictionType?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(r)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                      {r.startDate ? new Date(r.startDate).toLocaleDateString('hi-IN') : '-'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                      {r.endDate ? new Date(r.endDate).toLocaleDateString('hi-IN') : 'स्थायी / अनिर्धारित'}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/restricted-persons/${r._id}`}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-800 hover:bg-red-50 transition"
                          title="विवरण देखें"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/admin/restricted-persons/${r._id}/edit`}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-indigo-800 hover:bg-indigo-50 transition"
                          title="संपादित करें"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {r.status === 'active' && !r.isCurrentlyExpired && (
                          <button
                            type="button"
                            onClick={() => {
                              setRevokeTarget(r);
                              setRevocationReason('');
                            }}
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
                            title="प्रतिबंध निरस्त करें (Revoke)"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setArchiveTarget(r)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                          title="संग्रहीत करें"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. REVOCATION CONFIRMATION MODAL */}
      {revokeTarget && (
        <Modal
          isOpen={Boolean(revokeTarget)}
          onClose={() => setRevokeTarget(null)}
          title="प्रतिबंध निरस्तीकरण पुष्टि (Revocation Confirmation)"
        >
          <div className="space-y-4 text-xs sm:text-sm text-stone-700">
            <p>
              क्या आप सुनिश्चित हैं कि आप व्यक्ति{' '}
              <strong className="text-stone-900 font-bold">{revokeTarget.name}</strong> पर लगे
              प्रतिबंध (<span className="font-mono text-red-900">{revokeTarget.recordNumber}</span>) को निरस्त करना चाहते हैं?
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                निरस्तीकरण का कारण / कार्यकारिणी प्रस्ताव (Revocation Reason):
              </label>
              <textarea
                rows="3"
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                placeholder="उदा. कार्यकारिणी बैठक में माफीनामा स्वीकार..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevokeTarget(null)}
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
                प्रतिबंध निरस्त करें
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. ARCHIVE CONFIRMATION MODAL */}
      {archiveTarget && (
        <Modal
          isOpen={Boolean(archiveTarget)}
          onClose={() => setArchiveTarget(null)}
          title="प्रतिबंधित रिकॉर्ड संग्रह पुष्टि"
        >
          <div className="space-y-4 text-xs sm:text-sm text-stone-700">
            <p>
              क्या आप सुनिश्चित हैं कि आप रिकॉर्ड{' '}
              <strong className="text-stone-900 font-mono">{archiveTarget.recordNumber}</strong> को
              संग्रहीत करना चाहते हैं?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArchiveTarget(null)}
                disabled={archiving}
              >
                रद्द करें
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleArchiveConfirm}
                isLoading={archiving}
              >
                संग्रहीत करें
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RestrictedPersonListPage;
