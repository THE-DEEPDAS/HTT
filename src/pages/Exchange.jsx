import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, X, Camera, Loader2, CheckCircle, Calendar, Clock, Package, AlertCircle, Repeat } from 'lucide-react';
import { CreditCard } from 'lucide-react';

const Exchange = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { orderDetailId, productId, orderId } = location.state || {};

  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [inferenceResult, setInferenceResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [pickupData, setPickupData] = useState(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [error, setError] = useState('');

  if (!orderDetailId) {
    return (
      <div className="page-container text-center py-20">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">No item selected for exchange</p>
        <button onClick={() => navigate('/orders')} className="btn-primary">View Orders</button>
      </div>
    );
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitImage = async () => {
    if (!image) { setError('Please upload an image of the product'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('order_detail_id', orderDetailId);
      const response = await api.post('/inference/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setInferenceResult(response.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Image analysis failed. Please try again.');
    } finally { setUploading(false); }
  };

  const processExchange = async () => {
    setProcessing(true);
    setError('');
    try {
      const response = await api.post('/exchange/process-pickup/', {
        order_detail_id: orderDetailId,
        inference_status: inferenceResult?.status,
        pickup_date: pickupDate || null,
        pickup_time: pickupTime || null,
      });
      setPickupData(response.data);
      setShowPickupModal(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to process exchange. Please try again.');
    } finally { setProcessing(false); }
  };

  const confirmPickup = () => {
    setShowPickupModal(false);
    setStep(3);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 7);
    return max.toISOString().split('T')[0];
  };

  const steps = [
    { label: 'Upload Image', icon: Camera },
    { label: 'Review', icon: Package },
    { label: 'Confirmed', icon: CheckCircle },
  ];

  return (
    <motion.div className="page-container max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={() => navigate(-1)} className="btn-ghost !px-0 text-sm text-gray-500 mb-6 flex items-center gap-2 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
          <Repeat className="w-5 h-5 text-primary-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Exchange Item</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-medium ${step >= i + 1 ? 'text-gray-700' : 'text-gray-400'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors ${step > i + 1 ? 'bg-emerald-400' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: Image Upload */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">Upload Product Image</h2>
          <p className="text-sm text-gray-500 mb-6">Take a clear photo of the product to verify its condition for exchange.</p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary-300 transition-colors cursor-pointer overflow-hidden aspect-video flex items-center justify-center bg-gray-50"
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }}
                  className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur rounded-lg hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <button onClick={submitImage} disabled={!image || uploading} className="btn-primary w-full mt-6 disabled:opacity-50">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Analyze Product'}
          </button>
        </motion.div>
      )}

      {/* Step 2: Inference Result + Pickup Scheduling */}
      {step === 2 && inferenceResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="card p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Analysis Result</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Product Verified</span>
                <span className="badge text-xs bg-emerald-50 text-emerald-600">✅ Matched</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Condition</span>
                <span className={`badge text-xs font-semibold ${
                  inferenceResult.status === 'resale' ? 'bg-emerald-50 text-emerald-600' :
                  inferenceResult.status === 'refurb' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {inferenceResult.status === 'resale' ? '🟢 Resale' :
                   inferenceResult.status === 'refurb' ? '🟡 Refurbish' :
                   '🔴 Scrap'}
                </span>
              </div>
              <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">
                {inferenceResult.status === 'resale' && 'Product is in excellent condition and eligible for resale.'}
                {inferenceResult.status === 'refurb' && 'Product needs refurbishment but is eligible for exchange.'}
                {inferenceResult.status === 'scrap' && 'Product is too damaged. Exchange will proceed without pickup.'}
              </p>
            </div>
          </div>

          {/* Pickup date/time selection for refurb & resale */}
          {inferenceResult.status !== 'scrap' && (
            <div className="card p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Schedule Pickup</h2>
              <p className="text-sm text-gray-500 mb-4">Select a date and time for us to pick up your item.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" /> Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Within the next 7 days</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" /> Pickup Time
                  </label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    min="09:00"
                    max="21:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Between 9:00 AM – 9:00 PM</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={processExchange}
            disabled={processing || (inferenceResult.status !== 'scrap' && (!pickupDate || !pickupTime))}
            className="btn-primary w-full disabled:opacity-50"
          >
            {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Proceed with Exchange'}
          </button>
        </motion.div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Repeat className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Exchange Confirmed!</h2>
          <p className="text-sm text-gray-500 mb-6">We'll arrange pickup and send you a replacement.</p>

          {pickupData && (
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
              {pickupData.pickup_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Pickup: {pickupData.pickup_date}</span>
                </div>
              )}
            </div>
          )}

          <button onClick={() => navigate('/orders')} className="btn-primary">View Orders</button>
        </motion.div>
      )}

      {/* Pickup Modal */}
      <AnimatePresence>
        {showPickupModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-elevated p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Exchange Scheduled</h3>
                <button onClick={confirmPickup} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {pickupData && (
                <div className="space-y-4 mb-6">
                  <div className="bg-primary-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-primary-700">
                      {pickupData.message || 'Your exchange has been processed successfully.'}
                    </p>
                  </div>
                  {pickupData.pickup_date && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup Date</p>
                        <p className="text-sm font-semibold text-gray-900">{pickupData.pickup_date}</p>
                      </div>
                    </div>
                  )}
                  {pickupData.pickup_time && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Clock className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup Time</p>
                        <p className="text-sm font-semibold text-gray-900">{pickupData.pickup_time}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button onClick={confirmPickup} className="btn-primary w-full">Got it</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Exchange;
