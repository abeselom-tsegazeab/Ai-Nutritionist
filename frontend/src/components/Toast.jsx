import { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 border border-green-400 text-white';
      case 'error':
        return 'bg-red-500/90 border border-red-400 text-white';
      case 'warning':
        return 'bg-yellow-500/90 border border-yellow-400 text-white';
      case 'info':
      default:
        return 'bg-blue-500/90 border border-blue-400 text-white';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`relative ${getToastStyle()} backdrop-blur-sm rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out animate-fade-in-up`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white/80 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;