import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Flame,
  Search,
  Filter,
  PlusCircle,
  FileSpreadsheet,
  Eye,
  Edit2,
  Archive,
  RefreshCw,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { getPujaRecords, archivePujaRecord, exportPujaCsv } from '../../../services/pujaService';
import { formatINR } from '../../../utils/formatters';

/**
 * PujaRecordListPage Component - Phase 6
 * Administrative records directory with search, filters, pagination, and CSV export.
 */
export const PujaRecordListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [pujaType, setPujaType] = useState(searchParams.get('pujaType') || '');
  const [pujaStatus, setPujaStatus] = useState(searchParams.get('pujaStatus') || '');
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('paymentStatus') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Data state
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Archive modal state
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        search: search.trim() || undefined,
        year: year || undefined,
        pujaType: pujaType || undefined,
        pujaStatus: pujaStatus || undefined,
        paymentStatus: paymentStatus || undefined,
      };

      const res = await getPujaRecords(params);
      if (res.success) {
        setRecords(res.data || []);
        setPagination(res.pagination || { total: 0, pages: 1, limit: 20 });
      }
    } catch (err) {
      console.error('Error fetching puja records:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, year, pujaType, pujaStatus, paymentStatus]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleResetFilters = () => {
    setSearch('');
    setYear('');
    setPujaType('');
    setPujaStatus('');
    setPaymentStatus('');
    setPage(1);
    setSearchParams({});
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    try {
      setArchiving(true);
      await archivePujaRecord(archiveTarget._id);
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
      await exportPujaCsv({
        search: search.trim() || undefined,
        year: year || undefined,
        pujaType: pujaType || undefined,
        pujaStatus: pujaStatus || undefined,
        paymentStatus: paymentStatus || undefined,
      });
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('CSV निर्यात करने में त्रुटि आई।');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" size="sm">संपन्न (Completed)</Badge>;
      case 'registered':
        return <Badge variant="info" size="sm">पंजीकृत (Registered)</Badge>;
      case 'scheduled':
        return <Badge variant="warning" size="sm">नियत (Scheduled)</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="sm">निरस्त (Cancelled)</Badge>;
      case 'archived':
        return <Badge variant="default" size="sm">संग्रहीत (Archived)</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">सशुल्क (Paid)</span>;
      case 'pending':
        return <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">लंबित (Pending)</span>;
      case 'not_required':
        return <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">निःशुल्क</span>;
      default:
        return <span className="text-[11px] font-medium text-stone-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-600" />
            <span>पूजा रिकॉर्ड सूची (Puja Records)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            कुल {pagination.total} प्रविष्टियां दर्ज हैं
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

          <Link to="/admin/puja/records/new">
            <Button variant="gold" size="sm" className="text-xs shadow-xs">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>+ नया पूजा रिकॉर्ड</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <Card variant="default" className="p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="खोजें: रिकॉर्ड क्र., यजमान नाम, परिवार, गांव..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-sand-50/50"
              />
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-sand-50/50"
              >
                <option value="">सभी वर्ष (All Years)</option>
                <option value="2027">वर्ष 2027</option>
                <option value="2026">वर्ष 2026</option>
                <option value="2025">वर्ष 2025</option>
                <option value="2024">वर्ष 2024</option>
              </select>
            </div>

            {/* Puja Type Filter */}
            <div>
              <select
                value={pujaType}
                onChange={(e) => setPujaType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-sand-50/50"
              >
                <option value="">सभी पूजा प्रकार</option>
                <option value="annual_puja">वार्षिक पूजा (Annual)</option>
                <option value="special_puja">विशेष पूजा (Special)</option>
                <option value="navratri_puja">नवरात्रि पूजा (Navratri)</option>
                <option value="ashtami_puja">अष्टमी पूजा (Ashtami)</option>
                <option value="navami_puja">नवमी पूजा (Navami)</option>
                <option value="other">अन्य (Other)</option>
              </select>
            </div>

            {/* Puja Status Filter */}
            <div>
              <select
                value={pujaStatus}
                onChange={(e) => setPujaStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-sand-50/50"
              >
                <option value="">सभी स्थिति (Status)</option>
                <option value="registered">पंजीकृत (Registered)</option>
                <option value="completed">संपन्न (Completed)</option>
                <option value="scheduled">नियत (Scheduled)</option>
                <option value="cancelled">निरस्त (Cancelled)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
            <span className="text-stone-400">
              पृष्ठ {pagination.page} / {pagination.pages}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-stone-500 hover:text-stone-800 px-3 py-1 font-medium transition"
              >
                फ़िल्टर साफ़ करें
              </button>

              <Button type="submit" variant="secondary" size="sm" className="text-xs">
                फ़िल्टर लागू करें
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* 3. TABLE OF RECORDS */}
      <Card variant="default" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-sand-100/60 text-stone-600 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">रिकॉर्ड क्र.</th>
                <th className="py-3 px-4">वर्ष / दिनांक</th>
                <th className="py-3 px-4">यजमान / परिवार</th>
                <th className="py-3 px-4">स्थान</th>
                <th className="py-3 px-4 text-center">श्रद्धालु</th>
                <th className="py-3 px-4 text-center">जोड़े</th>
                <th className="py-3 px-4 text-center">जमाल</th>
                <th className="py-3 px-4">स्थिति</th>
                <th className="py-3 px-4">सहयोग राशि</th>
                <th className="py-3 px-4 text-right">कार्य</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                    <span>पूजा रिकॉर्ड्स लोड हो रहे हैं...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-stone-400 font-medium">
                    कोई पूजा रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-sand-50/50 transition">
                    {/* Record No */}
                    <td className="py-3 px-4 font-mono font-bold text-amber-900 whitespace-nowrap">
                      {r.recordNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-stone-900 block">
                        {r.pujaDate ? new Date(r.pujaDate).toLocaleDateString('hi-IN') : '-'}
                      </span>
                      <span className="text-[10px] text-stone-400">वर्ष {r.year}</span>
                    </td>

                    {/* Devotee */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900 block truncate max-w-[160px]">
                        {r.primaryPersonName}
                      </span>
                      <span className="text-[10px] text-stone-500 block truncate max-w-[160px]">
                        {r.familyName || r.mobile || '-'}
                      </span>
                    </td>

                    {/* Village */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-stone-800 font-medium">{r.village || '-'}</span>
                      {r.city && <span className="text-[10px] text-stone-400 block">{r.city}</span>}
                    </td>

                    {/* People */}
                    <td className="py-3 px-4 text-center font-bold text-stone-800">
                      {r.numberOfPeople}
                    </td>

                    {/* Couples */}
                    <td className="py-3 px-4 text-center font-bold text-rose-700">
                      {r.numberOfCouples || 0}
                    </td>

                    {/* Jamal */}
                    <td className="py-3 px-4 text-center font-bold text-indigo-700">
                      {r.jamalCount || 0}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(r.pujaStatus)}
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-stone-900 block">
                        {r.amount > 0 ? formatINR(r.amount) : 'निःशुल्क'}
                      </span>
                      <div className="mt-0.5">{getPaymentBadge(r.paymentStatus)}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/puja/records/${r._id}`}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-amber-50 transition"
                          title="विवरण देखें (View)"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/admin/puja/records/${r._id}/edit`}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-indigo-800 hover:bg-indigo-50 transition"
                          title="संपादित करें (Edit)"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setArchiveTarget(r)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="संग्रहीत करें (Archive)"
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

        {/* 4. PAGINATION FOOTER */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              दिखा रहे हैं {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                पिछला
              </Button>
              <span className="px-2 text-stone-700 font-bold">{pagination.page}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                अगला
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. ARCHIVE CONFIRMATION MODAL */}
      {archiveTarget && (
        <Modal
          isOpen={Boolean(archiveTarget)}
          onClose={() => setArchiveTarget(null)}
          title="पूजा रिकॉर्ड संग्रह पुष्टि"
        >
          <div className="space-y-4 text-xs sm:text-sm text-stone-700">
            <p>
              क्या आप सुनिश्चित हैं कि आप पूजा रिकॉर्ड{' '}
              <strong className="text-amber-900 font-mono font-bold">
                {archiveTarget.recordNumber}
              </strong>{' '}
              ({archiveTarget.primaryPersonName}) को संग्रहीत (Archive) करना चाहते हैं?
            </p>
            <p className="text-stone-500 text-xs">
              संग्रहित रिकॉर्ड मुख्य सूची से हट जाएगा किंतु ऐतिहासिक रिपोर्ट्स में सुरक्षित रहेगा।
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

export default PujaRecordListPage;
