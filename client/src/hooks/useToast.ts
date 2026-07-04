import { toast as hotToast, ToastOptions } from 'react-hot-toast';

export const useToast = () => {
  const toast = (props: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
    if (props.variant === 'destructive') {
      hotToast.error(`${props.title}${props.description ? ` — ${props.description}` : ''}`);
    } else {
      hotToast.success(`${props.title}${props.description ? ` — ${props.description}` : ''}`);
    }
  };

  const success = (message: string, options?: ToastOptions) => hotToast.success(message, options);
  const error = (message: string, options?: ToastOptions) => hotToast.error(message, options);
  const loading = (message: string, options?: ToastOptions) => hotToast.loading(message, options);

  return { toast, success, error, loading };
};
