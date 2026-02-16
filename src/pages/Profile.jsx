import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Users, Edit3, Save, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '', user_age: '', user_gender: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        user_age: user.user_age || '',
        user_gender: user.user_gender || '',
      });
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updated = await authService.updateProfile(formData);
      if (setUser) setUser(updated);
      setEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setFormData({ full_name: user.full_name || '', user_age: user.user_age || '', user_gender: user.user_gender || '' });
    }
  };

  const getInitials = () => {
    const name = user?.full_name || user?.username || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div className="page-container max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="page-title">My Profile</h1>

      {/* Avatar Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: 'linear-gradient(to bottom right, #60a5fa, #2563eb)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)' }}>
            {getInitials()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{user?.full_name || user?.username}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm mb-6">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </motion.div>
      )}

      {/* Profile Details */}
      <div className="card p-6">
        <h3 className="section-title mb-5">Personal Information</h3>

        <div className="space-y-4">
          {/* Email - non-editable */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
            </div>
          </div>

          {/* Full Name */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Full Name</p>
              {editing ? (
                <input name="full_name" value={formData.full_name} onChange={handleChange} className="input-field mt-1 text-sm" placeholder="Your full name" />
              ) : (
                <p className="text-sm font-semibold text-gray-900">{user?.full_name || '—'}</p>
              )}
            </div>
          </div>

          {/* Age */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Age</p>
              {editing ? (
                <input type="number" name="user_age" value={formData.user_age} onChange={handleChange} className="input-field mt-1 text-sm" placeholder="25" min="13" max="120" />
              ) : (
                <p className="text-sm font-semibold text-gray-900">{user?.user_age || '—'}</p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Gender</p>
              {editing ? (
                <select name="user_gender" value={formData.user_gender} onChange={handleChange} className="input-field mt-1 text-sm appearance-none">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-sm font-semibold text-gray-900">{user?.user_gender || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {editing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
            <button onClick={handleCancel} className="btn-secondary">
              <X className="w-4 h-4" /> Cancel
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
