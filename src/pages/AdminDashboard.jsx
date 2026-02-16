import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, ShoppingBag, RotateCcw, ArrowRightLeft, DollarSign,
  TrendingUp, MessageSquare, LogOut, Shield, ChevronRight,
  Package, AlertTriangle, Users, Clock, Bot, X
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';

const StatCard = ({ icon: Icon, label, value, sub, color, bgColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-200/60 p-6"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      {sub && <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-400">{sub}</span>}
    </div>
    <p className="text-[28px] font-extrabold text-gray-900 tracking-tight">{value}</p>
    <p className="text-[13px] text-gray-500 mt-1.5 tracking-wide">{label}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setChatLoading(true);
      const [analyticsData, chatsData] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getChats(),
      ]);
      setAnalytics(analyticsData);
      setChats(chatsData.sessions || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        authService.adminLogout();
        navigate('/admin/login');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setChatLoading(false);
    }
  };

  const handleLogout = () => {
    authService.adminLogout();
    navigate('/admin/login');
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-[11px] text-gray-400 tracking-wide">VoltStore Management Console</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-[13px] text-gray-500 hover:text-gray-700 font-medium px-3.5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Store →
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[13px] text-red-500 hover:text-red-600 font-medium px-3.5 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100/80 rounded-xl p-1 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'chats', label: 'Voice Sessions', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold tracking-wide transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === 'overview' && analytics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={ShoppingBag}
                label="Orders (Last 30 Days)"
                value={analytics.orders_last_30_days}
                sub="30d"
                color="#2563eb"
                bgColor="#eff6ff"
              />
              <StatCard
                icon={DollarSign}
                label="Revenue (Last 30 Days)"
                value={formatCurrency(analytics.revenue_last_30_days)}
                sub="30d"
                color="#16a34a"
                bgColor="#f0fdf4"
              />
              <StatCard
                icon={RotateCcw}
                label="Total Returns"
                value={analytics.total_returns}
                sub={`${analytics.return_rate_percent}%`}
                color="#dc2626"
                bgColor="#fef2f2"
              />
              <StatCard
                icon={ArrowRightLeft}
                label="Total Exchanges"
                value={analytics.total_exchanges}
                sub={`${analytics.exchange_rate_percent}%`}
                color="#7c3aed"
                bgColor="#faf5ff"
              />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Top Returned Products */}
              <div className="bg-white rounded-2xl border border-gray-200/60 p-5 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h3 className="text-[13px] font-semibold text-gray-900 tracking-tight">Top Returned Products</h3>
                </div>
                {analytics.top_returned_products?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.top_returned_products.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                          {i + 1}
                        </span>
                        <span className="text-[13px] text-gray-700 truncate min-w-0 flex-1">{p.product__product_name}</span>
                        <span className="text-[13px] font-semibold text-gray-900 flex-shrink-0 ml-2">{p.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400">No return data</p>
                )}
              </div>

              {/* Top Exchanged Products */}
              <div className="bg-white rounded-2xl border border-gray-200/60 p-5 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowRightLeft className="w-4 h-4 text-purple-500" />
                  <h3 className="text-[13px] font-semibold text-gray-900 tracking-tight">Top Exchanged Products</h3>
                </div>
                {analytics.top_exchanged_products?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.top_exchanged_products.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#faf5ff', color: '#7c3aed' }}>
                          {i + 1}
                        </span>
                        <span className="text-[13px] text-gray-700 truncate min-w-0 flex-1">{p.product__product_name}</span>
                        <span className="text-[13px] font-semibold text-gray-900 flex-shrink-0 ml-2">{p.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400">No exchange data</p>
                )}
              </div>

              {/* Top Return Reasons */}
              <div className="bg-white rounded-2xl border border-gray-200/60 p-5 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <h3 className="text-[13px] font-semibold text-gray-900 tracking-tight">Top Return Reasons</h3>
                </div>
                {analytics.top_return_reasons?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.top_return_reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                          {i + 1}
                        </span>
                        <span className="text-[13px] text-gray-700 truncate min-w-0 flex-1">{r.return_reason || 'Not specified'}</span>
                        <span className="text-[13px] font-semibold text-gray-900 flex-shrink-0 ml-2">{r.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400">No return reasons</p>
                )}
              </div>
            </div>

            {/* Yearly summary */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-200/60 p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" style={{ color: '#2563eb' }} />
                <h3 className="text-[13px] font-semibold text-gray-900 tracking-tight">Yearly Summary</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Orders This Year</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1.5 tracking-tight">{analytics.orders_last_year}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Return Rate</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1.5 tracking-tight">{analytics.return_rate_percent}%</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Exchange Rate</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1.5 tracking-tight">{analytics.exchange_rate_percent}%</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Voice Sessions</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1.5 tracking-tight">{chats.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========== CHATS TAB ========== */}
        {activeTab === 'chats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Session List */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/60 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-[13px] font-semibold text-gray-900 tracking-tight">Voice Sessions <span className="text-gray-400 font-normal">({chats.length})</span></h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-50">
                  {chats.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-[13px] text-gray-400">No voice sessions yet</p>
                    </div>
                  ) : (
                    chats.map((session) => (
                      <button
                        key={session.session_id}
                        onClick={() => setSelectedChat(session)}
                        className={`w-full text-left px-5 py-3.5 hover:bg-gray-50 transition-colors ${
                          selectedChat?.session_id === session.session_id ? 'bg-blue-50/60 border-r-2' : ''
                        }`}
                        style={selectedChat?.session_id === session.session_id ? { borderRightColor: '#2563eb' } : {}}
                      >
                        <div className="flex items-center justify-between mb-1 min-w-0">
                          <span className="text-[11px] font-mono text-gray-400 truncate mr-2">{session.session_id?.slice(0, 8)}...</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wide ${
                            session.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : session.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {session.status || 'unknown'}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-700 truncate">
                          {session.last_message_preview || 'No messages'}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {session.message_count} msgs
                          </span>
                          {session.request_type && (
                            <span className="text-[11px] text-gray-400 truncate">{session.request_type}</span>
                          )}
                          <span className="text-[11px] text-gray-300 ml-auto flex-shrink-0">
                            {session.started_at ? new Date(session.started_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Detail */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/60 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {selectedChat ? (
                  <>
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between min-w-0">
                      <div className="min-w-0 flex-1 mr-3">
                        <h3 className="text-[13px] font-semibold text-gray-900 tracking-tight truncate">
                          Session: <span className="font-mono">{selectedChat.session_id?.slice(0, 16)}</span>
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {selectedChat.request_type && `Type: ${selectedChat.request_type} · `}
                          {selectedChat.message_count} messages · Status: {selectedChat.status}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="max-h-[550px] overflow-y-auto px-5 py-4 space-y-3">
                      {selectedChat.messages?.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          {msg.user_text && (
                            <div className="flex justify-end mb-2">
                              <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-md text-[13px] break-words" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                                <p className="text-[10px] font-semibold mb-1 opacity-60">User · Turn {msg.turn_number}</p>
                                {msg.user_text}
                              </div>
                            </div>
                          )}
                          {msg.bot_text && (
                            <div className="flex justify-start mb-2">
                              <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-gray-100 text-gray-800 text-[13px] break-words">
                                <p className="text-[10px] font-semibold mb-1 opacity-40">Bot · Step: {msg.step}</p>
                                {msg.bot_text}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[500px] text-center">
                    <div>
                      <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-[13px] text-gray-400">Select a session to view messages</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
