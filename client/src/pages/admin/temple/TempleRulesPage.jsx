import React, { useState, useEffect } from 'react';
import {
  getTempleRules,
  createTempleRule,
  updateTempleRule,
  deleteTempleRule,
  reorderTempleRules,
} from '../../../services/templeService';

export const TempleRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await getTempleRules();
      if (res.success && res.data) {
        setRules(res.data.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
      showNotification('error', 'नियम लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3500);
  };

  const handleOpenCreate = () => {
    if (rules.length >= 15) {
      showNotification('error', 'अधिकतम 15 नियम ही बनाए जा सकते हैं।');
      return;
    }
    setEditingRule(null);
    setRuleForm({ title: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setRuleForm({ title: rule.title, description: rule.description || '' });
    setModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingRule) {
        await updateTempleRule(editingRule._id, ruleForm);
        showNotification('success', 'नियम सफलतापूर्वक अद्यतन किया गया!');
      } else {
        const nextOrder = rules.length > 0 ? Math.max(...rules.map((r) => r.order)) + 1 : 1;
        await createTempleRule({ ...ruleForm, order: nextOrder });
        showNotification('success', 'नया नियम सफलतापूर्वक जोड़ा गया!');
      }
      setModalOpen(false);
      await fetchRules();
    } catch (err) {
      console.error('Error saving rule:', err);
      showNotification('error', err.response?.data?.message || 'नियम सहेजने में समस्या आई।');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id, title) => {
    if (!window.confirm(`क्या आप नियम "${title}" को हटाना चाहते हैं?`)) return;
    try {
      await deleteTempleRule(id);
      showNotification('success', 'नियम हटा दिया गया।');
      await fetchRules();
    } catch (err) {
      console.error('Error deleting rule:', err);
      showNotification('error', 'नियम हटाने में त्रुटि हुई।');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const newRules = [...rules];
    const temp = newRules[index];
    newRules[index] = newRules[targetIndex];
    newRules[targetIndex] = temp;

    // Recalculate orders 1..N
    const ruleOrders = newRules.map((r, idx) => ({
      id: r._id,
      order: idx + 1,
    }));

    // Optimistic UI update
    setRules(newRules.map((r, idx) => ({ ...r, order: idx + 1 })));

    try {
      await reorderTempleRules(ruleOrders);
      showNotification('success', 'नियमों का क्रम सफलतापूर्वक बदला गया!');
    } catch (err) {
      console.error('Error reordering rules:', err);
      showNotification('error', 'क्रम बदलने में त्रुटि हुई।');
      await fetchRules(); // revert
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              मंदिर नियमावली प्रबंधन
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {rules.length} / 15 नियम
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            मंदिर परिसर में व्यवस्था व पवित्रता बनाए रखने हेतु अधिकतम 15 नियम (क्रमबद्ध पुनर्व्यवस्थित करें)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={rules.length >= 15}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
        >
          <span>+ नया नियम जोड़ें</span>
        </button>
      </div>

      {/* Notifications */}
      {notification.message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{notification.type === 'success' ? '✅' : '⚠️'}</span> {notification.message}
        </div>
      )}

      {/* Rules List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 text-stone-500 text-sm">
          कोई नियम नहीं मिला। कृपया ऊपर दिए गए बटन से नया नियम जोड़ें।
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, idx) => (
            <div
              key={rule._id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Order Badge */}
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {rule.order}
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    {rule.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                {/* Move Up */}
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-stone-500 hover:text-stone-800 disabled:opacity-20 rounded-lg hover:bg-stone-100"
                  title="ऊपर ले जाएं"
                >
                  ▲
                </button>
                {/* Move Down */}
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === rules.length - 1}
                  className="p-1.5 text-stone-500 hover:text-stone-800 disabled:opacity-20 rounded-lg hover:bg-stone-100"
                  title="नीचे ले जाएं"
                >
                  ▼
                </button>
                {/* Edit */}
                <button
                  onClick={() => handleOpenEdit(rule)}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition"
                >
                  संपादित करें
                </button>
                {/* Delete */}
                <button
                  onClick={() => handleDeleteRule(rule._id, rule.title)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  हटाएं
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {editingRule ? 'नियम संपादित करें' : 'नया नियम जोड़ें'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  नियम शीर्षक *
                </label>
                <input
                  type="text"
                  value={ruleForm.title}
                  onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                  required
                  placeholder="उदा. मोबाइल एवं फोटोग्राफी प्रतिबंध"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  नियम विवरण / निर्देश *
                </label>
                <textarea
                  rows={4}
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  required
                  placeholder="नियम का विस्तृत विवरण लिखें..."
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'सहेज रहे हैं...' : 'सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TempleRulesPage;
