import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Users,
  HeartHandshake,
  ArrowUpRight,
  PlusCircle,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import { getPujaStats, getMonthlyPujaSummary, exportPujaCsv } from '../../../services/pujaService';
import { formatINR } from '../../../utils/formatters';

/**
 * PujaDashboardPage Component - Phase 6
 * Central administrative dashboard for Mata Ji Annual Puja records.
 */
export const PujaDashboardPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const availableYears = [2027, 2026, 2025, 2024];

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, monthlyRes] = await Promise.all([
          getPujaStats(selectedYear),
          getMonthlyPujaSummary(selectedYear),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (monthlyRes.success) setMonthlyData(monthlyRes.data.months || []);
      } catch (err) {
        console.error('Error loading puja dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [selectedYear]);

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportPujaCsv({ year: selectedYear });
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('CSV निर्यात करने में त्रुटि आई।');
    } finally {
      setExporting(false);
    }
  };

  const maxParticipants = Math.max(...monthlyData.map((m) => m.people), 10);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. HEADER & YEAR SELECTOR */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <Flame className="w-3.5 h-3.5" />
              <span>माताजी वार्षिक पूजा नियंत्रण कक्ष (Phase 6)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              वार्षिक पूजा एवं अनुष्ठान प्रबंधन
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
              यजमान परिवारों, दंपति जोड़ा सहभागिता, जमाल निकासी एवं वार्षिक संकल्पों का केंद्रीकृत लेखा-जोखा।
            </p>
          </div>

          {/* Year Picker */}
          <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-xs">
            <Calendar className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-200">वर्ष चुनें:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-stone-900 text-amber-300 font-bold text-sm rounded-xl px-3 py-1.5 border border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTION BAR */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/puja/records/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-200 py-2.5 px-3 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-700" />
            <span>+ नया पूजा रिकॉर्ड</span>
          </Link>

          <Link
            to="/admin/puja/records"
            className="flex items-center justify-center gap-2 rounded-xl bg-stone-50 border border-stone-200 py-2.5 px-3 text-xs font-bold text-stone-800 hover:bg-stone-100 transition shadow-xs"
          >
            <Users className="w-4 h-4 text-stone-600" />
            <span>पूजा रिकॉर्ड सूची</span>
          </Link>

          <Link
            to="/admin/puja/reports"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 py-2.5 px-3 text-xs font-bold text-indigo-900 hover:bg-indigo-100 transition shadow-xs"
          >
            <BarChart3 className="w-4 h-4 text-indigo-700" />
            <span>वार्षिक रिपोर्ट्स</span>
          </Link>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 py-2.5 px-3 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>{exporting ? 'निर्यात हो रहा है...' : 'CSV डाउनलोड'}</span>
          </button>
        </div>
      </div>

      {/* 3. KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Records */}
        <Link
          to={`/admin/puja/records?year=${selectedYear}`}
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wide">
            <span>कुल प्रविष्टियां</span>
            <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-amber-600 transition" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-amber-900">
            {loading ? '...' : stats?.totalRecords || 0}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            {stats?.totalFamilies || 0} परिवार पंजीकृत
          </p>
        </Link>

        {/* Total Participants */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wide">
            कुल श्रद्धालु (People)
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-emerald-700">
            {loading ? '...' : stats?.totalPeople || 0}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">वार्षिक पूजा में सम्मिलित</p>
        </div>

        {/* Total Couples */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wide">
            दंपति जोड़े (Couples)
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-rose-700">
            {loading ? '...' : stats?.totalCouples || 0}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">जोड़ा पूजन में सहभागी</p>
        </div>

        {/* Total Jamal Count */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wide">
            जमाल निकासी (Jamal)
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-indigo-700">
            {loading ? '...' : stats?.totalJamalCount || 0}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">निकासी संख्या</p>
        </div>

        {/* Completed Pujas */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>सफलतापूर्वक संपन्न</span>
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-stone-900">
            {loading ? '...' : stats?.completedPujas || 0}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">विधि-विधान से पूर्ण</p>
        </div>

        {/* Pending Payments */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>लंबित भुगतान</span>
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-amber-700">
            {loading ? '...' : stats?.pendingPayments || 0}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">सत्यापन अपेक्षित</p>
        </div>

        {/* Total Collected Amount */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs col-span-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
            <Coins className="w-3.5 h-3.5 text-emerald-700" />
            <span>कुल पूजा सहयोग राशि (Total Amount)</span>
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-emerald-800">
            {loading ? '...' : formatINR(stats?.totalAmount || 0)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700">
            वर्ष {selectedYear} में पूजा रसीद सहयोग
          </p>
        </div>
      </div>

      {/* 4. MONTHLY PARTICIPATION CHART */}
      <Card variant="default" className="p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>वर्ष {selectedYear} मासिक पूजा एवं श्रद्धालु सहभागिता</span>
            </h3>
            <p className="text-xs text-stone-500">प्रत्येक माह में सम्मिलित कुल श्रद्धालुओं की संख्या</p>
          </div>
          <Badge variant="gold" size="sm">
            {selectedYear}
          </Badge>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-xs text-stone-400">
            मासिक चार्ट लोड हो रहा है...
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-48 pt-6">
            {monthlyData.map((m) => {
              const heightPercent = Math.min(100, Math.round((m.people / maxParticipants) * 100));
              return (
                <div key={m.month} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-stone-600 opacity-0 group-hover:opacity-100 transition">
                    {m.people}
                  </span>
                  <div
                    className="w-full max-w-[28px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all duration-300 group-hover:from-amber-700 group-hover:to-amber-500"
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                    title={`${m.monthName}: ${m.records} पूजा, ${m.people} लोग, ${m.couples} जोड़े`}
                  />
                  <span className="text-[10px] font-medium text-stone-500 truncate w-full text-center">
                    {m.monthName.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PujaDashboardPage;
