import api from './api';

// Helper: DRF pagination returns { count, next, previous, results }
const extractResults = (data) => Array.isArray(data) ? data : (data.results || []);

export const orderService = {
  // Get all orders for current user (fetches all pages)
  getUserOrders: async () => {
    let allOrders = [];
    let url = '/orders/';
    while (url) {
      const response = await api.get(url);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      allOrders = allOrders.concat(data.results || []);
      // next is a full URL; extract path relative to baseURL
      if (data.next) {
        try {
          const nextUrl = new URL(data.next);
          url = nextUrl.pathname.replace(/^\/api/, '') + nextUrl.search;
        } catch {
          url = null;
        }
      } else {
        url = null;
      }
    }
    return allOrders;
  },

  // Get single order details
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders/', orderData);
    return response.data;
  },

  // Get order items
  getOrderItems: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/items/`);
    return response.data;
  },

  // Return an item
  returnItem: async (orderDetailId, returnData) => {
    const response = await api.post(`/order-details/${orderDetailId}/return/`, returnData);
    return response.data;
  },

  // Exchange an item
  exchangeItem: async (orderDetailId) => {
  const response = await api.post(`/order-details/${orderDetailId}/exchange/`);
  return response.data;
}
};
