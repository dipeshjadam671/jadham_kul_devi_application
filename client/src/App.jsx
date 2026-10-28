import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Main App Component - Phase 2
 * Enriched with AuthProvider for application-wide Firebase session management
 */
export function App() {
  return (
    <AuthProvider>
      <div className="app-root min-h-screen">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
