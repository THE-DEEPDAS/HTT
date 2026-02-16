import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Minus, Plus, Package, Truck, Shield, Check } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => { loadProduct(); }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id);
      setProduct(data);
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="skeleton h-96 rounded-3xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-6 w-1/4" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">{error || 'Product not found'}</p>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={() => navigate('/products')}
        className="btn-ghost !px-0 text-sm text-gray-500 mb-6 flex items-center gap-2 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 flex items-center justify-center aspect-square"
        >
          <div className="text-8xl">📦</div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-sm text-gray-400 ml-2">(128 reviews)</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{product.product_name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">₹{parseFloat(product.display_price || product.base_price).toLocaleString()}</span>
            {product.is_price_adjusted && (
              <span className="text-lg text-gray-400 line-through">₹{parseFloat(product.base_price).toLocaleString()}</span>
            )}
          </div>

          <div className="mb-6">
            {product.stock_quantity > 0 ? (
              <span className="badge-success text-sm">
                <Check className="w-3.5 h-3.5 mr-1" />
                In Stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="badge-danger text-sm">Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                added
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                  : 'text-white shadow-sm hover:shadow-lg'
              }`}
              style={added ? {} : { backgroundColor: '#2563eb' }}
            >
              {added ? (
                <><Check className="w-5 h-5" /> Added to Cart</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
              )}
            </button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Truck className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500">Free Shipping</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs text-gray-500">1 Year Warranty</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Package className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500">Easy Returns</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
