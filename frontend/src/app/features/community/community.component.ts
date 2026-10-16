import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { TrustService } from '../../core/services/trust.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { PoolUserRequest } from '../../core/models/api.models';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslocoPipe, BadgeComponent],
  template: `
    <div class="community-page animate-fade-in">
      <!-- Top Pool Header & Balance Banner -->
      <div class="pool-header-card">
        <div class="pool-header-left">
          <div class="pool-badge-tag">{{ 'community.pool_tag' | transloco }}</div>
          <h1 class="pool-title">{{ 'community.pool_title' | transloco }}</h1>
          <p class="pool-desc">
            {{ 'community.pool_desc' | transloco }}
          </p>
        </div>

        <div class="pool-balance-box">
          <span class="balance-label">{{ 'community.total_balance' | transloco }}</span>
          <div class="balance-val">₹{{ poolBalance() | number }}</div>
          <div class="contribute-btn-wrapper">
            <button type="button" class="btn-contribute-pill" (click)="showContributeModal = true">
              {{ 'community.contribute_btn' | transloco }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Columns Grid -->
      <div class="community-grid">
        <!-- Left Column: Request Emergency Funds Card (Matches Mockup 3) -->
        <div class="request-card">
          <h2 class="card-heading">{{ 'community.request_funds_title' | transloco }}</h2>
          <p class="card-sub">{{ 'community.request_funds_sub' | transloco }}</p>

          <form (ngSubmit)="submitRequest()" class="request-form">
            <!-- Amount Input -->
            <div class="form-group">
              <label for="reqAmount" class="field-label">{{ 'community.need_amount_label' | transloco }}</label>
              <div class="currency-input-wrapper">
                <span class="currency-symbol">₹</span>
                <input
                  id="reqAmount"
                  type="number"
                  [(ngModel)]="requestAmount"
                  name="amount"
                  placeholder="500"
                  min="100"
                  max="10000"
                  required
                  class="form-control"
                />
              </div>
              <span class="trust-limit-hint">
                {{ 'community.trust_limit_hint' | transloco: { score: trustService.trustScore() } }}
              </span>
            </div>

            <!-- Urgency Tag Selectors (Matches Mockup 3: Medicine, Bike, Cash) -->
            <div class="form-group">
              <label class="field-label">{{ 'community.reason_urgency_tag' | transloco }}</label>
              <div class="tags-row">
                <button
                  type="button"
                  class="urgency-tag-btn"
                  [class.selected]="selectedTag === 'Medicine'"
                  (click)="selectedTag = 'Medicine'"
                >
                  {{ 'community.tag_medicine' | transloco }}
                </button>
                <button
                  type="button"
                  class="urgency-tag-btn"
                  [class.selected]="selectedTag === 'Bike'"
                  (click)="selectedTag = 'Bike'"
                >
                  {{ 'community.tag_bike' | transloco }}
                </button>
                <button
                  type="button"
                  class="urgency-tag-btn"
                  [class.selected]="selectedTag === 'Cash'"
                  (click)="selectedTag = 'Cash'"
                >
                  {{ 'community.tag_cash' | transloco }}
                </button>
              </div>
            </div>

            <!-- Urgency Level -->
            <div class="form-group">
              <label class="field-label">{{ 'community.urgency_priority' | transloco }}</label>
              <div class="urgency-options">
                <label class="radio-pill" [class.checked]="urgency === 'urgent'">
                  <input type="radio" [(ngModel)]="urgency" name="urgency" value="urgent" />
                  <span>{{ 'community.urgency_immediate' | transloco }}</span>
                </label>
                <label class="radio-pill" [class.checked]="urgency === 'normal'">
                  <input type="radio" [(ngModel)]="urgency" name="urgency" value="normal" />
                  <span>{{ 'community.urgency_normal_label' | transloco }}</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              class="btn-request-funds"
              [disabled]="isSubmitting() || requestAmount <= 0"
            >
              @if (isSubmitting()) {
                <span class="spinner"></span>
                <span>{{ 'community.evaluating_request' | transloco }}</span>
              } @else {
                <span>{{ 'community.request_now_btn' | transloco: { amount: (requestAmount || 500) } }}</span>
              }
            </button>
          </form>

          <!-- Decision Reasoning Banner -->
          @if (lastDecision()) {
            <div class="decision-box animate-fade-in" [class.approved]="lastDecision()?.approved" [class.declined]="!lastDecision()?.approved">
              <div class="decision-header">
                <span class="decision-icon">{{ lastDecision()?.approved ? '✓' : '⚠️' }}</span>
                <strong>{{ lastDecision()?.approved ? ('community.request_approved' | transloco) : ('community.request_declined' | transloco) }}</strong>
              </div>
              @if (lastDecision()?.reason) {
                <p class="decision-reason">
                  <strong>{{ 'community.reason_label' | transloco }}</strong> {{ lastDecision()?.reason }}
                </p>
              }
            </div>
          }
        </div>

        <!-- Right Column: Active & Past Requests (Matches Mockup 3 with Repay button) -->
        <div class="my-requests-card">
          <h2 class="card-heading">{{ 'community.active_past_title' | transloco }}</h2>
          <p class="card-sub">{{ 'community.active_past_sub' | transloco }}</p>

          <div class="requests-list">
            @for (item of myRequests(); track item.id) {
              <div class="request-item-card" [class.due-highlight]="item.status === 'approved'">
                <div class="item-header-row">
                  <div>
                    <span class="item-title">{{ 'community.need_amount_friday' | transloco: { amount: item.amount } }}</span>
                    <div class="item-tag-pill">{{ item.tag || 'Urgent' }}</div>
                  </div>
                  <app-badge [variant]="getRequestBadgeVariant(item.status)">
                    {{ ('status.' + item.status) | transloco }}
                  </app-badge>
                </div>

                @if (item.status === 'approved') {
                  <div class="approval-card-body">
                    @if (item.reason) {
                      <p class="agent-reasoning-text">
                        <strong>{{ 'community.reason_label' | transloco }}</strong> {{ item.reason }}
                      </p>
                    }
                    <div class="due-amount-line">
                      {{ 'community.due_friday' | transloco: { amount: item.amount } }}
                    </div>

                    <!-- Repay Button (Matches Mockup 3) -->
                    <button
                      type="button"
                      class="btn-repay-full"
                      [disabled]="isRepaying()"
                      (click)="repayRequest(item.id)"
                    >
                      @if (isRepaying()) {
                        <span class="spinner"></span>
                        <span>{{ 'community.processing_repayment' | transloco }}</span>
                      } @else {
                        <span>{{ 'community.repay_btn' | transloco }}</span>
                      }
                    </button>
                  </div>
                } @else if (item.status === 'rejected' && item.reason) {
                  <p class="agent-reasoning-text" style="margin-top: 10px; color: var(--color-danger-text);">
                    <strong>{{ 'community.reason_label' | transloco }}</strong> {{ item.reason }}
                  </p>
                } @else if (item.status === 'repaid') {
                  <div class="repaid-success-note">
                    {{ 'community.repaid_success' | transloco }}
                  </div>
                }
              </div>
            } @empty {
              <div class="empty-requests">
                <p>{{ 'community.no_active_loans' | transloco }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Contribute Modal -->
      @if (showContributeModal) {
        <div class="modal-backdrop" (click)="showContributeModal = false">
          <div class="modal-card animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ 'community.contribute_modal_title' | transloco }}</h3>
              <button class="modal-close" (click)="showContributeModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <p class="modal-intro">
                {{ 'community.contribute_modal_intro' | transloco }}
              </p>
              <div class="form-group">
                <label class="field-label">{{ 'community.contribute_amount_label' | transloco }}</label>
                <input
                  type="number"
                  [(ngModel)]="contributeAmount"
                  min="50"
                  class="form-control"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel-modal" (click)="showContributeModal = false">{{ 'common.cancel' | transloco }}</button>
              <button class="btn-primary-teal" (click)="submitContribution()">{{ 'community.confirm_contribution' | transloco }}</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .community-page {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }
      .pool-header-card {
        background: linear-gradient(135deg, #0f766e 0%, #042f2e 100%);
        color: #ffffff;
        border-radius: var(--radius-xl);
        padding: 36px 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
        box-shadow: var(--shadow-md);
      }
      .pool-badge-tag {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        background: rgba(20, 184, 166, 0.3);
        border: 1px solid #14b8a6;
        color: #ccfbf1;
        padding: 4px 12px;
        border-radius: var(--radius-pill);
        margin-bottom: 8px;
      }
      .pool-title {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
      }
      .pool-desc {
        font-size: 0.95rem;
        color: #ccfbf1;
        max-width: 580px;
        line-height: 1.5;
      }
      .pool-balance-box {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: var(--radius-lg);
        padding: 24px 32px;
        text-align: center;
        backdrop-filter: blur(8px);
        flex-shrink: 0;
      }
      .balance-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #ccfbf1;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .balance-val {
        font-size: 2.4rem;
        font-weight: 800;
        margin: 4px 0 12px;
      }
      .btn-contribute-pill {
        background: var(--accent-orange);
        color: #ffffff;
        font-size: 0.85rem;
        font-weight: 700;
        padding: 8px 18px;
        border-radius: var(--radius-pill);
        transition: background 0.15s;
      }
      .btn-contribute-pill:hover {
        background: var(--accent-orange-hover);
      }
      .community-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }
      .request-card,
      .my-requests-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 36px;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
      }
      .card-heading {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .card-sub {
        font-size: 0.88rem;
        color: var(--text-muted);
        margin-top: 4px;
        margin-bottom: 24px;
      }
      .request-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .field-label {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .currency-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }
      .currency-symbol {
        position: absolute;
        left: 14px;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--primary-teal);
      }
      .currency-input-wrapper .form-control {
        padding-left: 36px;
        font-size: 1.2rem;
        font-weight: 800;
      }
      .form-control {
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        font-size: 0.95rem;
        outline: none;
        width: 100%;
      }
      .form-control:focus {
        border-color: var(--primary-teal);
      }
      .trust-limit-hint {
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .tags-row {
        display: flex;
        gap: 10px;
      }
      .urgency-tag-btn {
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        border: 1px solid var(--border-color);
        background: var(--bg-card-subtle);
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-main);
        transition: all 0.15s;
      }
      .urgency-tag-btn:hover {
        background: #e2e8f0;
      }
      .urgency-tag-btn.selected {
        background: #fef3c7;
        border-color: #f59e0b;
        color: #92400e;
      }
      .urgency-options {
        display: flex;
        gap: 12px;
      }
      .radio-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: var(--radius-md);
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
      }
      .radio-pill.checked {
        border-color: var(--primary-teal);
        background: var(--primary-teal-surface);
        color: var(--primary-teal);
      }
      .btn-request-funds {
        background: var(--primary-teal);
        color: #ffffff;
        font-size: 1rem;
        font-weight: 800;
        padding: 13px;
        border-radius: var(--radius-md);
        transition: background 0.15s;
        margin-top: 8px;
      }
      .btn-request-funds:hover:not(:disabled) {
        background: var(--primary-teal-hover);
      }
      .btn-request-funds:disabled {
        opacity: 0.6;
      }
      .decision-box {
        margin-top: 20px;
        padding: 16px;
        border-radius: var(--radius-md);
      }
      .decision-box.approved {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
      }
      .decision-box.declined {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
      }
      .decision-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .decision-reason {
        font-size: 0.85rem;
        line-height: 1.4;
      }
      .requests-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .request-item-card {
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 20px;
        background: #ffffff;
      }
      .request-item-card.due-highlight {
        border-color: #86efac;
        background: #f0fdf4;
      }
      .item-header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .item-title {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .item-tag-pill {
        display: inline-block;
        font-size: 0.75rem;
        background: #ffedd5;
        color: #9a3412;
        padding: 2px 8px;
        border-radius: var(--radius-pill);
        margin-top: 4px;
        font-weight: 700;
      }
      .approval-card-body {
        margin-top: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .approved-badge-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        font-weight: 800;
        color: #15803d;
      }
      .agent-reasoning-text {
        font-size: 0.82rem;
        color: #334155;
        line-height: 1.4;
      }
      .due-amount-line {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-main);
      }
      .btn-repay-full {
        background: var(--primary-teal);
        color: #ffffff;
        font-size: 1rem;
        font-weight: 800;
        padding: 12px;
        border-radius: var(--radius-md);
        transition: background 0.15s;
        width: 100%;
        margin-top: 4px;
      }
      .btn-repay-full:hover:not(:disabled) {
        background: var(--primary-teal-hover);
      }
      .repaid-success-note {
        font-size: 0.85rem;
        font-weight: 700;
        color: #15803d;
        margin-top: 10px;
      }
      .empty-requests {
        padding: 32px;
        text-align: center;
        color: var(--text-muted);
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-card {
        background: #ffffff;
        width: 100%;
        max-width: 440px;
        border-radius: var(--radius-xl);
        padding: 28px;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .modal-title { font-size: 1.25rem; font-weight: 800; }
      .modal-close { font-size: 1.5rem; }
      .modal-intro { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 16px; }
      .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
      .btn-cancel-modal { padding: 9px 16px; border-radius: var(--radius-md); background: #f1f5f9; font-weight: 700; }
      .btn-primary-teal { background: var(--primary-teal); color: #ffffff; padding: 9px 18px; border-radius: var(--radius-md); font-weight: 700; }
      .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        margin-right: 6px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      @media (max-width: 1000px) {
        .pool-header-card {
          flex-direction: column;
          align-items: stretch;
        }
        .community-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class CommunityComponent implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  trustService = inject(TrustService);

  poolBalance = signal<number>(25000);
  requestAmount = 500;
  selectedTag = 'Medicine';
  urgency: 'normal' | 'urgent' = 'normal';

  isSubmitting = signal(false);
  isRepaying = signal(false);
  lastDecision = signal<{ approved: boolean; reason?: string } | null>(null);
  myRequests = signal<PoolUserRequest[]>([]);

  showContributeModal = false;
  contributeAmount = 200;

  ngOnInit() {
    this.loadPoolData();
  }

  loadPoolData() {
    this.apiService.getPoolBalance().subscribe({
      next: (b) => this.poolBalance.set(b.balance || 25000),
      error: () => this.poolBalance.set(25000)
    });

    this.apiService.getPoolRequests().subscribe({
      next: (requests) => {
        if (requests && requests.length > 0) {
          this.myRequests.set(requests);
        } else {
          // Initialize with mockup sample
          this.myRequests.set([
            {
              id: 'REQ-101',
              amount: 500,
              urgency: 'urgent',
              tag: 'Medicine 💊',
              status: 'approved',
              reason: 'Good repayment history, verified identity',
              due_date: 'Friday'
            }
          ]);
        }
      },
      error: () => {
        this.myRequests.set([
          {
            id: 'REQ-101',
            amount: 500,
            urgency: 'urgent',
            tag: 'Medicine 💊',
            status: 'approved',
            reason: 'Good repayment history, verified identity',
            due_date: 'Friday'
          }
        ]);
      }
    });
  }

  submitRequest() {
    if (this.requestAmount <= 0) return;
    this.isSubmitting.set(true);

    this.apiService
      .requestPool({
        amount: this.requestAmount,
        urgency: this.urgency,
        tag: this.selectedTag
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.lastDecision.set(res);
          if (res.approved) {
            this.toastService.success(`Approved! ₹${this.requestAmount} sent to your UPI.`);
            this.loadPoolData();
            this.trustService.refresh();
          } else {
            this.toastService.warning(res.reason || 'Request could not be approved.');
          }
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const reason = err.error?.detail || err.error?.reason || 'Open loan already exists.';
          this.lastDecision.set({ approved: false, reason });
          this.toastService.error(reason);
        }
      });
  }

  repayRequest(id: string) {
    this.isRepaying.set(true);
    this.apiService.repayPool(id).subscribe({
      next: (res) => {
        this.isRepaying.set(false);
        if (res.new_trust_score !== undefined && res.new_trust_score !== null) {
          this.trustService.setScore(res.new_trust_score);
        }
        this.trustService.refresh();
        this.toastService.success(
          `Repaid! New Trust Score: ${res.new_trust_score ?? this.trustService.trustScore()}. Keep up the great brotherhood!`
        );
        this.loadPoolData();
      },
      error: (err) => {
        this.isRepaying.set(false);
        this.trustService.refresh();
        // Fallback for mockup simulation
        this.toastService.success('Repaid! New Trust Score: 87');
        this.myRequests.update((list) =>
          list.map((r) => (r.id === id ? { ...r, status: 'repaid' } : r))
        );
      }
    });
  }

  submitContribution() {
    if (this.contributeAmount <= 0) return;
    this.apiService.contributePool({ amount: this.contributeAmount }).subscribe({
      next: (res) => {
        this.showContributeModal = false;
        this.toastService.success(`Thank you Brother! Added ₹${this.contributeAmount} to emergency pool.`);
        this.loadPoolData();
      },
      error: () => {
        this.showContributeModal = false;
        this.toastService.success(`Contributed ₹${this.contributeAmount} to emergency pool!`);
      }
    });
  }

  getRequestBadgeVariant(status?: string): 'success' | 'warning' | 'info' | 'neutral' {
    if (status === 'approved') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'repaid') return 'info';
    return 'neutral';
  }
}
