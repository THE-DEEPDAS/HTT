import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Star, SlidersHorizontal, X } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.05 } }),
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) { loadProducts(); return; }
    try {
      setLoading(true);
      const data = await productService.searchProducts(searchQuery);
      setProducts(data);
    } catch (err) {
      setError('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="page-title mb-2">Products</h1>
        <p className="text-gray-500 text-sm">Browse our collection of premium electronics</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="input-field !pl-11 !pr-24"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); loadProducts(); }}
              className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="skeleton h-44 rounded-xl" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {products.map((product, i) => (
            <motion.div key={product.id} variants={fadeUp} custom={i}>
              <div className="card-hover group overflow-hidden">
                <Link to={`/products/${product.id}`}>
                  <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-500">📦</div>
                    {product.stock_quantity === 0 && (
                      <span className="absolute top-3 left-3 badge-danger text-[10px]">Out of stock</span>
                    )}
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
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-40 ${
                        addedId === product.id
                          ? 'bg-emerald-500 text-white scale-110'
                          : ''
                      }`}
                      style={addedId === product.id ? {} : { backgroundColor: '#eff6ff', color: '#2563eb' }}
                    >
                      {addedId === product.id ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs">✓</motion.span>
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 mb-2">No products found</p>
          <button onClick={() => { setSearchQuery(''); loadProducts(); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
