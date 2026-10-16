import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" role="region" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item toast-{{ toast.type }}" role="alert">
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            } @else if (toast.type === 'error') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            } @else if (toast.type === 'warning') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            }
          </div>
          <div class="toast-content">
            @if (toast.title) {
              <div class="toast-title">{{ toast.title }}</div>
            }
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Close notification">
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 420px;
        width: calc(100vw - 48px);
        pointer-events: none;
      }
      .toast-item {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        border-radius: var(--radius-md);
        background: #ffffff;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border-color);
        animation: slideIn 0.25s ease-out;
      }
      @keyframes slideIn {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .toast-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }
      .toast-content {
        flex: 1;
      }
      .toast-title {
        font-weight: 700;
        font-size: 0.9rem;
        margin-bottom: 2px;
      }
      .toast-message {
        font-size: 0.85rem;
        color: var(--text-main);
        line-height: 1.4;
      }
      .toast-close {
        color: var(--text-muted);
        font-size: 1.25rem;
        line-height: 1;
        padding: 0 4px;
      }
      .toast-close:hover {
        color: var(--text-main);
      }
      .toast-success {
        border-left: 5px solid var(--color-success);
      }
      .toast-success .toast-icon {
        color: var(--color-success);
      }
      .toast-error {
        border-left: 5px solid var(--color-danger);
      }
      .toast-error .toast-icon {
        color: var(--color-danger);
      }
      .toast-warning {
        border-left: 5px solid var(--color-warning);
      }
      .toast-warning .toast-icon {
        color: var(--color-warning);
      }
      .toast-info {
        border-left: 5px solid var(--primary-teal);
      }
      .toast-info .toast-icon {
        color: var(--primary-teal);
      }
    `
  ]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
