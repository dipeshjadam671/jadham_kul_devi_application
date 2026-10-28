import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';
import MobileMenu from '../components/layout/MobileMenu';
import Footer from '../components/layout/Footer';

/**
 * Main Public Layout Component
 * Integrates Header, Navbar, Mobile Drawer, Child Routes, and Footer
 */
export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-sand-50/60 font-sans text-stone-800 antialiased">
      {/* Top Header */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Desktop Navigation */}
      <Navbar />

      {/* Mobile Drawer Navigation */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Routed Page Content */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
