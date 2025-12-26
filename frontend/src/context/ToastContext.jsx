import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random(); // Unique ID for each toast
    const newToast = { id, message, type, duration };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods for different toast types
  const showToast = useCallback((message, duration = 5000) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  const showSuccess = useCallback((message, duration = 5000) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration = 5000) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration = 5000) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        removeToast,
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};