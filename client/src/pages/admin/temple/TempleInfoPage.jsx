import React, { useState, useEffect } from 'react';
import { getTempleInfo, updateTempleInfo } from '../../../services/templeService';

export const TempleInfoPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    templeIntroduction: '',
    history: '',
    mataJiHistory: '',
    location: '',
    address: '',
    village: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    contactMobile: '',
    contactEmail: '',
    googleMapsUrl: '',
    coverImageUrl: '',
    logoUrl: '',
    templeTimings: {
      morningAarti: '',
      sandhyaAarti: '',
      shayanAarti: '',
      specialNote: '',
      festivalTimings: '',
      days: [],
    },
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await getTempleInfo();
        if (res.success && res.data) {
          setFormData({
            title: res.data.title || '',
            shortDescription: res.data.shortDescription || '',
            description: res.data.description || '',
            templeIntroduction: res.data.templeIntroduction || '',
            history: res.data.history || '',
            mataJiHistory: res.data.mataJiHistory || '',
            location: res.data.location || '',
            address: res.data.address || '',
            village: res.data.village || '',
            city: res.data.city || '',
            district: res.data.district || '',
            state: res.data.state || '',
            pincode: res.data.pincode || '',
            contactMobile: res.data.contactMobile || '',
            contactEmail: res.data.contactEmail || '',
            googleMapsUrl: res.data.googleMapsUrl || '',
            coverImageUrl: res.data.coverImageUrl || '',
            logoUrl: res.data.logoUrl || '',
            templeTimings: {
              morningAarti: res.data.templeTimings?.morningAarti || '07:00 AM',
              sandhyaAarti: res.data.templeTimings?.sandhyaAarti || '07:30 PM',
              shayanAarti: res.data.templeTimings?.shayanAarti || '09:00 PM',
              specialNote: res.data.templeTimings?.specialNote || '',
              festivalTimings: res.data.templeTimings?.festivalTimings || '',
              days: res.data.templeTimings?.days || [],
            },
          });
        }
      } catch (err) {
        console.error('Failed to load temple info:', err);
        setErrorMsg('मंदिर जानकारी लोड करने में समस्या आई।');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      templeTimings: {
        ...prev.templeTimings,
        [field]: value,
      },
    }));
  };

  const handleDayTimingChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedDays = [...prev.templeTimings.days];
      updatedDays[index] = { ...updatedDays[index], [field]: value };
      return {
        ...prev,
        templeTimings: {
          ...prev.templeTimings,
          days: updatedDays,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await updateTempleInfo(formData);
      if (res.success) {
        setSuccessMsg('मंदिर जानकारी सफलतापूर्वक सुरक्षित कर दी गई!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update temple info:', err);
      setErrorMsg(err.response?.data?.message || 'जानकारी सुरक्षित करने में त्रुटि हुई।');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            मंदिर परिचय एवं विवरण प्रबंधन
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            आधिकारिक वेबसाइट पर प्रदर्शित होने वाले परिचय, इतिहास, संपर्क एवं दर्शन समय का संपादन
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium flex items-center gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Temple Identity */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-lg font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
            1. मंदिर नाम व शीर्षक
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                मंदिर का पूरा नाम *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                मुख्य टैगलाइन / ध्येय वाक्य
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ट्रस्ट पंजीकरण विवरण
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Detailed Introductions and Lore */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-lg font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
            2. मंदिर परिचय एवं माँ कुलदेवी का पावन इतिहास
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                मंदिर परिचय (Temple Introduction)
              </label>
              <textarea
                name="templeIntroduction"
                rows={4}
                value={formData.templeIntroduction}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                माँ कुलदेवी का पौराणिक इतिहास (Sacred Mata Ji Lore)
              </label>
              <textarea
                name="mataJiHistory"
                rows={5}
                value={formData.mataJiHistory}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                मंदिर निर्माण व जीर्णोद्धार इतिहास
              </label>
              <textarea
                name="history"
                rows={3}
                value={formData.history}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Location and Contacts */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-lg font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
            3. पता, संपर्क एवं गूगल मैप्स लिंक
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                सड़क / घाट का पता
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                पिनकोड (Pincode)
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                संपर्क मोबाइल नंबर
              </label>
              <input
                type="text"
                name="contactMobile"
                value={formData.contactMobile}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                आधिकारिक ईमेल आईडी
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                गूगल मैप्स यूआरएल (Google Maps URL)
              </label>
              <input
                type="url"
                name="googleMapsUrl"
                value={formData.googleMapsUrl}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Aarti & Weekly Timings */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-lg font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
            4. दैनिक आरती एवं साप्ताहिक दर्शन समय-सारणी
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                प्रातः मंगला आरती समय
              </label>
              <input
                type="text"
                value={formData.templeTimings.morningAarti}
                onChange={(e) => handleTimingChange('morningAarti', e.target.value)}
                placeholder="उदा. 07:00 AM"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                संध्या महाआरती समय
              </label>
              <input
                type="text"
                value={formData.templeTimings.sandhyaAarti}
                onChange={(e) => handleTimingChange('sandhyaAarti', e.target.value)}
                placeholder="उदा. 07:30 PM"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                शयन आरती समय
              </label>
              <input
                type="text"
                value={formData.templeTimings.shayanAarti}
                onChange={(e) => handleTimingChange('shayanAarti', e.target.value)}
                placeholder="उदा. 09:00 PM"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-600">
                <tr>
                  <th className="p-3">दिन</th>
                  <th className="p-3">प्रातः दर्शन खुलना</th>
                  <th className="p-3">प्रातः दर्शन बंद</th>
                  <th className="p-3">सायं दर्शन खुलना</th>
                  <th className="p-3">सायं दर्शन बंद</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {formData.templeTimings.days.map((dayItem, idx) => (
                  <tr key={dayItem.day}>
                    <td className="p-3 font-bold text-stone-800">
                      {dayItem.dayHindi || dayItem.day}
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={dayItem.morningOpen}
                        onChange={(e) => handleDayTimingChange(idx, 'morningOpen', e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-stone-200 rounded-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={dayItem.morningClose}
                        onChange={(e) => handleDayTimingChange(idx, 'morningClose', e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-stone-200 rounded-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={dayItem.eveningOpen}
                        onChange={(e) => handleDayTimingChange(idx, 'eveningOpen', e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-stone-200 rounded-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={dayItem.eveningClose}
                        onChange={(e) => handleDayTimingChange(idx, 'eveningClose', e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-stone-200 rounded-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
          >
            {saving ? 'सुरक्षित हो रहा है...' : '💾 मंदिर जानकारी सुरक्षित करें'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default TempleInfoPage;
