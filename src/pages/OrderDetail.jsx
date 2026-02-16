import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Package, Calendar, CreditCard, Truck, MapPin, RotateCcw, Repeat, X, AlertCircle } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [selectedItemForReturn, setSelectedItemForReturn] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [pendingReturnItem, setPendingReturnItem] = useState(null);

  useEffect(() => { loadOrder(); }, [id]);

  const loadOrder = async () => {
    try { setLoading(true); const data = await orderService.getOrder(id); setOrder(data); }
    catch (err) { setError('Failed to load order details'); }
    finally { setLoading(false); }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const handleReturnItem = (item) => {
    if (!returnReason.trim()) { alert('Please provide a reason for return'); return; }
    setPendingReturnItem(item);
    setShowExchangeModal(true);
  };

  const proceedToExchange = () => {
    if (!pendingReturnItem) return;
    setShowExchangeModal(false);
    navigate('/exchange', { state: { orderDetailId: pendingReturnItem.id, productId: pendingReturnItem.product.id, orderId: order.id } });
  };

  const proceedToReturn = () => {
    if (!pendingReturnItem) return;
    setShowExchangeModal(false);
    navigate('/return', { state: { orderDetailId: pendingReturnItem.id, productId: pendingReturnItem.product.id, orderId: order.id, returnReason } });
  };

  const calculateItemTotal = (item) => {
    return parseFloat(item.product_price) * item.order_quantity - parseFloat(item.discount_applied);
  };

  const calculateOrderTotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="card p-6 mb-6"><div className="skeleton h-8 w-48 mb-4" /><div className="skeleton h-20 w-full" /></div>
        <div className="card p-6"><div className="skeleton h-8 w-40 mb-4" /><div className="skeleton h-32 w-full" /></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-gray-500 mb-4">{error || 'Order not found'}</p>
        <button onClick={() => navigate('/orders')} className="btn-primary">Back to Orders</button>
      </div>
    );
  }

  return (
    <motion.div className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={() => navigate('/orders')} className="btn-ghost !px-0 text-sm text-gray-500 mb-6 flex items-center gap-2 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Order Info */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-xs text-gray-500">Placed on {formatDate(order.order_date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><CreditCard className="w-3 h-3" /> Payment</div>
            <p className="text-sm font-semibold text-gray-900">{order.payment_method}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Truck className="w-3 h-3" /> Shipping</div>
            <p className="text-sm font-semibold text-gray-900">{order.shipping_method}</p>
          </div>
          {order.shipping_address && (
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><MapPin className="w-3 h-3" /> Address</div>
              <p className="text-sm font-semibold text-gray-900">
                {order.shipping_address.line1}{order.shipping_address.line2 && `, ${order.shipping_address.line2}`}, {order.shipping_address.city}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="card p-6">
        <h2 className="section-title mb-5">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{item.product.product_name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.order_quantity} × ₹{parseFloat(item.product_price).toLocaleString()}</p>
                    {item.discount_applied > 0 && (
                      <p className="text-xs text-emerald-600 mt-0.5">Discount: -₹{parseFloat(item.discount_applied).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">₹{calculateItemTotal(item).toLocaleString()}</p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${
                    item.return_status === 'Returned' ? 'bg-red-50 text-red-600' :
                    item.return_status === 'Return Initiated' ? 'bg-amber-50 text-amber-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {item.return_status || 'Delivered'}
                  </span>
                  {item.is_exchanged && <span className="badge bg-blue-50 text-blue-600 text-xs">Exchanged</span>}
                </div>

                {item.return_status === 'Not Returned' && selectedItemForReturn !== item.id && (
                  <button
                    onClick={() => setSelectedItemForReturn(item.id)}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Return
                  </button>
                )}
              </div>

              {item.return_date && (
                <p className="text-xs text-gray-400 mt-2">Returned on {formatDate(item.return_date)}</p>
              )}
              {item.return_reason && (
                <p className="text-xs text-gray-400">Reason: {item.return_reason}</p>
              )}

              {/* Return Form */}
              <AnimatePresence>
                {selectedItemForReturn === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-100 overflow-hidden"
                  >
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">Reason for Return</label>
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="input-field text-sm"
                      rows="3"
                      placeholder="Please describe why you want to return this item..."
                    />
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleReturnItem(item)} className="btn-danger text-sm !py-2">
                        Submit Return
                      </button>
                      <button onClick={() => { setSelectedItemForReturn(null); setReturnReason(''); }} className="btn-secondary text-sm !py-2">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Order Total</span>
          <span className="text-2xl font-bold text-gray-900">₹{calculateOrderTotal().toLocaleString()}</span>
        </div>
      </div>

      {/* Exchange/Return Modal */}
      <AnimatePresence>
        {showExchangeModal && pendingReturnItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-elevated p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Exchange or Return?</h3>
                <button onClick={() => { setShowExchangeModal(false); setPendingReturnItem(null); }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">Would you like to exchange <strong>{pendingReturnItem.product.product_name}</strong> or get a refund?</p>
              <div className="space-y-2">
                <button onClick={proceedToReturn} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all text-left">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Return for Refund</p>
                    <p className="text-xs text-gray-500">Get your money back</p>
                  </div>
                </button>
                <button onClick={proceedToExchange} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all text-left">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Repeat className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Exchange Item</p>
                    <p className="text-xs text-gray-500">Get a replacement</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderDetail;
