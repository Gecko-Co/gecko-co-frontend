import toast from 'react-hot-toast';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const showToast = (type, message) => {
  const options = {
    duration: 3000,
  };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast(message, { ...options, icon: '⚠️' });
      break;
    case 'info':
      toast(message, { ...options, icon: '🔔' });
      break;
    default:
      toast(message, options);
  }
};

const debouncedShowToast = debounce(showToast, 300);

const customToast = {
  success: (message) => debouncedShowToast('success', message),
  error: (message) => debouncedShowToast('error', message),
  warning: (message) => debouncedShowToast('warning', message),
  info: (message) => debouncedShowToast('info', message),
};

export default customToast;