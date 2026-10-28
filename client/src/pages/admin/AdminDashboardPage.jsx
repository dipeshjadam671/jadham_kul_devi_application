import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  Key,
  Database,
  Activity,
  ArrowUpRight,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { testAuthEndpoints } from '../../services/api';
import {
  getFinancialSummary,
  getMonthlySummary,
} from '../../services/financialService';
import { getPujaDashboardSummary } from '../../services/pujaService';
import { getRestrictedCounts } from '../../services/restrictedPersonService';
import { getUserCounts } from '../../services/userService';
import { formatINR } from '../../utils/formatters';
import { MonthlyFinancialBarChart } from '../../components/financial/FinancialCharts';

/**
 * AdminDashboardPage Component - Phase 6 Complete
 * Live Financial, Yatra, Puja, Restricted Records, and Committee Command Center
 */
export const AdminDashboardPage = () => {
  const { currentUser, role } = useAuth();
  const isAdmin = role === 'admin';

  // Financial State
  const [financialSummary, setFinancialSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loadingFinancials, setLoadingFinancials] = useState(true);

  // Phase 6 State
  const [pujaSummary, setPujaSummary] = useState(null);
  const [restrictedCounts, setRestrictedCounts] = useState(null);
  const [userCounts, setUserCounts] = useState(null);

  // RBAC Test State
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoadingFinancials(true);
      try {
        const [sumRes, monthRes, pujaRes, restrictedRes, userRes] = await Promise.allSettled([
          getFinancialSummary(),
          getMonthlySummary(new Date().getFullYear()),
          getPujaDashboardSummary(),
          getRestrictedCounts(),
          getUserCounts(),
        ]);

        if (sumRes.status === 'fulfilled' && sumRes.value?.success) setFinancialSummary(sumRes.value.data);
        if (monthRes.status === 'fulfilled' && monthRes.value?.success) setMonthlyData(monthRes.value.data.months || []);
        if (pujaRes.status === 'fulfilled' && pujaRes.value?.success) setPujaSummary(pujaRes.value.data);
        if (restrictedRes.status === 'fulfilled' && restrictedRes.value?.success) setRestrictedCounts(restrictedRes.value.data);
        if (userRes.status === 'fulfilled' && userRes.value?.success) setUserCounts(userRes.value.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoadingFinancials(false);
      }
    };

    loadDashboardData();
  }, []);

  const runTestApi = async (type) => {
    setTesting(true);
    setTestResult(null);
    try {
      let data;
      if (type === 'authenticated') data = await testAuthEndpoints.authenticated();
      else if (type === 'committee') data = await testAuthEndpoints.committee();
      else if (type === 'admin') data = await testAuthEndpoints.admin();
      setTestResult({ success: true, type, data });
    } catch (err) {
      setTestResult({
        success: false,
        type,
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        errors: err.response?.data?.errors,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. WELCOME BANNER */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>प्रमाणीकृत प्रशासनिक नियंत्रण कक्ष (Active Session)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              स्वागत है, {currentUser?.name || 'समिति सदस्य'}
            </h1>

            <p className="text-stone-300 text-sm max-w-xl">
              जादम परिवार कुलदेवी मंदिर, खलघाट — वित्तीय प्रबंधन एवं प्रशासनिक अवलोकन।
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
            <Badge variant={isAdmin ? 'maroon' : 'gold'} size="md" className="py-1.5 px-3">
              {isAdmin ? '🛡️ Administrator / मुख्य प्रशासक' : '🎖️ Committee Member / समिति सदस्य'}
            </Badge>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-stone-200">खाता स्थिति:</span>
              <strong className="text-emerald-300 font-bold tracking-wide">सक्रिय (Active)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PENDING DONATIONS ACTION ALERT (If any pending records exist) */}
      {financialSummary?.pendingDonationCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-200/80 p-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                सत्यापन आवश्यक (Pending Verification)
              </p>
              <p className="text-sm font-semibold text-stone-800">
                {financialSummary.pendingDonationCount} दान प्रविष्टियां ({formatINR(financialSummary.pendingDonationTotal)}) सत्यापन हेतु लंबित हैं।
              </p>
            </div>
          </div>
          <Link
            to="/admin/donations?status=pending"
            className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
          >
            सत्यापित करें (Review Pending) →
          </Link>
        </div>
      )}

      {/* 3. LIVE FINANCIAL METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Verified Donations */}
        <Link
          to="/admin/donations"
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wide">
            <span>सत्यापित दान (Donations)</span>
            <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-amber-600 transition" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-emerald-700">
            {loadingFinancials ? '...' : formatINR(financialSummary?.totalDonations)}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            {financialSummary?.donationCount || 0} सत्यापित दान प्रविष्टियां
          </p>
        </Link>

        {/* Other Temple Income */}
        <Link
          to="/admin/income"
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wide">
            <span>अन्य मंदिर आय (Other Income)</span>
            <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-amber-600 transition" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-indigo-700">
            {loadingFinancials ? '...' : formatINR(financialSummary?.totalOtherIncome)}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            {financialSummary?.incomeCount || 0} अन्य आय प्रविष्टियां
          </p>
        </Link>

        {/* Total Expenses */}
        <Link
          to="/admin/expenses"
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wide">
            <span>कुल व्यय (Expenses)</span>
            <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-amber-600 transition" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-amber-600">
            {loadingFinancials ? '...' : formatINR(financialSummary?.totalExpenses)}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            {financialSummary?.expenseCount || 0} भुगतान बिल रिकॉर्ड
          </p>
        </Link>

        {/* Current Balance */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
            वर्तमान शेष निधि (Net Balance)
          </div>
          <p
            className={`mt-2 font-serif text-2xl font-bold ${
              (financialSummary?.currentBalance || 0) >= 0
                ? 'text-emerald-700'
                : 'text-rose-700'
            }`}
          >
            {loadingFinancials ? '...' : formatINR(financialSummary?.currentBalance)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600">
            (सत्यापित दान + अन्य आय) - कुल व्यय
          </p>
        </div>
      </div>

      {/* 4. QUICK ACTION BAR */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
          त्वरित प्रशासनिक कार्य (Quick Actions)
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            to="/admin/donations/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-200 py-2.5 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition"
          >
            <span>+</span> नया दान दर्ज करें
          </Link>
          <Link
            to="/admin/income/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 py-2.5 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 transition"
          >
            <span>+</span> अन्य आय दर्ज करें
          </Link>
          <Link
            to="/admin/expenses/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 py-2.5 px-3 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition"
          >
            <span>+</span> नया व्यय दर्ज करें
          </Link>
          <Link
            to="/admin/reports"
            className="flex items-center justify-center gap-2 rounded-xl bg-stone-50 border border-stone-200 py-2.5 px-3 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition"
          >
            <span>📊</span> वित्तीय रिपोर्ट / CSV
          </Link>
        </div>
      </div>

      {/* 4.1 PHASE 4 CONTENT & MEDIA CMS ACTIONS */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <span>🏛️</span>
            <span>वेबसाइट सामग्री एवं मीडिया प्रबंधन (Phase 4 CMS)</span>
          </h3>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            सक्रिय मॉड्यूल
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/temple-info"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 border border-amber-200/80 py-2.5 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
          >
            <span>🛕</span> मंदिर परिचय व समय
          </Link>
          <Link
            to="/admin/temple-rules"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 border border-amber-200/80 py-2.5 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
          >
            <span>📜</span> नियमावली (15 नियम)
          </Link>
          <Link
            to="/admin/notices"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 border border-amber-200/80 py-2.5 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
          >
            <span>📢</span> सूचनाएं एवं कार्यक्रम
          </Link>
          <Link
            to="/admin/gallery"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 border border-amber-200/80 py-2.5 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
          >
            <span>🖼️</span> फोटो/वीडियो गैलरी
          </Link>
        </div>
      </div>

      {/* 4.2 PHASE 5 YATRA MANAGEMENT ACTIONS */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <span>🚩</span>
            <span>तीर्थ यात्रा एवं दर्शन प्रबंधन (Phase 5 Yatra)</span>
          </h3>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            सक्रिय मॉड्यूल
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/yatra"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 border border-amber-200/80 py-2.5 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
          >
            <span>🧭</span> यात्रा डैशबोर्ड
          </Link>
          <Link
            to="/admin/yatra/registrations"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 border border-amber-200/80 py-2.5 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
          >
            <span>👥</span> पंजीकरण सूची
          </Link>
          <Link
            to="/admin/yatra/payments"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 border border-amber-200/80 py-2.5 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
          >
            <span>💳</span> भुगतान खाता
          </Link>
          <Link
            to="/admin/yatra/reports"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 border border-amber-200/80 py-2.5 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
          >
            <span>📊</span> यात्रा रिपोर्ट्स / CSV
          </Link>
        </div>
      </div>

      {/* 4.3 PHASE 6 ANNUAL PUJA, RESTRICTED & COMMITTEE KPIS */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-saffron-700" />
            <span>वार्षिक पूजा, सुरक्षा व समिति प्रबंधन (Phase 6 Modules)</span>
          </h3>
          <span className="text-[11px] font-semibold text-saffron-800 bg-saffron-50 px-2.5 py-0.5 rounded-full border border-saffron-200">
            सक्रिय मॉड्यूल
          </span>
        </div>

        {/* Phase 6 KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Puja Card */}
          <Link
            to="/admin/puja"
            className="group p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-saffron-50/40 hover:border-saffron-300 transition block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-saffron-600" />
                <span>वार्षिक पूजा</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-saffron-700" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-stone-900">
              {(pujaSummary?.stats || pujaSummary)?.totalRecords || 0}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {(pujaSummary?.stats || pujaSummary)?.totalCouples || 0} जोड़े • {formatINR((pujaSummary?.stats || pujaSummary)?.totalAmount || 0)}
            </p>
          </Link>

          {/* Restricted Persons Card (COUNTS ONLY - PRIVACY ENFORCED) */}
          <Link
            to="/admin/restricted-persons"
            className="group p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-rose-50/40 hover:border-rose-300 transition block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>सुरक्षा प्रतिबंध (गोपनीय)</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-700" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-rose-700">
              {restrictedCounts?.active || 0}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              सक्रिय प्रतिबंध • {restrictedCounts?.expired || 0} कालावधि समाप्त
            </p>
          </Link>

          {/* Committee Card */}
          <Link
            to="/admin/committee"
            className="group p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-amber-50/40 hover:border-amber-300 transition block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>समिति सदस्य</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-amber-900">
              {userCounts?.committee || 0}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              सक्रिय समिति सदस्य • {userCounts?.admin || 0} मुख्य प्रशासक
            </p>
          </Link>

          {/* Total Registered Users Card */}
          <Link
            to="/admin/users"
            className="group p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>कुल उपयोगकर्ता</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-blue-700" />
            </div>
            <p className="mt-2 text-xl font-extrabold text-stone-900">
              {userCounts?.total || 0}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {userCounts?.active || 0} सक्रिय खाते
            </p>
          </Link>
        </div>

        {/* Phase 6 Quick Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Link
            to="/admin/puja"
            className="flex items-center justify-center gap-2 rounded-xl bg-saffron-50 border border-saffron-200 py-2.5 px-3 text-xs font-semibold text-saffron-900 hover:bg-saffron-100 transition"
          >
            <span>🔥</span> पूजा डैशबोर्ड
          </Link>
          <Link
            to="/admin/puja/records/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-saffron-50 border border-saffron-200 py-2.5 px-3 text-xs font-semibold text-saffron-900 hover:bg-saffron-100 transition"
          >
            <span>+</span> नया पूजा रिकॉर्ड
          </Link>
          <Link
            to="/admin/committee"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-200 py-2.5 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
          >
            <span>🎖️</span> समिति डायरेक्टरी
          </Link>
          <Link
            to="/admin/restricted-persons"
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 py-2.5 px-3 text-xs font-semibold text-rose-900 hover:bg-rose-100 transition"
          >
            <span>🛡️</span> प्रतिबंधित सूची (सुरक्षा)
          </Link>
        </div>
      </div>

      {/* 5. MONTHLY INCOME VS EXPENSE COMPARISON CHART */}
      <MonthlyFinancialBarChart
        data={monthlyData}
        year={new Date().getFullYear()}
      />

      {/* 6. AUTHENTICATION & PROFILE DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="warm" className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">नाम (Name)</p>
              <p className="text-sm font-bold text-stone-900 truncate">{currentUser?.name || 'Devotee'}</p>
            </div>
          </div>
        </Card>

        <Card variant="warm" className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">भूमिका (Role)</p>
              <p className="text-sm font-bold text-stone-900 capitalize">{currentUser?.role || 'public'}</p>
            </div>
          </div>
        </Card>

        <Card variant="warm" className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">मोबाइल (Mobile)</p>
              <p className="text-sm font-bold text-stone-900 font-mono">{currentUser?.mobile || 'Not set'}</p>
            </div>
          </div>
        </Card>

        <Card variant="warm" className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">सत्यापन (Verification)</p>
              <p className="text-sm font-bold text-emerald-700">सुरक्षित सत्र (JWT Verified)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 7. RBAC TEST BENCH (Live Verification of Backend Authorization) */}
      <Card variant="default" className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              <span>आरबीएसी प्राधिकरण परीक्षण बेंच (Live Role Authorization Test)</span>
            </h3>
            <p className="text-xs text-stone-500">
              Test live backend endpoints protected by <code>authenticateUser</code> and <code>requireRole</code>.
            </p>
          </div>

          <Link to="/admin/profile">
            <Button variant="outline" size="sm" className="text-xs">
              प्रोफाइल देखें (View Profile)
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runTestApi('authenticated')}
            isLoading={testing}
          >
            Test 1: /api/v1/test/authenticated
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => runTestApi('committee')}
            isLoading={testing}
          >
            Test 2: /api/v1/test/committee
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => runTestApi('admin')}
            isLoading={testing}
          >
            Test 3: /api/v1/test/admin
          </Button>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className="mt-4 p-4 rounded-xl border bg-stone-50 font-mono text-xs overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-stone-700">Endpoint: /api/v1/test/{testResult.type}</span>
              <Badge variant={testResult.success ? 'success' : 'danger'} size="sm">
                {testResult.success ? '200 OK (Allowed)' : `${testResult.status || 403} Denied`}
              </Badge>
            </div>
            <pre className="text-stone-800">{JSON.stringify(testResult.data || testResult, null, 2)}</pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
