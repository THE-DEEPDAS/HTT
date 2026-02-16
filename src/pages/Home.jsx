import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';
import {
  Zap, Truck, Shield, RotateCcw, ArrowRight, ShoppingCart,
  Cpu, Smartphone, Headphones, Monitor, Star, ChevronRight,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await productService.getAllProducts();
        setFeaturedProducts(data.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹999', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Shield, title: 'Secure Checkout', desc: 'Protected payments', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: RotateCcw, title: 'Easy Returns', desc: 'Hassle-free process', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Zap, title: 'Fast Delivery', desc: 'Express options available', color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const categories = [
    { icon: Smartphone, label: 'Phones' },
    { icon: Monitor, label: 'Monitors' },
    { icon: Headphones, label: 'Audio' },
    { icon: Cpu, label: 'Components' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Zap className="w-3.5 h-3.5" />
              Premium Electronics Store
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
              {isAuthenticated ? (
                <>Welcome back, <span className="text-gradient">{user?.full_name?.split(' ')[0] || user?.username}</span></>
              ) : (
                <>Discover <span className="text-gradient">Next-Gen</span> Electronics</>
              )}
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
              Shop the latest gadgets, components, and accessories with fast shipping and hassle-free returns.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-3">
              <Link to="/products" className="btn-primary text-base !px-8 !py-3 flex items-center gap-2 group">
                Browse Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn-secondary text-base !px-8 !py-3">
                  Create Account
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <motion.div key={title} variants={fadeUp} className="flex items-center gap-3 py-6 px-4">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(({ icon: Icon, label }, i) => (
              <motion.div key={label} variants={fadeUp} custom={i}>
                <Link
                  to="/products"
                  className="card-hover flex flex-col items-center gap-3 py-8 px-4 text-center group"
                >
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <Icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-4 space-y-3">
                  <div className="skeleton h-40 rounded-xl" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <motion.div key={product.id} variants={fadeUp} custom={i}>
                  <div className="card-hover group overflow-hidden">
                    <Link to={`/products/${product.id}`}>
                      <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                        <div className="text-5xl group-hover:scale-110 transition-transform duration-500">📦</div>
                        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                          <span className="absolute top-3 left-3 badge-warning text-[10px]">Low stock</span>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
                          {product.product_name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">(4.8)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">₹{parseFloat(product.display_price || product.base_price).toLocaleString()}</span>
                          {product.is_price_adjusted && (
                            <span className="text-xs text-gray-400 line-through">₹{parseFloat(product.base_price).toLocaleString()}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product, 1);
                          }}
                          disabled={product.stock_quantity === 0}
                          className="w-9 h-9 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-40"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-10 md:p-14 text-center text-white overflow-hidden relative"
            style={{ background: 'linear-gradient(to bottom right, #2563eb, #2563eb, #1d4ed8)' }}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
              <p className="mb-8 max-w-md mx-auto" style={{ color: '#dbeafe' }}>Join thousands of customers who shop premium electronics at VoltStore.</p>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg group" style={{ color: '#1d4ed8' }}>
                Create Free Account 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default Home;
