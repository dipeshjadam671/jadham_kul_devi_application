import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';

/**
 * Navbar Component (Desktop) - Phase 2
 * Clean, modern navigation bar with traditional accents and contextual auth state
 */
export const Navbar = () => {
  const { isAuthenticated, role } = useAuth();
  const isStaff = role === 'admin' || role === 'committee';

  return (
    <nav className="hidden lg:block bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          
          <ul className="flex items-center space-x-1 sm:space-x-2">
            {NAV_LINKS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
                      isActive
                        ? 'text-saffron-700 bg-saffron-50 border border-saffron-200/80 shadow-xs'
                        : 'text-stone-700 hover:text-saffron-600 hover:bg-stone-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Quick link for Admin Dashboard or Login */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <NavLink
                to={isStaff ? '/admin/dashboard' : '/admin/profile'}
                className={({ isActive }) =>
                  `text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'text-maroon-800 bg-maroon-50 border border-maroon-200'
                      : 'text-stone-600 hover:text-maroon-800 hover:bg-stone-100'
                  }`
                }
              >
                {isStaff ? '🔒 प्रबंधन डैशबोर्ड' : '👤 मेरी प्रोफाइल'}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'text-saffron-800 bg-saffron-50 border border-saffron-200'
                      : 'text-stone-500 hover:text-saffron-700 hover:bg-stone-100'
                  }`
                }
              >
                लॉग इन (Login)
              </NavLink>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
