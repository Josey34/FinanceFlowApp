import { triggerToast } from '@/components/ToastContainer';

export function showError(message: string) {
  triggerToast({ type: 'error', message });
}

export function showSuccess(message: string) {
  triggerToast({ type: 'success', message });
}

export function showInfo(message: string) {
  triggerToast({ type: 'info', message });
}
