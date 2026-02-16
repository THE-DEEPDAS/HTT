import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Truck, Check, Loader2, Plus, AlertCircle, Percent, Banknote } from 'lucide-react';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const isPrepaid = paymentMethod !== 'COD';
  const [shippingMethod, setShippingMethod] = useState('Standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    if (cartItems.length === 0) { navigate('/cart'); return; }
    loadAddresses();
  }, [authLoading, isAuthenticated, cartItems]);

  const loadAddresses = async () => {
    try {
      const data = await addressService.getAddresses();
      const list = Array.isArray(data) ? data : (data.results || []);
      setAddresses(list);
      const defaultAddr = list.find((a) => a.is_default);
      if (defaultAddr) setSelectedAddress(defaultAddr.id.toString());
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError('Please select a shipping address'); return; }
    setLoading(true);
    setError('');
    try {
      const discountMultiplier = isPrepaid ? 0.95 : 1;
      const order = await orderService.createOrder({
        shipping_address: parseInt(selectedAddress),
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        items: cartItems.map((item) => ({
          product: item.id,
          order_quantity: item.quantity,
          product_price: (parseFloat(item.display_price || item.base_price) * discountMultiplier).toFixed(2),
        })),
      });
      clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const prepaidDiscount = isPrepaid ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const shippingCost = shippingMethod === 'Next-Day' ? 199 : shippingMethod === 'Express' ? 99 : 0;
  const orderTotal = subtotal - prepaidDiscount + shippingCost;

  const paymentOptions = [
    { value: 'Credit Card', label: 'Credit Card', prepaid: true },
    { value: 'Debit Card', label: 'Debit Card', prepaid: true },
    { value: 'PayPal', label: 'PayPal', prepaid: true },
    { value: 'Gift Card', label: 'Gift Card', prepaid: true },
    { value: 'COD', label: 'Cash on Delivery', prepaid: false },
  ];

  const shippingOptions = [
    { value: 'Standard', label: 'Standard', desc: '5-7 business days', price: 'Free' },
    { value: 'Express', label: 'Express', desc: '2-3 business days', price: '₹99' },
    { value: 'Next-Day', label: 'Next-Day', desc: '1 business day', price: '₹199' },
  ];

  return (
    <motion.div className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="page-title mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-600" />
              </div>
              <h2 className="section-title">Shipping Address</h2>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-sm mb-3">No addresses found</p>
                <button onClick={() => navigate('/addresses')} className="btn-primary text-sm inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedAddress === address.id.toString()
                        ? 'border-primary-500 bg-primary-50/50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address.id.toString()}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1 accent-primary-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{address.line1}{address.line2 && `, ${address.line2}`}</p>
                      <p className="text-sm text-gray-500">{address.city}, {address.state}, {address.country} - {address.pincode}</p>
                      {address.is_default && <span className="badge-primary text-[10px] mt-1">Default</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="section-title">Payment Method</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map(({ value, label, prepaid }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                    paymentMethod === value ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary-600" />
                  <span className="font-medium text-gray-700 flex-1">{label}</span>
                  {prepaid && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">5% OFF</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="section-title">Shipping Method</h2>
            </div>
            <div className="space-y-2">
              {shippingOptions.map(({ value, label, desc, price }) => (
                <label
                  key={value}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === value ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" value={value} checked={shippingMethod === value} onChange={(e) => setShippingMethod(e.target.value)} className="accent-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${price === 'Free' ? 'text-emerald-600' : 'text-gray-700'}`}>{price}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="section-title mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">{item.product_name} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="font-medium text-gray-900 flex-shrink-0">₹{(parseFloat(item.display_price || item.base_price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              {isPrepaid && prepaidDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> Prepaid Discount (5%)</span>
                  <span className="font-semibold">−₹{prepaidDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-medium ${shippingCost === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₹{orderTotal.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
              className="w-full mt-6 btn-primary flex items-center justify-center gap-2 !py-3 text-base disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
              ) : (
                <><Check className="w-4 h-4" /> Place Order</>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
