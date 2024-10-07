import toast from 'react-hot-toast';

const customToast = {
  success: (message) => {
    toast.success(message, {
      position: "top-right",
      duration: 3000,
    });
  },
  error: (message) => {
    toast.error(message, {
      position: "top-right",
      duration: 3000,
    });
  },
  warning: (message) => {
    toast(message, {
      icon: '⚠️',
      position: "top-right",
      duration: 3000,
    });
  },
  info: (message) => {
    toast(message, {
      icon: 'ℹ️',
      position: "top-right",
      duration: 3000,
    });
  },
};

export default customToast;