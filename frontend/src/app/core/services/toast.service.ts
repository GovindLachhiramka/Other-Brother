import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    };

    this.toastsSignal.update((current) => [...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newToast.duration);
    }
  }

  success(message: string, title = 'Success') {
    this.show({ type: 'success', message, title });
  }

  error(message: string, title = 'Error') {
    this.show({ type: 'error', message, title, duration: 7000 });
  }

  warning(message: string, title = 'Attention') {
    this.show({ type: 'warning', message, title });
  }

  info(message: string, title = 'Notice') {
    this.show({ type: 'info', message, title });
  }

  dismiss(id: string) {
    this.toastsSignal.update((current) => current.filter((t) => t.id !== id));
  }
}
