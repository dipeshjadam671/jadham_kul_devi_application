import React, { useState, useEffect } from 'react';
import {
  getMonthlySummary,
  getFinancialSummary,
  downloadFinancialCSV,
} from '../../../services/financialService';
import { formatINR } from '../../../utils/formatters';
import { MonthlyFinancialBarChart } from '../../../components/financial/FinancialCharts';

export const FinancialReportsPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [monthlyRes, summaryRes] = await Promise.all([
          getMonthlySummary(selectedYear),
          getFinancialSummary({ year: selectedYear }),
        ]);

        if (monthlyRes.success) {
          setMonthlyData(monthlyRes.data.months || []);
        }
        if (summaryRes.success) {
          setSummary(summaryRes.data);
        }
      } catch (err) {
        console.error('Failed to load financial reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [selectedYear]);

  const handleExport = async (type) => {
    setExporting(true);
    try {
      await downloadFinancialCSV(type, { year: selectedYear });
    } catch (err) {
      alert('CSV निर्यात करने में त्रुटि हुई');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Year Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            वार्षिक वित्तीय लेखा एवं प्रतिवेदन (Financial Statements)
          </h1>
          <p className="text-xs text-stone-500">
            माहवार आय-व्यय संतुलन, शुद्ध अधिशेष एवं ऑडिट-ग्रेड सीएसवी (CSV) डेटा निर्यात
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-stone-600">वित्तीय वर्ष:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-xs focus:border-amber-500 focus:outline-hidden"
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                वर्ष {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CSV Export Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-sm font-bold text-stone-800">
              ऑडिट एवं रिकॉर्ड निर्यात (Data Export)
            </p>
            <p className="text-[11px] text-stone-500">
              माइक्रोसॉफ्ट एक्सेल (Excel) एवं अकाउंटिंग सॉफ्टवेयर अनुकूल UTF-8 CSV फाइल डाउनलोड करें
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExport('summary')}
              disabled={exporting}
              className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50 transition"
            >
              📊 वार्षिक विवरण (CSV)
            </button>
            <button
              onClick={() => handleExport('donations')}
              disabled={exporting}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 transition"
            >
              📥 दान रजिस्टर (CSV)
            </button>
            <button
              onClick={() => handleExport('income')}
              disabled={exporting}
              className="rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 disabled:opacity-50 transition"
            >
              📥 अन्य आय (CSV)
            </button>
            <button
              onClick={() => handleExport('expenses')}
              disabled={exporting}
              className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50 transition"
            >
              📥 व्यय रजिस्टर (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* 4 Financial Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              कुल सत्यापित दान (Donations)
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-emerald-700">
              {formatINR(summary.totalDonations)}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">
              सत्यापित दान प्रविष्टियां: {summary.donationCount}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              अन्य मंदिर आय (Other Income)
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-indigo-700">
              {formatINR(summary.totalOtherIncome)}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">
              आय प्रविष्टियां: {summary.incomeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              कुल मंदिर व्यय (Expenses)
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-amber-600">
              {formatINR(summary.totalExpenses)}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">
              व्यय बिल: {summary.expenseCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              निवल शेष / बचत (Net Balance)
            </p>
            <p
              className={`mt-2 font-serif text-2xl font-bold ${
                summary.currentBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatINR(summary.currentBalance)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600">
              कुल आय - कुल व्यय का संतुलन
            </p>
          </div>
        </div>
      )}

      {/* SVG Comparison Chart */}
      <MonthlyFinancialBarChart data={monthlyData} year={selectedYear} />

      {/* 12-Month Detailed Statement Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="border-b border-stone-200 bg-stone-50 px-5 py-3">
          <h2 className="font-serif text-base font-bold text-stone-800">
            वर्ष {selectedYear} का माहवार आय-व्यय विवरण (Month-by-Month Statement)
          </h2>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-stone-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
            <span className="ml-3 text-sm">लेखा विवरण तैयार हो रहा है...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100/60 font-semibold text-stone-600">
                  <th className="py-3 px-4">माह (Month)</th>
                  <th className="py-3 px-4 text-right">सत्यापित दान</th>
                  <th className="py-3 px-4 text-right">अन्य आय</th>
                  <th className="py-3 px-4 text-right">कुल आय (Total Income)</th>
                  <th className="py-3 px-4 text-right">कुल व्यय (Expense)</th>
                  <th className="py-3 px-4 text-right">निवल बचत (Net Balance)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {monthlyData.map((m) => (
                  <tr key={m.monthNumber} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-4 font-medium text-stone-800">
                      {m.month} ({m.monthHindi})
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-700">
                      {formatINR(m.donations)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-700">
                      {formatINR(m.otherIncome)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                      {formatINR(m.income)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-amber-600">
                      {formatINR(m.expense)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        m.balance >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {formatINR(m.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {summary && (
                <tfoot>
                  <tr className="border-t-2 border-stone-300 bg-stone-50 font-bold text-stone-900">
                    <td className="py-3 px-4 font-serif text-sm">कुल वार्षिक योग (Year Total)</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatINR(summary.totalDonations)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatINR(summary.totalOtherIncome)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700">
                      {formatINR(summary.totalIncome)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-600">
                      {formatINR(summary.totalExpenses)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono ${
                        summary.currentBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {formatINR(summary.currentBalance)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
