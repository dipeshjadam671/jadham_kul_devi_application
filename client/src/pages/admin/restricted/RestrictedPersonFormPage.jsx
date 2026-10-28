import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Save,
  Lock,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import {
  createRestrictedPerson,
  getRestrictedPersonById,
  updateRestrictedPerson,
} from '../../../services/restrictedPersonService';

/**
 * RestrictedPersonFormPage Component - Phase 6
 * Form for adding and updating confidential restricted person records.
 */
export const RestrictedPersonFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
    city: '',
    address: '',
    photoUrl: '',
    reason: '',
    description: '',
    restrictionType: 'temporary_restriction',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditMode) {
      const loadRecord = async () => {
        try {
          setLoading(true);
          const res = await getRestrictedPersonById(id);
          if (res.success && res.data) {
            const r = res.data;
            setFormData({
              name: r.name || '',
              mobile: r.mobile || '',
              village: r.village || '',
              city: r.city || '',
              address: r.address || '',
              photoUrl: r.photoUrl || '',
              reason: r.reason || '',
              description: r.description || '',
              restrictionType: r.restrictionType || 'temporary_restriction',
              status: r.status || 'active',
              startDate: r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '',
              endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '',
              notes: r.notes || '',
            });
          }
        } catch (err) {
          console.error('Error loading restricted person:', err);
          setError('रिकॉर्ड लोड करने में असमर्थ।');
        } finally {
          setLoading(false);
        }
      };

      loadRecord();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('व्यक्ति का नाम अनिवार्य है।');
      return;
    }
    if (!formData.reason.trim()) {
      setError('प्रतिबंध का कारण अनिवार्य है।');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
      };

      if (isEditMode) {
        await updateRestrictedPerson(id, payload);
      } else {
        await createRestrictedPerson(payload);
      }

      navigate('/admin/restricted-persons');
    } catch (err) {
      console.error('Error saving restricted record:', err);
      setError(err.response?.data?.message || err.message || 'सहेजने में त्रुटि आई।');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-stone-500 text-sm">
        रिकॉर्ड लोड हो रहा है...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/restricted-persons"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <span>{isEditMode ? 'प्रतिबंधित व्यक्ति रिकॉर्ड संपादन' : 'नया प्रतिबंध दर्ज करें'}</span>
          </h1>
          <p className="text-xs text-stone-500">
            गोपनीय प्रशासनिक सुरक्षा एवं अनुशासन रिकॉर्ड
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. PERSON DETAILS */}
        <Card variant="default" className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-600" />
            <span>1. व्यक्ति का विवरण (Identity Details)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                व्यक्ति का पूरा नाम (Full Name) *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="उदा. रमेश कुमार"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                मोबाइल नंबर (Mobile)
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                गांव / कस्बा (Village)
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="उदा. धामनोद / खलघाट"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                शहर / जिला (City)
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="उदा. धार / इंदौर"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                निवास पता (Address)
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="मकान नंबर, मोहल्ला..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </Card>

        {/* 2. RESTRICTION TERMS */}
        <Card variant="default" className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>2. प्रतिबंध का आधार एवं अवधि (Terms & Duration)</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                प्रतिबंध का मुख्य कारण (Reason) *
              </label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                placeholder="उदा. शांति भंग, अनाधिकृत चंदा वसूली, व्यवस्था में व्यवधान..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                घटना का विस्तृत विवरण (Description)
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="घटनाक्रम, साक्षी एवं प्रशासनिक विवरण..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  प्रतिबंध प्रकार (Restriction Type)
                </label>
                <select
                  name="restrictionType"
                  value={formData.restrictionType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="temporary_restriction">अस्थायी प्रतिबंध (Temporary)</option>
                  <option value="permanent_restriction">स्थायी प्रतिबंध (Permanent)</option>
                  <option value="event_specific">कार्यक्रम-विशिष्ट (Event Specific)</option>
                  <option value="other">अन्य (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  स्थिति (Status)
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="active">सक्रिय (Active)</option>
                  <option value="expired">कालबाधित (Expired)</option>
                  <option value="revoked">निरस्त (Revoked)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  प्रारंभ तिथि (Start Date) *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  समाप्ति तिथि (End Date - यदि अस्थायी हो)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                सुरक्षा टिप्पणी / कार्यकारिणी प्रस्ताव क्रमांक (Notes)
              </label>
              <textarea
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                placeholder="उदा. कार्यकारिणी बैठक प्रस्ताव क्र. 14..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </Card>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/admin/restricted-persons">
            <Button variant="outline" size="md">
              रद्द करें
            </Button>
          </Link>
          <Button variant="danger" size="md" type="submit" isLoading={submitting}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isEditMode ? 'रिकॉर्ड अद्यतित करें' : 'प्रतिबंध दर्ज करें'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RestrictedPersonFormPage;
