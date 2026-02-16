import api from './api';

export const addressService = {
  // Get all addresses for current user
  getAddresses: async () => {
    const response = await api.get('/addresses/');
    return response.data;
  },

  // Get single address
  getAddress: async (id) => {
    const response = await api.get(`/addresses/${id}/`);
    return response.data;
  },

  // Create new address
  createAddress: async (addressData) => {
    const response = await api.post('/addresses/', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (id, addressData) => {
    const response = await api.patch(`/addresses/${id}/`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (id) => {
    const response = await api.delete(`/addresses/${id}/`);
    return response.data;
  },

  // Set default address
  setDefaultAddress: async (id) => {
    const response = await api.post(`/addresses/${id}/set-default/`);
    return response.data;
  },
};