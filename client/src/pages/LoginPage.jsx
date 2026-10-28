import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Badge from '../components/common/Badge';

/**
 * LoginPage Component - Static Admin User ID & Password Authentication
 * Replaces Firebase Phone OTP with direct, reliable JWT-based Admin login.
 */
export const LoginPage = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Target to redirect after successful login (default: /admin/dashboard)
  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin' || role === 'committee') {
        navigate(from, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, from]);

  /**
   * Handle Login Submit
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('कृपया यूज़र आईडी और पासवर्ड दोनों दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const user = await login(username.trim(), password.trim());
      if (user && (user.role === 'admin' || user.role === 'committee')) {
        navigate(from, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'अमान्य यूज़र आईडी या पासवर्ड। कृपया पुनः जांचें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 bg-stone-50 min-h-[85vh] flex items-center justify-center px-4">
      <Container size="sm">
        <Card variant="warm" className="p-6 sm:p-10 shadow-xl border-amber-200/90 max-w-md mx-auto bg-white rounded-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-amber-900 flex items-center justify-center text-3xl">
                🕉️
              </div>
            </div>
            
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              प्रशासक लॉगिन (Admin Login)
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
              जादम परिवार कुलदेवी मंदिर प्रबंधन पोर्टल, खलघाट
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <Alert type="error" className="mb-6" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          {/* ADMIN CREDENTIALS LOGIN FORM */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* User ID / Username Input */}
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                यूज़र आईडी (User ID / Username) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="यूज़र आईडी दर्ज करें (User ID)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                पासवर्ड (Password) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="पासवर्ड दर्ज करें (Password)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-11 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="py-3.5 text-base font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>लॉगिन करें (Sign In)</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Footer security badge */}
          <div className="mt-8 pt-6 border-t border-stone-200 text-center">
            <div className="flex items-center justify-center gap-2 text-stone-500 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>सुरक्षित सत्र (JWT Protected Session) • जादम मंदिर ट्रस्ट</span>
            </div>
            <div className="mt-3">
              <Link to="/" className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline">
                ← मुख्य पृष्ठ पर वापस जाएं (Back to Home)
              </Link>
            </div>
          </div>

        </Card>
      </Container>
    </div>
  );
};

export default LoginPage;
