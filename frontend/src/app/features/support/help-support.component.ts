import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AppI18nService } from '../../core/i18n/i18n.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SupportCategory, SupportTicket } from '../../core/models/api.models';

@Component({
  selector: 'app-help-support',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslocoPipe,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="support-page animate-fade-in">
      <!-- Page Header -->
      <div class="support-header-card">
        <div class="header-left">
          <div class="support-badge">{{ 'nav.help' | transloco }}</div>
          <h1 class="support-title">{{ 'support.title' | transloco }}</h1>
          <p class="support-desc">{{ 'support.subtitle' | transloco }}</p>
        </div>
        <div class="header-icon-box">
          <span class="support-big-icon">❓</span>
        </div>
      </div>

      <!-- Main Layout: Form & My Requests -->
      <div class="support-grid">
        <!-- Left: Create Ticket Form -->
        <div class="support-card form-card">
          <h2 class="card-heading">{{ 'support.form_title' | transloco }}</h2>
          <p class="card-sub">{{ 'support.subtitle' | transloco }}</p>

          <form (ngSubmit)="submitTicket()" class="support-form">
            <!-- Category Dropdown -->
            <div class="form-group">
              <label for="category" class="field-label">{{ 'support.category_label' | transloco }}</label>
              <select
                id="category"
                name="category"
                [(ngModel)]="category"
                required
                class="form-control select-control"
              >
                <option value="" disabled>{{ 'support.category_select' | transloco }}</option>
                <option value="claim">{{ 'support.cat_claim' | transloco }}</option>
                <option value="pool">{{ 'support.cat_pool' | transloco }}</option>
                <option value="nearby">{{ 'support.cat_nearby' | transloco }}</option>
                <option value="account">{{ 'support.cat_account' | transloco }}</option>
                <option value="other">{{ 'support.cat_other' | transloco }}</option>
              </select>
            </div>

            <!-- Message Textarea -->
            <div class="form-group">
              <div class="label-row">
                <label for="message" class="field-label">{{ 'support.message_label' | transloco }}</label>
                <span class="char-count" [class.char-valid]="message.length >= 5 && message.length <= 1000">
                  {{ message.length }}/1000
                </span>
              </div>
              <textarea
                id="message"
                name="message"
                rows="5"
                [(ngModel)]="message"
                [placeholder]="'support.message_placeholder' | transloco"
                maxlength="1000"
                required
                class="form-control textarea-control"
              ></textarea>
              <span class="field-hint">{{ 'support.message_min_hint' | transloco }}</span>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn-send-support"
              [disabled]="!isFormValid() || isSubmitting()"
            >
              @if (isSubmitting()) {
                <span class="spinner"></span>
                <span>{{ 'support.sending' | transloco }}</span>
              } @else {
                <span>{{ 'support.send_btn' | transloco }} →</span>
              }
            </button>
          </form>
        </div>

        <!-- Right: My Help Requests List -->
        <div class="support-card requests-card">
          <div class="requests-card-header">
            <div>
              <h2 class="card-heading">{{ 'support.my_requests_title' | transloco }}</h2>
              <p class="card-sub">Refreshes every 10 seconds</p>
            </div>
            <button type="button" class="btn-refresh-icon" (click)="loadTickets()" title="Refresh">
              ↻
            </button>
          </div>

          @if (isLoading() && tickets().length === 0) {
            <div class="skeleton-list">
              <app-skeleton height="90px"></app-skeleton>
              <app-skeleton height="90px"></app-skeleton>
              <app-skeleton height="90px"></app-skeleton>
            </div>
          } @else if (errorLoading() && tickets().length === 0) {
            <div class="error-state-box">
              <span class="err-icon">⚠️</span>
              <p>Failed to load help requests.</p>
              <button type="button" class="btn-retry" (click)="loadTickets()">{{ 'common.retry' | transloco }}</button>
            </div>
          } @else if (tickets().length === 0) {
            <app-empty-state
              icon="💬"
              [title]="'support.no_requests' | transloco"
              [message]="'support.no_requests_sub' | transloco"
            ></app-empty-state>
          } @else {
            <div class="tickets-list">
              @for (ticket of tickets(); track ticket.id) {
                <div class="ticket-item-card" [class.ticket-resolved]="ticket.status === 'resolved'">
                  <div class="ticket-header-row">
                    <span class="ticket-category-tag">
                      {{ getCategoryLabel(ticket.category) | transloco }}
                    </span>
                    <app-badge [variant]="ticket.status === 'resolved' ? 'success' : 'warning'">
                      {{ ticket.status === 'resolved' ? ('support.status_replied' | transloco) : ('support.status_waiting_reply' | transloco) }}
                    </app-badge>
                  </div>

                  <p class="ticket-msg">{{ ticket.message }}</p>

                  <div class="ticket-meta-row">
                    <span class="ticket-date">{{ formatDate(ticket.created_at) }}</span>
                    <span class="ticket-id font-mono">#{{ ticket.id.slice(-6) }}</span>
                  </div>

                  <!-- Manager / Support Team Reply -->
                  @if (ticket.reply) {
                    <div class="support-reply-bubble animate-fade-in">
                      <div class="reply-header">
                        <span class="reply-badge">🏢 {{ 'support.company_reply_title' | transloco }}</span>
                        @if (ticket.replied_at) {
                          <span class="reply-time">{{ formatDate(ticket.replied_at) }}</span>
                        }
                      </div>
                      <p class="reply-text">{{ ticket.reply }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .support-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .support-header-card {
        background: linear-gradient(135deg, #0f766e 0%, #042f2e 100%);
        color: #ffffff;
        border-radius: var(--radius-xl);
        padding: 32px 36px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        box-shadow: var(--shadow-sm);
      }
      .support-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: rgba(20, 184, 166, 0.3);
        border: 1px solid #14b8a6;
        color: #ccfbf1;
        padding: 4px 12px;
        border-radius: var(--radius-pill);
        margin-bottom: 8px;
      }
      .support-title {
        font-size: 1.85rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin-bottom: 6px;
      }
      .support-desc {
        font-size: 0.95rem;
        color: #ccfbf1;
        max-width: 600px;
        line-height: 1.5;
      }
      .header-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 68px;
        height: 68px;
        border-radius: var(--radius-lg);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        flex-shrink: 0;
      }
      .support-big-icon {
        font-size: 2.2rem;
      }
      .support-grid {
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        gap: 24px;
      }
      .support-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 28px;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
      }
      .card-heading {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .card-sub {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: 4px;
        margin-bottom: 20px;
      }
      .support-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .field-label {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .char-count {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
      }
      .char-valid {
        color: var(--color-success);
      }
      .form-control {
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 10px 14px;
        font-size: 0.92rem;
        outline: none;
        width: 100%;
        background: #ffffff;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .form-control:focus {
        border-color: var(--primary-teal);
        box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);
      }
      .select-control {
        cursor: pointer;
      }
      .textarea-control {
        resize: vertical;
        font-family: inherit;
        line-height: 1.5;
      }
      .field-hint {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      .btn-send-support {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 12px;
        border-radius: var(--radius-md);
        margin-top: 6px;
        transition: background 0.15s, transform 0.1s;
        cursor: pointer;
      }
      .btn-send-support:hover:not(:disabled) {
        background: var(--primary-teal-hover);
        transform: translateY(-1px);
      }
      .btn-send-support:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .requests-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .btn-refresh-icon {
        font-size: 1.1rem;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-color);
        background: #ffffff;
        cursor: pointer;
        transition: background 0.15s;
      }
      .btn-refresh-icon:hover {
        background: var(--bg-card-subtle);
      }
      .skeleton-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .tickets-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-height: 600px;
        overflow-y: auto;
      }
      .ticket-item-card {
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 16px 18px;
        background: var(--bg-card-subtle);
        transition: all 0.15s;
      }
      .ticket-item-card:hover {
        border-color: var(--primary-teal-border);
        box-shadow: var(--shadow-xs);
      }
      .ticket-item-card.ticket-resolved {
        border-left: 4px solid var(--color-success);
        background: #ffffff;
      }
      .ticket-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .ticket-category-tag {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--primary-teal);
        background: var(--primary-teal-surface);
        padding: 3px 10px;
        border-radius: var(--radius-pill);
      }
      .ticket-msg {
        font-size: 0.92rem;
        color: var(--text-main);
        line-height: 1.45;
        margin-bottom: 10px;
        white-space: pre-wrap;
      }
      .ticket-meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .ticket-id {
        font-size: 0.75rem;
      }
      .support-reply-bubble {
        margin-top: 12px;
        padding: 12px 14px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: var(--radius-md);
      }
      .reply-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .reply-badge {
        font-size: 0.75rem;
        font-weight: 800;
        color: #166534;
      }
      .reply-time {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
      .reply-text {
        font-size: 0.88rem;
        color: #14532d;
        line-height: 1.4;
        margin: 0;
      }
      .error-state-box {
        text-align: center;
        padding: 32px 16px;
        color: var(--color-danger);
      }
      .err-icon {
        font-size: 2rem;
        display: block;
        margin-bottom: 8px;
      }
      .btn-retry {
        margin-top: 10px;
        padding: 6px 14px;
        background: var(--color-danger-bg);
        border: 1px solid var(--color-danger);
        color: var(--color-danger-text);
        border-radius: var(--radius-pill);
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
      }

      @media (max-width: 900px) {
        .support-grid {
          grid-template-columns: 1fr;
        }
        .support-header-card {
          padding: 24px 20px;
        }
      }
    `
  ]
})
export class HelpSupportComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private i18n = inject(AppI18nService);

  category: SupportCategory | '' = '';
  message = '';
  isSubmitting = signal(false);

  tickets = signal<SupportTicket[]>([]);
  isLoading = signal(false);
  errorLoading = signal(false);

  private pollInterval: any = null;

  ngOnInit() {
    this.loadTickets();
    // Poll every 10 seconds while the page is open
    this.pollInterval = setInterval(() => {
      this.loadTickets(false);
    }, 10000);
  }

  isFormValid(): boolean {
    return (
      !!this.category &&
      this.message.trim().length >= 5 &&
      this.message.trim().length <= 1000
    );
  }

  loadTickets(showSpinner = true) {
    if (showSpinner && this.tickets().length === 0) {
      this.isLoading.set(true);
    }
    this.errorLoading.set(false);

    this.apiService.getMySupportTickets().subscribe({
      next: (list) => {
        this.isLoading.set(false);
        this.tickets.set(list || []);
      },
      error: (err) => {
        this.isLoading.set(false);
        // Only mark error if we have no tickets cached
        if (this.tickets().length === 0) {
          this.errorLoading.set(true);
        }
      }
    });
  }

  submitTicket() {
    if (!this.isFormValid()) return;

    this.isSubmitting.set(true);
    const payload = {
      category: this.category,
      message: this.message.trim()
    };

    this.apiService.createSupportTicket(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toastService.success(
          this.i18n.translate('support.submit_success') ||
            'Help request sent successfully! Our team will reply shortly.'
        );
        // Clear form
        this.category = '';
        this.message = '';
        // Refresh tickets
        this.loadTickets(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const detail =
          err?.error?.detail ||
          err?.error?.message ||
          'Failed to submit help request.';
        this.toastService.error(detail);
      }
    });
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'claim':
        return 'support.cat_claim';
      case 'pool':
        return 'support.cat_pool';
      case 'nearby':
        return 'support.cat_nearby';
      case 'account':
        return 'support.cat_account';
      default:
        return 'support.cat_other';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'Just now';
    return this.i18n.formatDate(dateStr);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
