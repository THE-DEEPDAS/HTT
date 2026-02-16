import api from './api';

// Helper: DRF pagination returns { count, next, previous, results }
const extractResults = (data) => Array.isArray(data) ? data : (data.results || []);

export const productService = {
  // Get all products (handles paginated response)
  getAllProducts: async (params = {}) => {
    // If no page_size specified, fetch a large batch to avoid multiple round-trips
    const response = await api.get('/products/', { params: { page_size: 100, ...params } });
    return extractResults(response.data);
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },

  // Search products
  searchProducts: async (query) => {
    const response = await api.get('/products/search/', {
      params: { q: query }
    });
    return extractResults(response.data);
  },

  // Filter products by price range
  filterByPrice: async (minPrice, maxPrice) => {
    const response = await api.get('/products/', {
      params: { min_price: minPrice, max_price: maxPrice, page_size: 100 }
    });
    return extractResults(response.data);
  },
};
