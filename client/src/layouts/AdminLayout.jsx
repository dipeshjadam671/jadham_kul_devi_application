import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  HeartHandshake,
  TrendingUp,
  Receipt,
  Bell,
  Image,
  Compass,
  Flame,
  BarChart3,
  Users,
  ShieldAlert,
  FileText,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Landmark,
  ScrollText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';

/**
 * AdminLayout Component - Phase 4
 * Admin & Committee Management portal layout
 */
export const AdminLayout = () => {
  const { currentUser, role, logout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navSections = [
    {
      title: 'मुख्य प्रबंधन (Core)',
      items: [
        {
          name: 'डैशबोर्ड (Dashboard)',
          path: '/admin/dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          active: true,
        },
        {
          name: 'मेरी प्रोफाइल (Profile)',
          path: '/admin/profile',
          icon: <User className="w-5 h-5" />,
          active: true,
        },
      ],
    },
    {
      title: 'मंदिर सामग्री प्रबंधन (Phase 4 CMS)',
      items: [
        { name: 'मंदिर परिचय व समय (Temple Info)', path: '/admin/temple-info', icon: <Landmark className="w-5 h-5" />, active: true },
        { name: 'मंदिर नियमावली (15 Rules)', path: '/admin/temple-rules', icon: <ScrollText className="w-5 h-5" />, active: true },
        { name: 'सूचना एवं कार्यक्रम (Notices)', path: '/admin/notices', icon: <Bell className="w-5 h-5" />, active: true },
        { name: 'फोटो/वीडियो गैलरी (Gallery)', path: '/admin/gallery', icon: <Image className="w-5 h-5" />, active: true },
      ],
    },
    {
      title: 'वित्तीय प्रबंधन (Financials - Phase 3)',
      items: [
        { name: 'दान प्रबंधन (Donations)', path: '/admin/donations', icon: <HeartHandshake className="w-5 h-5" />, active: true },
        { name: 'आय खाता (Other Income)', path: '/admin/income', icon: <TrendingUp className="w-5 h-5" />, active: true },
        { name: 'व्यय लेखा (Expenses)', path: '/admin/expenses', icon: <Receipt className="w-5 h-5" />, active: true },
        { name: 'वित्तीय रिपोर्ट्स (Reports & CSV)', path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" />, active: true },
      ],
    },
    {
      title: 'यात्रा प्रबंधन (Yatra - Phase 5)',
      items: [
        { name: 'यात्रा डैशबोर्ड (Dashboard)', path: '/admin/yatra', icon: <Compass className="w-5 h-5" />, active: true },
        { name: 'पंजीकरण सूची (Registrations)', path: '/admin/yatra/registrations', icon: <Users className="w-5 h-5" />, active: true },
        { name: 'भुगतान खाता (Payment Ledger)', path: '/admin/yatra/payments', icon: <Receipt className="w-5 h-5" />, active: true },
        { name: 'दिशा-निर्देश व नियम (Info)', path: '/admin/yatra/info', icon: <ScrollText className="w-5 h-5" />, active: true },
        { name: 'यात्रा रिपोर्ट्स (Reports)', path: '/admin/yatra/reports', icon: <BarChart3 className="w-5 h-5" />, active: true },
      ],
    },
    {
      title: 'वार्षिक पूजा रिकॉर्ड (Puja - Phase 6)',
      items: [
        { name: 'पूजा डैशबोर्ड (Dashboard)', path: '/admin/puja', icon: <Flame className="w-5 h-5" />, active: true },
        { name: 'पूजा प्रविष्टियां (Records)', path: '/admin/puja/records', icon: <ScrollText className="w-5 h-5" />, active: true },
        { name: 'पूजा सांख्यिकी (Reports)', path: '/admin/puja/reports', icon: <BarChart3 className="w-5 h-5" />, active: true },
      ],
    },
    {
      title: 'सुरक्षा व प्रतिबंध रिकॉर्ड (Restricted - Phase 6)',
      items: [
        { name: 'प्रतिबंधित सूची (Restricted)', path: '/admin/restricted-persons', icon: <ShieldAlert className="w-5 h-5" />, active: true },
      ],
    },
    {
      title: 'सदस्य व समिति प्रबंधन (Users & Committee - Phase 6)',
      items: [
        { name: 'समिति डायरेक्टरी (Committee)', path: '/admin/committee', icon: <Users className="w-5 h-5" />, active: true },
        { name: 'उपयोगकर्ता सूची (All Users)', path: '/admin/users', icon: <Users className="w-5 h-5" />, active: true },
      ],
    },
    {
      title: 'आगामी मॉड्यूल (Upcoming Roadmap)',
      items: [
        { name: 'सिस्टम ऑडिट लॉग्स (Audit Logs)', path: '/admin/audit-logs', icon: <FileText className="w-5 h-5" />, phase: 'P7' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col antialiased">
      
      {/* TOPBAR */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          {/* Left: Branding & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle sidebar"
            >
              {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <span className="text-2xl">🕉️</span>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-stone-900 leading-tight">
                  जादम कुलदेवी मंदिर प्रबंधन
                </h1>
                <p className="text-[11px] text-stone-500 hidden sm:block">
                  खलघाट • प्रशासनिक पोर्टल (Phase 2)
                </p>
              </div>
            </Link>
          </div>

          {/* Right: User details & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-saffron-700 transition-colors"
              title="View Public Site"
            >
              <span>पब्लिक वेबसाइट</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-4 border-l border-stone-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-800 leading-none">
                  {currentUser?.name || 'प्रशासक सदस्य'}
                </p>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                  {currentUser?.mobile || 'प्रमाणीकृत'}
                </p>
              </div>

              <Badge
                variant={role === 'admin' ? 'maroon' : 'gold'}
                size="sm"
                className="capitalize"
              >
                {role === 'admin' ? 'Administrator' : 'Committee Member'}
              </Badge>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* BODY WITH SIDEBAR & CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-stone-200 p-4 shrink-0 overflow-y-auto">
          <nav className="space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-saffron-50 text-saffron-800 font-bold border border-saffron-200'
                          : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    {item.phase && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">
                        {item.phase}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-4 overflow-y-auto flex flex-col z-10">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                <span className="font-bold text-stone-900">प्रबंधन नेविगेशन</span>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-6 flex-1">
                {navSections.map((section, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {section.title}
                    </p>
                    {section.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-saffron-50 text-saffron-800 font-bold border border-saffron-200'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                        {item.phase && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                            {item.phase}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                ))}
              </nav>

              <div className="pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>लॉग आउट</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN ADMIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
