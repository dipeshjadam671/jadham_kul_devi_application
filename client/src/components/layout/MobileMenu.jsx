import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LogIn, LogOut, LayoutDashboard, User } from 'lucide-react';
import { NAV_LINKS, TEMPLE_INFO } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

/**
 * MobileMenu Component - Phase 2
 * Responsive slide-in drawer for tablet and mobile screens with auth controls
 */
export const MobileMenu = ({ isOpen, setIsOpen }) => {
  const { isAuthenticated, role, logout } = useAuth();
  const isStaff = role === 'admin' || role === 'committee';

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10">
        
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-maroon-900 to-saffron-900 text-white flex items-center justify-between border-b border-gold-600/40">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🕉️</span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {TEMPLE_INFO.nameHindi}
              </h2>
              <p className="text-xs text-gold-300">{TEMPLE_INFO.locationHindi}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-stone-200 hover:text-white hover:bg-white/10"
            aria-label="मेनू बंद करें"
          >
            &times;
          </button>
        </div>

        {/* Links Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-saffron-50 text-saffron-700 font-bold border border-saffron-200'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-saffron-600'
                }`
              }
            >
              <span>{item.label}</span>
              <span className="text-xs text-stone-400 uppercase font-mono">{item.labelEn}</span>
            </NavLink>
          ))}

          {/* Admin / Login Section */}
          <div className="pt-4 mt-4 border-t border-stone-200 space-y-2">
            {isAuthenticated ? (
              <>
                {isStaff && (
                  <NavLink
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-maroon-50 text-maroon-800 border border-maroon-200'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-maroon-700" />
                      <span>प्रबंधन डैशबोर्ड</span>
                    </div>
                    <Badge variant={role === 'admin' ? 'maroon' : 'gold'} size="sm">
                      {role}
                    </Badge>
                  </NavLink>
                )}

                <NavLink
                  to="/admin/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  <User className="w-4 h-4 text-stone-500" />
                  <span>मेरी प्रोफाइल</span>
                </NavLink>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>लॉग आउट</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-saffron-800 bg-saffron-50 hover:bg-saffron-100 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>लॉग इन (Devotee / Admin Login)</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-500">
            {TEMPLE_INFO.tagline}
          </p>
        </div>

      </div>
    </div>
  );
};

export default MobileMenu;
