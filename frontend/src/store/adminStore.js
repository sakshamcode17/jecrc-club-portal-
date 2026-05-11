import { create } from 'zustand';

const useAdminStore = create((set) => ({
  admin: null,
  adminToken: null,
  isAdminAuthenticated: false,
  adminLogin: (admin, token) => set({ admin, adminToken: token, isAdminAuthenticated: true }),
  adminLogout: () => set({ admin: null, adminToken: null, isAdminAuthenticated: false }),
}));

export default useAdminStore;
