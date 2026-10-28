import React from 'react';
import { User, Phone, Mail, Shield, CheckCircle, Calendar, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';

/**
 * AdminProfilePage Component - Phase 2
 * Displays authenticated user profile and authorizations.
 * Modifying role or permissions from the client is strictly disabled.
 */
export const AdminProfilePage = () => {
  const { currentUser, role, permissions } = useAuth();

  const formattedDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'उपलब्ध नहीं';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-saffron-600" />
          <span>मेरी प्रोफाइल (My Profile)</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          जादम परिवार कुलदेवी मंदिर प्रबंधन प्रणाली में आपका पंजीकृत खाता विवरण
        </p>
      </div>

      {/* Profile Details Card */}
      <Card variant="warm" className="p-6 sm:p-8 space-y-6">
        
        {/* User Summary Top */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-saffron-500 to-gold-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-maroon-900 flex items-center justify-center text-3xl text-white">
                👤
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">{currentUser?.name || 'सदस्य'}</h2>
              <p className="text-xs text-stone-500 font-mono">{currentUser?.mobile || 'No Mobile Number'}</p>
            </div>
          </div>

          <div>
            <Badge
              variant={role === 'admin' ? 'maroon' : role === 'committee' ? 'gold' : 'neutral'}
              size="md"
              className="px-3.5 py-1.5 capitalize text-xs sm:text-sm"
            >
              Role: {role || 'public'}
            </Badge>
          </div>
        </div>

        {/* Read-Only Profile Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-saffron-600" />
              <span>पूरा नाम (Full Name)</span>
            </span>
            <p className="text-sm font-semibold text-stone-900">{currentUser?.name || 'Devotee'}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-saffron-600" />
              <span>मोबाइल नंबर (Mobile)</span>
            </span>
            <p className="text-sm font-semibold text-stone-900 font-mono">{currentUser?.mobile || 'उपलब्ध नहीं'}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-saffron-600" />
              <span>ईमेल पता (Email)</span>
            </span>
            <p className="text-sm font-semibold text-stone-900 font-mono">{currentUser?.email || 'दर्ज नहीं किया गया'}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>खाता स्थिति (Account Status)</span>
            </span>
            <p className="text-sm font-semibold text-emerald-700">सक्रिय (Active)</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>पंजीकरण तिथि (Member Since)</span>
            </span>
            <p className="text-sm font-semibold text-stone-900">{formattedDate}</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-maroon-700" />
              <span>सिस्टम आईडी (System User ID)</span>
            </span>
            <p className="text-xs font-semibold text-stone-600 font-mono truncate">{currentUser?.id || '—'}</p>
          </div>

        </div>

        {/* Assigned Permissions Section */}
        <div className="pt-4 border-t border-stone-100">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-gold-600" />
            <span>स्वीकृत अनुमतियां (Assigned Permissions)</span>
          </h3>

          {role === 'admin' ? (
            <Badge variant="maroon" size="md">
              ★ FULL_ADMINISTRATIVE_ACCESS (सर्वोच्च प्रशासनिक अधिकार)
            </Badge>
          ) : permissions && permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {permissions.map((perm) => (
                <Badge key={perm} variant="gold" size="sm">
                  {perm}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500">
              सामान्य सदस्य अधिकार (Standard member privileges)
            </p>
          )}
        </div>

        {/* Security Rule Notice */}
        <Alert type="info" title="Security & Governance Rule">
          सुरक्षा कारणों से उपयोगकर्ता अपनी भूमिका (Role) अथवा अनुमतियों (Permissions) को स्वयं संशोधित नहीं कर सकते। भूमिका परिवर्तन केवल मुख्य मंदिर ट्रस्टी द्वारा सुरक्षित एडमिन कंसोल से किया जा सकता है।
        </Alert>

      </Card>

    </div>
  );
};

export default AdminProfilePage;
