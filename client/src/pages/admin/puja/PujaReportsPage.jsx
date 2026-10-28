import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Flame,
  Users,
  HeartHandshake,
  ArrowLeft,
  Coins,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import {
  getYearlyPujaSummary,
  getMonthlyPujaSummary,
  exportPujaCsv,
} from '../../../services/pujaService';
import { formatINR } from '../../../utils/formatters';

/**
 * PujaReportsPage Component - Phase 6
 * Comprehensive annual and monthly reports and historical analytics for Puja records.
 */
export const PujaReportsPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearlyList, setYearlyList] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const [yearlyRes, monthlyRes] = await Promise.all([
          getYearlyPujaSummary(),
          getMonthlyPujaSummary(selectedYear),
        ]);

        if (yearlyRes.success) setYearlyList(yearlyRes.data || []);
        if (monthlyRes.success) setMonthlyData(monthlyRes.data.months || []);
      } catch (err) {
        console.error('Error loading puja reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/puja"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-600" />
              <span>वार्षिक एवं मासिक पूजा रिपोर्ट्स (Puja Reports)</span>
            </h1>
            <p className="text-xs text-stone-500">
              वर्षवार पूजा प्रवृत्ति, दंपति सहभागिता एवं जमाल निकासी ऐतिहासिक लेखा
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition shadow-xs disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>{exporting ? 'निर्यात हो रहा...' : `वर्ष ${selectedYear} CSV डाउनलोड`}</span>
        </button>
      </div>

      {/* 1. YEARLY SUMMARY TABLE */}
      <Card variant="default" className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>वर्षवार समग्र तुलनात्मक रिपोर्ट (Yearly Summary)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-sand-100/60 text-stone-600 font-bold uppercase text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">वर्ष (Year)</th>
                <th className="py-2.5 px-3 text-center">कुल पूजा</th>
                <th className="py-2.5 px-3 text-center">कुल श्रद्धालु</th>
                <th className="py-2.5 px-3 text-center">दंपति जोड़े</th>
                <th className="py-2.5 px-3 text-center">जमाल निकासी</th>
                <th className="py-2.5 px-3 text-center">सफल संपन्न</th>
                <th className="py-2.5 px-3 text-center">निरस्त</th>
                <th className="py-2.5 px-3 text-right">कुल सहयोग राशि</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-400">
                    रिपोर्ट लोड हो रही है...
                  </td>
                </tr>
              ) : yearlyList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-400">
                    कोई वार्षिक रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                yearlyList.map((y) => (
                  <tr key={y._id || y.year} className="hover:bg-sand-50/50 transition">
                    <td className="py-3 px-3 font-serif font-black text-amber-900 text-sm">
                      {y.year}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-stone-800">
                      {y.records}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">
                      {y.people}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-rose-700">
                      {y.couples}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-700">
                      {y.jamalCount}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-emerald-700 font-semibold">{y.completed}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-stone-400">{y.cancelled}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900">
                      {formatINR(y.totalAmount || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 2. MONTHLY BREAKDOWN FOR SELECTED YEAR */}
      <Card variant="default" className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>मासिक पूजा विवरण तालिका (Monthly Breakdown for {selectedYear})</span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">वर्ष चुनें:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-bold border border-stone-200 rounded-lg px-2.5 py-1 bg-sand-50/50"
            >
              {[2027, 2026, 2025, 2024].map((yr) => (
                <option key={yr} value={yr}>
                  वर्ष {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-sand-100/60 text-stone-600 font-bold uppercase text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">माह (Month)</th>
                <th className="py-2.5 px-3 text-center">पूजा संख्या</th>
                <th className="py-2.5 px-3 text-center">श्रद्धालु संख्या</th>
                <th className="py-2.5 px-3 text-center">दंपति जोड़े</th>
                <th className="py-2.5 px-3 text-center">जमाल निकासी</th>
                <th className="py-2.5 px-3 text-right">सहयोग राशि</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {monthlyData.map((m) => (
                <tr key={m.month} className="hover:bg-sand-50/50 transition">
                  <td className="py-2.5 px-3 font-semibold text-stone-900">
                    {m.monthName} ({m.month})
                  </td>
                  <td className="py-2.5 px-3 text-center">{m.records}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{m.people}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-rose-700">{m.couples}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-indigo-700">{m.jamalCount}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-stone-800">
                    {m.amount > 0 ? formatINR(m.amount) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PujaReportsPage;
