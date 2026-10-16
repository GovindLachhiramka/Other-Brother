import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-card">
      <div class="empty-icon">{{ icon }}</div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <div class="empty-action">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .empty-state-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 48px 24px;
        background: #ffffff;
        border-radius: var(--radius-lg);
        border: 1px dashed var(--border-color);
      }
      .empty-icon {
        font-size: 3rem;
        margin-bottom: 12px;
      }
      .empty-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-main);
        margin-bottom: 6px;
      }
      .empty-message {
        font-size: 0.9rem;
        color: var(--text-muted);
        max-width: 380px;
        line-height: 1.5;
        margin-bottom: 16px;
      }
      .empty-action {
        display: flex;
        gap: 12px;
      }
    `
  ]
})
export class EmptyStateComponent {
  @Input() icon = '📂';
  @Input() title = 'Nothing here yet';
  @Input() message = 'There are no items to display at the moment.';
}
