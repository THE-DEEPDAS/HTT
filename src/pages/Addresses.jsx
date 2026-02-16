import React, { useState, useEffect } from 'react';
import { addressService } from '../services/addressService';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit3, Trash2, Star, X, Loader2, CheckCircle, AlertCircle, Save, Home } from 'lucide-react';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    line1: '', line2: '', city: '', state: '', country: 'India', pincode: '', is_default: false,
  });

  useEffect(() => { loadAddresses(); }, []);

  const loadAddresses = async () => {
    try { setLoading(true); const data = await addressService.getAddresses(); setAddresses(Array.isArray(data) ? data : (data.results || [])); }
    catch (err) { setError('Failed to load addresses'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const resetForm = () => {
    setFormData({ line1: '', line2: '', city: '', state: '', country: 'India', pincode: '', is_default: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address) => {
    setFormData({
      line1: address.line1 || '', line2: address.line2 || '', city: address.city || '',
      state: address.state || '', country: address.country || 'India', pincode: address.pincode || '',
      is_default: address.is_default || false,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await addressService.updateAddress(editingId, formData);
        setSuccess('Address updated');
      } else {
        await addressService.createAddress(formData);
        setSuccess('Address added');
      }
      resetForm();
      loadAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save address');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      setSuccess('Address deleted');
      loadAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Failed to delete address'); }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      setSuccess('Default address updated');
      loadAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Failed to set default address'); }
  };

  if (loading) {
    return (
      <div className="page-container max-w-2xl mx-auto">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="card p-6"><div className="skeleton h-20 w-full" /></div>)}
        </div>
      </div>
    );
  }

  return (
    <motion.div className="page-container max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title !mb-0">My Addresses</h1>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Address
          </button>
        )}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm mb-6">
            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900">
                  {editingId ? 'Edit Address' : 'New Address'}
                </h3>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Address Line 1 *</label>
                  <input name="line1" value={formData.line1} onChange={handleChange} className="input-field text-sm" placeholder="Street address, P.O. box" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Address Line 2</label>
                  <input name="line2" value={formData.line2} onChange={handleChange} className="input-field text-sm" placeholder="Apartment, suite, unit (optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">City *</label>
                    <input name="city" value={formData.city} onChange={handleChange} className="input-field text-sm" placeholder="City" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">State *</label>
                    <input name="state" value={formData.state} onChange={handleChange} className="input-field text-sm" placeholder="State" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Country *</label>
                    <input name="country" value={formData.country} onChange={handleChange} className="input-field text-sm" placeholder="Country" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Pincode *</label>
                    <input name="pincode" value={formData.pincode} onChange={handleChange} className="input-field text-sm" placeholder="123456" required />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">Set as default address</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'} Address</>}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="card p-12 text-center">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No addresses yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add a delivery address to get started</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address, index) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card p-5 border-2 transition-colors ${address.is_default ? 'border-primary-200 bg-primary-50/30' : 'border-transparent hover:border-gray-100'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {address.is_default && (
                        <span className="badge bg-primary-50 text-primary-600 text-xs">
                          <Star className="w-3 h-3" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {address.line1}{address.line2 && `, ${address.line2}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{address.country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!address.is_default && (
                    <button onClick={() => handleSetDefault(address.id)} className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-500 transition-colors" title="Set as default">
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleEdit(address)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(address.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Addresses;
