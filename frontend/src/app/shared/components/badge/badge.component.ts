import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge badge-{{ variant }} size-{{ size }}">
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
        border-radius: var(--radius-pill);
        line-height: 1;
        letter-spacing: 0.02em;
      }
      .size-sm {
        font-size: 0.75rem;
        padding: 4px 10px;
      }
      .size-md {
        font-size: 0.85rem;
        padding: 6px 12px;
      }
      .badge-success {
        background: var(--color-success-bg);
        color: var(--color-success-text);
      }
      .badge-warning {
        background: var(--color-warning-bg);
        color: var(--color-warning-text);
      }
      .badge-danger {
        background: var(--color-danger-bg);
        color: var(--color-danger-text);
      }
      .badge-info {
        background: var(--color-info-bg);
        color: var(--color-info-text);
      }
      .badge-teal {
        background: var(--primary-teal-surface);
        color: var(--primary-teal);
        border: 1px solid var(--primary-teal-border);
      }
      .badge-neutral {
        background: #f1f5f9;
        color: var(--text-muted);
      }
      .badge-rose {
        background: #fdf2f8;
        color: #db2777;
        border: 1px solid #fbcfe8;
      }
    `
  ]
})
export class BadgeComponent {
  @Input() variant: 'success' | 'warning' | 'danger' | 'info' | 'teal' | 'neutral' | 'rose' = 'neutral';
  @Input() size: 'sm' | 'md' = 'sm';
}
