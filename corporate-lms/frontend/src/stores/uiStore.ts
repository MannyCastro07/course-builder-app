import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Toasts
  toasts: Toast[];
  
  // Modals
  activeModal: string | null;
  modalData: any;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Toast actions
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  
  // Modal actions
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  theme: 'system',
  toasts: [],
  activeModal: null,
  modalData: null,

  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setTheme: (theme) => set({ theme }),

  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(7);
    const toast = { id, type, message };
    set(state => ({ toasts: [...state.toasts, toast] }));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  openModal: (modalName, data) => set({ activeModal: modalName, modalData: data }),
  
  closeModal: () => set({ activeModal: null, modalData: null }),
}));
