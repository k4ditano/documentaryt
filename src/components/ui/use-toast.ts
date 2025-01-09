interface ToastOptions {
  variant?: 'default' | 'destructive';
  title?: string;
  description?: string;
}

interface Toast {
  (options: ToastOptions): void;
}

interface UseToast {
  toast: Toast;
}

export const useToast = (): UseToast => {
  const toast: Toast = (options) => {
    // Aquí puedes implementar la lógica de notificación que prefieras
    console.log('Toast:', options);
  };

  return { toast };
}; 