import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { TEMPLE_INFO } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

/**
 * Header Component - Phase 2
 * Displays temple logo, Hindi title, Khalghat subtitle, mobile menu toggle,
 * and contextual authentication status.
 */
export const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { isAuthenticated, role, currentUser } = useAuth();
  const isStaff = role === 'admin' || role === 'committee';

  return (
    <header className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-saffron-900 text-white shadow-md border-b border-gold-600/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5 sm:py-4">
          
          {/* Temple Branding & Logo */}
          <Link
            to="/"
            className="flex items-center gap-3.5 group focus:outline-none"
            aria-label="जादम परिवार कुलदेवी मंदिर होमपेज"
          >
            {/* Sacred Temple Logo Placeholder */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-saffron-500 via-amber-400 to-gold-300 p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-maroon-950 flex flex-col items-center justify-center border border-gold-300/40">
                <span className="text-gold-400 text-xl font-bold leading-none select-none">🕉️</span>
                <span className="text-[9px] text-amber-200 uppercase tracking-widest font-semibold">मां</span>
              </div>
            </div>

            {/* Temple Title & Location */}
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-gold-300 transition-colors drop-shadow-xs">
                {TEMPLE_INFO.nameHindi}
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gold-300/90 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                <span>{TEMPLE_INFO.locationHindi}</span>
                <span className="hidden md:inline text-white/50">|</span>
                <span className="hidden md:inline text-white/70 text-xs">{TEMPLE_INFO.tagline}</span>
              </div>
            </div>
          </Link>

          {/* Quick Header Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/donation"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold bg-gold-400 text-maroon-950 hover:bg-gold-300 transition-colors shadow-sm"
            >
              सहयोग / दान
            </Link>

            {isAuthenticated ? (
              <Link
                to={isStaff ? '/admin/dashboard' : '/'}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-gold-200 border border-gold-400/40 transition-colors"
              >
                {isStaff ? (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5 text-gold-300" />
                    <span>डैशबोर्ड ({role})</span>
                  </>
                ) : (
                  <span>प्रमाणीकृत सदस्य</span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gold-200 border border-gold-400/40 hover:bg-white/10 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>लॉग इन (Login)</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gold-300 hover:text-white hover:bg-maroon-800/80 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-colors"
              aria-label={isMobileMenuOpen ? 'मेनू बंद करें' : 'मेनू खोलें'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
