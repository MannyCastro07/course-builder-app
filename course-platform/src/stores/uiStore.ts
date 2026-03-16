import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Toast, ModalState } from '@/types';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Toasts
  toasts: Toast[];
  
  // Modal
  modal: ModalState;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string;
  
  // Breadcrumbs
  breadcrumbs: { label: string; href?: string }[];
}

interface UIStore extends UIState {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  
  // Theme actions
  setTheme: (theme: UIState['theme']) => void;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Modal actions
  openModal: (modal: Omit<ModalState, 'isOpen'>) => void;
  closeModal: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Breadcrumb actions
  setBreadcrumbs: (breadcrumbs: { label: string; href?: string }[]) => void;
  addBreadcrumb: (item: { label: string; href?: string }) => void;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: 'system',
  toasts: [],
  modal: { isOpen: false },
  globalLoading: false,
  loadingMessage: '',
  breadcrumbs: [],
};

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Sidebar
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

      // Theme
      setTheme: (theme) => set({ theme }),

      // Toasts
      addToast: (toast) => {
        const id = crypto.randomUUID();
        const newToast = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        
        // Auto-remove toast after duration
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration || 5000);
        }
      },
      
      removeToast: (id) => {
        set((state) => ({ 
          toasts: state.toasts.filter((t) => t.id !== id) 
        }));
      },
      
      clearToasts: () => set({ toasts: [] }),

      // Modal
      openModal: (modal) => set({ 
        modal: { ...modal, isOpen: true } 
      }),
      
      closeModal: () => set({ 
        modal: { isOpen: false } 
      }),

      // Loading
      setGlobalLoading: (loading, message = '') => {
        set({ 
          globalLoading: loading, 
          loadingMessage: message 
        });
      },

      // Breadcrumbs
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      
      addBreadcrumb: (item) => {
        set((state) => ({ 
          breadcrumbs: [...state.breadcrumbs, item] 
        }));
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

// Helper functions for common toasts
export const showSuccessToast = (title: string, message?: string) => {
  useUIStore.getState().addToast({
    type: 'success',
    title,
    message,
    duration: 5000,
  });
};

export const showErrorToast = (title: string, message?: string) => {
  useUIStore.getState().addToast({
    type: 'error',
    title,
    message,
    duration: 8000,
  });
};

export const showWarningToast = (title: string, message?: string) => {
  useUIStore.getState().addToast({
    type: 'warning',
    title,
    message,
    duration: 6000,
  });
};

export const showInfoToast = (title: string, message?: string) => {
  useUIStore.getState().addToast({
    type: 'info',
    title,
    message,
    duration: 5000,
  });
};
