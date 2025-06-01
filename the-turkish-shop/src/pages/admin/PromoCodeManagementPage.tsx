import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2, Edit2, Calendar, Percent, PoundSterling } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  getAllPromoCodes, 
  createPromoCode, 
  updatePromoCode, 
  deletePromoCode 
} from '../../firebase/promoCodeService';
import { PromoCode } from '../../firebase/types';
import { Timestamp } from 'firebase/firestore';

const PromoCodeManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const codes = await getAllPromoCodes();
      setPromoCodes(codes);
    } catch (error) {
      console.error('Error loading promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const promoData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        minPurchase: formData.minPurchase || undefined,
        maxDiscount: formData.type === 'percentage' ? (formData.maxDiscount || undefined) : undefined,
        usageLimit: formData.usageLimit || undefined,
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        active: formData.active,
        createdBy: 'admin'
      };

      await createPromoCode(promoData);
      setShowCreateModal(false);
      resetForm();
      loadPromoCodes();
    } catch (error) {
      console.error('Error creating promo code:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingPromo) return;

    try {
      await updatePromoCode(editingPromo.id!, {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        minPurchase: formData.minPurchase || undefined,
        maxDiscount: formData.type === 'percentage' ? (formData.maxDiscount || undefined) : undefined,
        usageLimit: formData.usageLimit || undefined,
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        active: formData.active
      });

      setEditingPromo(null);
      resetForm();
      loadPromoCodes();
    } catch (error) {
      console.error('Error updating promo code:', error);
    }
  };

  const handleDelete = async (promoId: string) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;

    try {
      await deletePromoCode(promoId);
      loadPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
    }
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    const validFrom = promo.validFrom instanceof Timestamp ? promo.validFrom.toDate() : promo.validFrom;
    const validTo = promo.validTo instanceof Timestamp ? promo.validTo.toDate() : promo.validTo;
    
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minPurchase: promo.minPurchase || 0,
      maxDiscount: promo.maxDiscount || 0,
      usageLimit: promo.usageLimit || 0,
      validFrom: validFrom.toISOString().split('T')[0],
      validTo: validTo.toISOString().split('T')[0],
      active: promo.active
    });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minPurchase: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true
    });
  };

  const formatDate = (date: Date | Timestamp) => {
    const d = date instanceof Timestamp ? date.toDate() : date;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Tag className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Promo Code Management
            </h1>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Promo Code
          </motion.button>
        </div>

        {/* Promo Codes Table */}
        <div className={`rounded-xl shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <table className="w-full">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Code
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Value
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Usage
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Valid Period
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {promoCodes.map((promo) => (
                <tr key={promo.id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                  <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {promo.code}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-1">
                      {promo.type === 'percentage' ? (
                        <Percent className="w-4 h-4" />
                      ) : (
                        <PoundSterling className="w-4 h-4" />
                      )}
                      {promo.type}
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {promo.type === 'percentage' ? `${promo.value}%` : `£${promo.value}`}
                    {promo.maxDiscount && ` (max £${promo.maxDiscount})`}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {promo.usageCount} / {promo.usageLimit || '∞'}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="text-sm">
                      <p>{formatDate(promo.validFrom)}</p>
                      <p className="text-xs">to {formatDate(promo.validTo)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      promo.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {promo.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(promo)}
                        className={`p-2 rounded hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-600' : ''}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id!)}
                        className="p-2 rounded hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingPromo) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full p-6 rounded-xl shadow-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Value {formData.type === 'percentage' ? '(%)' : '(£)'}
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>

                {formData.type === 'percentage' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Max Discount (£)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Minimum Purchase (£)
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Usage Limit (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Valid To
                    </label>
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="active" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Active
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPromo(null);
                    resetForm();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={editingPromo ? handleUpdate : handleCreate}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingPromo ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCodeManagementPage; 