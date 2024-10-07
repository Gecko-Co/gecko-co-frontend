// src/utils/toast.js
import { toast } from 'react-hot-toast';

const customToast = {
  success: (message) => {
    toast.success(message, {
      style: {
        background: '#23283b',
        color: '#fff',
        zIndex: 9999999,
      },
      iconTheme: {
        primary: '#bd692d',
        secondary: '#fff',
      },
    });
  },
  error: (message) => {
    toast.error(message, {
      style: {
        background: '#23283b',
        color: '#fff',
        zIndex: 9999999,
      },
      iconTheme: {
        primary: '#bd692d',
        secondary: '#fff',
      },
    });
  },
  info: (message) => {
    toast(message, {
      style: {
        background: '#23283b',
        color: '#fff',
        zIndex: 9999999,
      },
      iconTheme: {
        primary: '#bd692d',
        secondary: '#fff',
      },
    });
  },
  warning: (message) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#23283b',
        color: '#fff',
        zIndex: 9999999,
      },
      iconTheme: {
        primary: '#bd692d',
        secondary: '#fff',
      },
    });
  },
  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: {
          background: '#23283b',
          color: '#fff',
          zIndex: 9999999,
        },
        iconTheme: {
          primary: '#bd692d',
          secondary: '#fff',
        },
      }
    );
  },
  dismiss: () => {
    toast.dismiss();
  },
};

export default customToast;