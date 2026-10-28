import React, { useState, useEffect, useCallback } from 'react';
import {
  getPublicFinancialSummary,
  getPublicMonthlySummary,
  getPublicDonations,
  getPublicIncome,
  getPublicExpenses,
} from '../services/financialService';
import {
  formatINR,
  formatDate,
  DONATION_TYPES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} from '../utils/formatters';
import { MonthlyFinancialBarChart } from '../components/financial/FinancialCharts';

export const PublicFinancialTransparencyPage = () => {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState('donations'); // 'donations', 'income', 'expenses'

  // Summary & Monthly
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Donations Tab State
  const [donations, setDonations] = useState([]);
  const [donationPagination, setDonationPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [donationSearch, setDonationSearch] = useState('');
  const [donationType, setDonationType] = useState('');
  const [loadingDonations, setLoadingDonations] = useState(false);

  // Income Tab State
  const [incomeList, setIncomeList] = useState([]);
  const [incomePagination, setIncomePagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [incomeSearch, setIncomeSearch] = useState('');
  const [loadingIncome, setLoadingIncome] = useState(false);

  // Expenses Tab State
  const [expenses, setExpenses] = useState([]);
  const [expensePagination, setExpensePagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [expenseSearch, setExpenseSearch] = useState('');
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  // Load High-Level Summary and Chart on Mount
  useEffect(() => {
    const loadOverview = async () => {
      setLoadingSummary(true);
      try {
        const [sumRes, monthRes] = await Promise.all([
          getPublicFinancialSummary(),
          getPublicMonthlySummary(currentYear),
        ]);
        if (sumRes.success) setSummary(sumRes.data);
        if (monthRes.success) setMonthlyData(monthRes.data.months || []);
      } catch (err) {
        console.error('Failed to load public financial summary:', err);
      } finally {
        setLoadingSummary(false);
      }
    };
    loadOverview();
  }, [currentYear]);

  // Fetch Donations
  const fetchDonations = useCallback(async () => {
    setLoadingDonations(true);
    try {
      const res = await getPublicDonations({
        page: donationPagination.page,
        limit: donationPagination.limit,
        search: donationSearch,
        type: donationType,
      });
      if (res.success) {
        setDonations(res.data);
        setDonationPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching public donations:', err);
    } finally {
      setLoadingDonations(false);
    }
  }, [donationPagination.page, donationPagination.limit, donationSearch, donationType]);

  // Fetch Income
  const fetchIncome = useCallback(async () => {
    setLoadingIncome(true);
    try {
      const res = await getPublicIncome({
        page: incomePagination.page,
        limit: incomePagination.limit,
        search: incomeSearch,
      });
      if (res.success) {
        setIncomeList(res.data);
        setIncomePagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching public income:', err);
    } finally {
      setLoadingIncome(false);
    }
  }, [incomePagination.page, incomePagination.limit, incomeSearch]);

  // Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const res = await getPublicExpenses({
        page: expensePagination.page,
        limit: expensePagination.limit,
        search: expenseSearch,
      });
      if (res.success) {
        setExpenses(res.data);
        setExpensePagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching public expenses:', err);
    } finally {
      setLoadingExpenses(false);
    }
  }, [expensePagination.page, expensePagination.limit, expenseSearch]);

  // Trigger tab data fetch on tab change
  useEffect(() => {
    if (activeTab === 'donations') fetchDonations();
    else if (activeTab === 'income') fetchIncome();
    else if (activeTab === 'expenses') fetchExpenses();
  }, [activeTab, fetchDonations, fetchIncome, fetchExpenses]);

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Spiritual Header */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 p-8 text-center text-white shadow-xl border border-amber-500/30">
          <p className="font-serif text-xs font-bold tracking-widest text-amber-300 uppercase">
            || श्री कुलदेवी माताजी प्रसन्न ||
          </p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">
            सार्वजनिक वित्तीय पारदर्शिता एवं दान पंजी
          </h1>
          <p className="mt-1 font-serif text-base text-amber-200">
            जादम परिवार कुलदेवी मंदिर, खलघाट
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-xs text-stone-300 leading-relaxed">
            मंदिर प्रबंध समिति द्वारा प्रत्येक दान, मंदिर आय एवं व्यय का पूर्ण हिसाब सार्वजनिक हितार्थ
            प्रदर्शित किया जाता है। दानदाताओं की गोपनीयता हेतु संपर्क नंबर सुरक्षित (मास्क्ड) रखे जाते हैं।
          </p>
        </div>

        {/* 4 Transparent Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              कुल सत्यापित दान (Donations)
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-emerald-700">
              {loadingSummary ? '...' : formatINR(summary?.totalDonations)}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">
              {summary?.donationCount || 0} सत्यापित दानदाता
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              अन्य मंदिर आय (Other Income)
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-indigo-700">
              {loadingSummary ? '...' : formatINR(summary?.totalOtherIncome)}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">
              {summary?.incomeCount || 0} आय प्रविष्टियां
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              कुल मंदिर व्यय (Total Expenses)
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-amber-600">
              {loadingSummary ? '...' : formatINR(summary?.totalExpenses)}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">
              {summary?.expenseCount || 0} व्यवस्था बिल
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              वर्तमान शुद्ध कोष (Net Balance)
            </p>
            <p
              className={`mt-2 font-serif text-2xl font-bold ${
                (summary?.currentBalance || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {loadingSummary ? '...' : formatINR(summary?.currentBalance)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600">
              पूर्णतः सत्यापित एवं पारदर्शी संतुलन
            </p>
          </div>
        </div>

        {/* Monthly Comparison Chart */}
        <MonthlyFinancialBarChart data={monthlyData} year={currentYear} />

        {/* Public Registers Tabbed Section */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
          {/* Tabs header */}
          <div className="flex border-b border-stone-200 gap-4 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('donations')}
              className={`pb-3 transition ${
                activeTab === 'donations'
                  ? 'border-b-2 border-amber-600 text-amber-800 font-bold'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              📜 दानदाता पंजी (Verified Donations)
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`pb-3 transition ${
                activeTab === 'income'
                  ? 'border-b-2 border-amber-600 text-amber-800 font-bold'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              💰 अन्य मंदिर आय (Other Income)
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`pb-3 transition ${
                activeTab === 'expenses'
                  ? 'border-b-2 border-amber-600 text-amber-800 font-bold'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              📋 मंदिर व्यय विवरण (Transparent Expenses)
            </button>
          </div>

          {/* TAB 1: DONATIONS REGISTER */}
          {activeTab === 'donations' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <input
                    type="text"
                    value={donationSearch}
                    onChange={(e) => setDonationSearch(e.target.value)}
                    placeholder="दानदाता का नाम, गांव या रसीद क्र. खोजें..."
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <select
                    value={donationType}
                    onChange={(e) => {
                      setDonationType(e.target.value);
                      setDonationPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-800 focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="">सभी दान प्रकार (All Types)</option>
                    <option value="cash">नगद (Cash)</option>
                    <option value="upi">यूपीआई (UPI)</option>
                    <option value="bank_transfer">बैंक ट्रांसफर (Bank Transfer)</option>
                    <option value="item">वस्तु दान (Item)</option>
                    <option value="mixed">मिश्रित (Mixed)</option>
                  </select>
                </div>
                <div>
                  <button
                    onClick={() => setDonationPagination((prev) => ({ ...prev, page: 1 }))}
                    className="w-full rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition"
                  >
                    खोजें (Search)
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                {loadingDonations ? (
                  <div className="p-8 text-center text-xs text-stone-400">लोड हो रहा है...</div>
                ) : donations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500">कोई दान रिकॉर्ड नहीं मिला।</div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-600">
                        <th className="py-3 px-4">रसीद क्र.</th>
                        <th className="py-3 px-4">दिनांक</th>
                        <th className="py-3 px-4">दानदाता का नाम</th>
                        <th className="py-3 px-4">ग्राम / शहर</th>
                        <th className="py-3 px-4">प्रकार / विवरण</th>
                        <th className="py-3 px-4 text-right">दान मूल्य</th>
                        <th className="py-3 px-4">उद्देश्य</th>
                        <th className="py-3 px-4 text-center">संपर्क (Masked)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {donations.map((d) => {
                        const typeInfo = DONATION_TYPES[d.donationType] || DONATION_TYPES.other;
                        return (
                          <tr key={d._id} className="hover:bg-amber-50/40 transition">
                            <td className="py-2.5 px-4 font-mono font-semibold text-amber-900">
                              {d.receiptNumber}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-stone-500">
                              {formatDate(d.donationDate)}
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-stone-800">
                              {d.donorName}
                            </td>
                            <td className="py-2.5 px-4 text-stone-600">
                              {d.village || d.city || '—'}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                              {d.itemName && (
                                <span className="ml-1 text-[11px] text-stone-500">
                                  ({d.itemName} - {d.itemQuantity} {d.itemUnit || ''})
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right font-serif font-bold text-emerald-700">
                              {formatINR(d.totalFinancialValue)}
                            </td>
                            <td className="py-2.5 px-4 text-stone-600">{d.purpose}</td>
                            <td className="py-2.5 px-4 text-center font-mono text-stone-400 text-[11px]">
                              {d.mobileMasked || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
                <span>कुल {donationPagination.total} दानदाता | पृष्ठ {donationPagination.page} / {donationPagination.totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDonationPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={donationPagination.page <= 1}
                    className="rounded-lg border border-stone-200 px-3 py-1 hover:bg-stone-50 disabled:opacity-50"
                  >
                    पिछला
                  </button>
                  <button
                    onClick={() => setDonationPagination((prev) => ({ ...prev, page: Math.min(donationPagination.totalPages, prev.page + 1) }))}
                    disabled={donationPagination.page >= donationPagination.totalPages}
                    className="rounded-lg border border-stone-200 px-3 py-1 hover:bg-stone-50 disabled:opacity-50"
                  >
                    अगला
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OTHER INCOME */}
          {activeTab === 'income' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={incomeSearch}
                  onChange={(e) => setIncomeSearch(e.target.value)}
                  placeholder="आय शीर्षक या विवरण खोजें..."
                  className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
                />
                <button
                  onClick={() => setIncomePagination((prev) => ({ ...prev, page: 1 }))}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition"
                >
                  खोजें
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-200">
                {loadingIncome ? (
                  <div className="p-8 text-center text-xs text-stone-400">लोड हो रहा है...</div>
                ) : incomeList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500">कोई आय रिकॉर्ड नहीं मिला।</div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-600">
                        <th className="py-3 px-4">दिनांक</th>
                        <th className="py-3 px-4">मद / विवरण</th>
                        <th className="py-3 px-4">श्रेणी</th>
                        <th className="py-3 px-4">माध्यम</th>
                        <th className="py-3 px-4 text-right">राशि</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {incomeList.map((item) => (
                        <tr key={item._id} className="hover:bg-amber-50/40 transition">
                          <td className="py-2.5 px-4 font-mono text-stone-500">{formatDate(item.date)}</td>
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-stone-800">{item.title}</div>
                            {item.description && <div className="text-[11px] text-stone-500">{item.description}</div>}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-block rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-700">
                              {INCOME_CATEGORIES[item.category] || item.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-stone-600">
                            {PAYMENT_METHODS[item.paymentMethod] || item.paymentMethod}
                          </td>
                          <td className="py-2.5 px-4 text-right font-serif font-bold text-emerald-700">
                            {formatINR(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
                <span>कुल {incomePagination.total} प्रविष्टियां | पृष्ठ {incomePagination.page} / {incomePagination.totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIncomePagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={incomePagination.page <= 1}
                    className="rounded-lg border border-stone-200 px-3 py-1 hover:bg-stone-50 disabled:opacity-50"
                  >
                    पिछला
                  </button>
                  <button
                    onClick={() => setIncomePagination((prev) => ({ ...prev, page: Math.min(incomePagination.totalPages, prev.page + 1) }))}
                    disabled={incomePagination.page >= incomePagination.totalPages}
                    className="rounded-lg border border-stone-200 px-3 py-1 hover:bg-stone-50 disabled:opacity-50"
                  >
                    अगला
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPENSES */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="व्यय मद या विक्रेता खोजें..."
                  className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-hidden"
                />
                <button
                  onClick={() => setExpensePagination((prev) => ({ ...prev, page: 1 }))}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition"
                >
                  खोजें
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-200">
                {loadingExpenses ? (
                  <div className="p-8 text-center text-xs text-stone-400">लोड हो रहा है...</div>
                ) : expenses.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500">कोई व्यय रिकॉर्ड नहीं मिला।</div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-600">
                        <th className="py-3 px-4">दिनांक</th>
                        <th className="py-3 px-4">व्यय मद</th>
                        <th className="py-3 px-4">श्रेणी</th>
                        <th className="py-3 px-4">विक्रेता / फर्म</th>
                        <th className="py-3 px-4 text-right">राशि (Amount)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {expenses.map((item) => (
                        <tr key={item._id} className="hover:bg-amber-50/40 transition">
                          <td className="py-2.5 px-4 font-mono text-stone-500">{formatDate(item.date)}</td>
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-stone-800">{item.title}</div>
                            {item.description && <div className="text-[11px] text-stone-500">{item.description}</div>}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-block rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-700">
                              {EXPENSE_CATEGORIES[item.category] || item.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-stone-600">{item.vendor || '—'}</td>
                          <td className="py-2.5 px-4 text-right font-serif font-bold text-amber-600">
                            {formatINR(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
                <span>कुल {expensePagination.total} व्यय रिकॉर्ड | पृष्ठ {expensePagination.page} / {expensePagination.totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpensePagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={expensePagination.page <= 1}
                    className="rounded-lg border border-stone-200 px-3 py-1 hover:bg-stone-50 disabled:opacity-50"
                  >
                    पिछला
                  </button>
                  <button
                    onClick={() => setExpensePagination((prev) => ({ ...prev, page: Math.min(expensePagination.totalPages, prev.page + 1) }))}
                    disabled={expensePagination.page >= expensePagination.totalPages}
                    className="rounded-lg border border-stone-200 px-3 py-1 hover:bg-stone-50 disabled:opacity-50"
                  >
                    अगला
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
