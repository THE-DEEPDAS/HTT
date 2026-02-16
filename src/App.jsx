import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import VoiceAssistantWidget from './components/VoiceAssistantWidget';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Exchange from './pages/Exchange';
import Return from './pages/Return';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import VoiceAssistant from './pages/VoiceAssistant';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const StoreLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)' }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-lg font-bold text-gray-900">VoltStore</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">Premium electronics at your fingertips. Quality products, fast delivery.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/products" className="hover:text-primary-600 transition-colors">All Products</a></li>
              <li><a href="/cart" className="hover:text-primary-600 transition-colors">Cart</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/profile" className="hover:text-primary-600 transition-colors">Profile</a></li>
              <li><a href="/orders" className="hover:text-primary-600 transition-colors">Orders</a></li>
              <li><a href="/addresses" className="hover:text-primary-600 transition-colors">Addresses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="hover:text-primary-600 transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-primary-600 transition-colors cursor-pointer">Returns</span></li>
              <li><span className="hover:text-primary-600 transition-colors cursor-pointer">Contact Us</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} VoltStore. All rights reserved.
        </div>
      </div>
    </footer>
    <VoiceAssistantWidget />
  </>
);

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <StoreLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/exchange" element={<ProtectedRoute><Exchange /></ProtectedRoute>} />
          <Route path="/return" element={<ProtectedRoute><Return /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          <Route path="/voice-assistant" element={<VoiceAssistant />} />
        </Routes>
      </StoreLayout>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
