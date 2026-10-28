import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Compass,
  Calendar,
  DollarSign,
  Phone,
  FileText,
} from 'lucide-react';
import { getPublicYatraInfo, updateYatraInfo } from '../../../services/yatraService';

export const YatraInfoAdminPage = () => {
  const [activeTab, setActiveTab] = useState('RAM_NAVAMI');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    guidelines: '',
    departureGuidelines: '',
    departureLocation: '',
    destination: '',
    feePerPerson: 0,
    isRegistrationOpen: true,
    startDate: '',
    endDate: '',
    contactPersons: [],
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setFetching(true);
        setError(null);
        setSuccessMsg(null);
        const res = await getPublicYatraInfo(activeTab);
        if (res.success && res.data) {
          const d = res.data;
          setFormData({
            title: d.title || '',
            description: d.description || '',
            guidelines: d.guidelines || '',
            departureGuidelines: d.departureGuidelines || '',
            departureLocation: d.departureLocation || '',
            destination: d.destination || '',
            feePerPerson: d.feePerPerson || 0,
            isRegistrationOpen: d.isRegistrationOpen !== false,
            startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
            endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
            contactPersons: d.contactPersons || [],
          });
        }
      } catch (err) {
        console.error('Failed to load yatra info:', err);
        setError('यात्रा निर्देश लोड करने में त्रुटि हुई।');
      } finally {
        setFetching(false);
      }
    };

    fetchInfo();
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleContactChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.contactPersons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contactPersons: updated };
    });
  };

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: [
        ...prev.contactPersons,
        { name: '', phone: '', designation: 'यात्रा प्रभारी' },
      ],
    }));
  };

  const removeContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        ...formData,
        feePerPerson: Number(formData.feePerPerson) || 0,
      };

      const res = await updateYatraInfo(activeTab, payload);
      if (res.success) {
        setSuccessMsg('यात्रा विवरण एवं दिशा-निर्देश सफलतापूर्वक अद्यतन किए गए!');
      }
    } catch (err) {
      console.error('Failed to update yatra info:', err);
      setError(err.response?.data?.message || 'अद्यतन विफल रहा।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-16">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/yatra"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          यात्रा डैशबोर्ड
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
          सामग्री व निर्देश प्रबंधन
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
        यात्रा दिशा-निर्देश व नियम संपादक (Yatra Info Editor)
      </h1>

      {/* YATRA TYPE TABS */}
      <div className="flex border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('RAM_NAVAMI')}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition ${
            activeTab === 'RAM_NAVAMI'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          श्री राम नवमी दर्शन यात्रा
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MANSAROVAR')}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition ${
            activeTab === 'MANSAROVAR'
              ? 'border-sky-700 text-sky-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          कैलाश मानसरोवर यात्रा
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-600 border-t-transparent"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                यात्रा का शीर्षक (Title) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                संक्षिप्त विवरण (Description)
              </label>
              <textarea
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                प्रस्थान स्थल (Departure Location)
              </label>
              <input
                type="text"
                name="departureLocation"
                value={formData.departureLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                गंतव्य (Destination)
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                यात्रा प्रारंभ दिनांक
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                यात्रा समापन दिनांक
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                सहयोग राशि / शुल्क प्रति व्यक्ति (₹)
              </label>
              <input
                type="number"
                min="0"
                name="feePerPerson"
                value={formData.feePerPerson}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRegistrationOpen"
                  checked={formData.isRegistrationOpen}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-700 rounded-sm"
                />
                सार्वजनिक पंजीकरण खुला रखें (Open for Public Registration)
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                महत्वपूर्ण दिशा-निर्देश एवं आचार संहिता (Guidelines)
              </label>
              <textarea
                rows={5}
                name="guidelines"
                value={formData.guidelines}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                प्रस्थान व रिपोर्टिंग निर्देश (Departure Instructions)
              </label>
              <textarea
                rows={4}
                name="departureGuidelines"
                value={formData.departureGuidelines}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Persons */}
          <div className="border-t border-stone-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-900 uppercase">
                समिति संपर्क सूत्र (Coordinators)
              </h4>
              <button
                type="button"
                onClick={addContact}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950"
              >
                <Plus className="w-4 h-4" /> नया संपर्क जोड़ें
              </button>
            </div>

            <div className="space-y-3">
              {formData.contactPersons.map((contact, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <input
                    type="text"
                    placeholder="प्रभारी का नाम"
                    value={contact.name}
                    onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="मोबाइल नंबर"
                    value={contact.phone}
                    onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                    className="w-36 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="पद / दायित्व"
                    value={contact.designation}
                    onChange={(e) => handleContactChange(idx, 'designation', e.target.value)}
                    className="w-36 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeContact(idx)}
                    className="text-stone-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'सुरक्षित हो रहा है...' : 'निर्देश सुरक्षित करें'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default YatraInfoAdminPage;
