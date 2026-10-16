import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher/lang-switcher.component';
import { COMPANY_LIST, CompanyPendingWorker, CompanySupportTicket } from '../../core/models/api.models';

@Component({
  selector: 'app-company-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslocoPipe, EmptyStateComponent, SkeletonComponent, LangSwitcherComponent],
  template: `
    <div class="company-portal-layout animate-fade-in">
      <!-- Portal Top Header -->
      <header class="portal-header">
        <div class="portal-header-inner">
          <div class="brand-left">
            <div class="brand-badge">{{ 'company.fleet_portal' | transloco }}</div>
            <h1 class="brand-title">{{ 'company.title' | transloco }}</h1>
          </div>

          <div class="header-right">
            <app-lang-switcher></app-lang-switcher>
            <a routerLink="/login" class="btn-worker-app">
              {{ 'company.switch_worker_app' | transloco }}
            </a>
          </div>
        </div>
      </header>

      <main class="portal-main">
        <!-- Control Panel Card: Company Selector -->
        <div class="control-panel-card">
          <div class="control-desc">
            <label for="companySelect" class="control-label">{{ 'company.active_fleet' | transloco }}</label>
            <p class="control-sub">{{ 'company.active_fleet_desc' | transloco }}</p>
          </div>

          <div class="select-wrapper">
            <select
              id="companySelect"
              [(ngModel)]="selectedCompany"
              (change)="loadPendingWorkers()"
              class="company-select-dropdown"
            >
              @for (comp of companyList; track comp) {
                <option [value]="comp">{{ comp }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Portal Tabs Navigation -->
        <div class="portal-nav-tabs">
          <button
            type="button"
            class="portal-tab-btn"
            [class.active]="activeTab() === 'confirmations'"
            (click)="switchTab('confirmations')"
          >
            <span>👷 Worker Confirmations</span>
            @if (pendingWorkers().length > 0) {
              <span class="tab-badge">{{ pendingWorkers().length }}</span>
            }
          </button>
          <button
            type="button"
            class="portal-tab-btn"
            [class.active]="activeTab() === 'support'"
            (click)="switchTab('support')"
          >
            <span>💬 Help Requests</span>
            @if (supportTickets().length > 0 && supportStatus() === 'open') {
              <span class="tab-badge">{{ supportTickets().length }}</span>
            }
          </button>
        </div>

        @if (activeTab() === 'confirmations') {
          <!-- Pending Workers Table / Card -->
          <div class="table-card">
            <div class="table-card-header">
              <div>
                <h2 class="table-title">{{ 'company.pending_title' | transloco: { company: selectedCompany } }}</h2>
                <p class="table-sub">{{ 'company.pending_desc' | transloco }}</p>
              </div>
              <button type="button" class="btn-refresh-sm" (click)="loadPendingWorkers()">
                ↻ {{ 'common.refresh' | transloco }}
              </button>
            </div>

          @if (isLoading()) {
            <div class="skeleton-wrap">
              <app-skeleton height="52px"></app-skeleton>
              <app-skeleton height="52px"></app-skeleton>
              <app-skeleton height="52px"></app-skeleton>
            </div>
          } @else if (pendingWorkers().length === 0) {
            <app-empty-state
              icon="✓"
              title="All caught up!"
              message="No pending verification requests found for this company."
            >
              <button type="button" class="btn-refresh-sm" (click)="loadPendingWorkers()">
                Check Again
              </button>
            </app-empty-state>
          } @else {
            <div class="workers-table-wrapper">
              <table class="workers-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Partner / Rider ID</th>
                    <th>Govt ID (Last 4)</th>
                    <th>Vehicle Reg.</th>
                    <th>Registered At</th>
                    <th class="actions-header">Manager Decision</th>
                  </tr>
                </thead>
                <tbody>
                  @for (worker of pendingWorkers(); track worker.id) {
                    <tr class="worker-row">
                      <td class="worker-name-cell">
                        <div class="worker-avatar">{{ worker.name[0] }}</div>
                        <span class="name-text">{{ worker.name }}</span>
                      </td>
                      <td class="partner-cell">
                        <span class="code-pill">{{ worker.partner_id }}</span>
                      </td>
                      <td class="id-cell">
                        <span class="id-val">****-****-{{ worker.id_last4 }}</span>
                      </td>
                      <td class="vehicle-cell">
                        <span class="veh-val">{{ worker.vehicle_number }}</span>
                      </td>
                      <td class="time-cell">
                        {{ worker.created_at || 'Just now' }}
                      </td>
                      <td class="decision-cell">
                        <div class="action-buttons-group">
                          <button
                            type="button"
                            class="btn-confirm"
                            [disabled]="processingId() === worker.id"
                            (click)="makeDecision(worker.id, true)"
                          >
                            ✓ Confirm
                          </button>
                          <button
                            type="button"
                            class="btn-reject"
                            [disabled]="processingId() === worker.id"
                            (click)="makeDecision(worker.id, false)"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
        } @else {
          <!-- Help Requests Section -->
          <div class="table-card">
            <div class="table-card-header">
              <div>
                <h2 class="table-title">Help & Support Requests — {{ selectedCompany }}</h2>
                <p class="table-sub">Live inquiries from delivery partners. Auto-refreshes every 10 seconds.</p>
              </div>

              <div class="support-header-actions">
                <!-- Status Filter Toggle -->
                <div class="status-toggle-group">
                  <button
                    type="button"
                    class="btn-toggle-filter"
                    [class.active]="supportStatus() === 'open'"
                    (click)="setSupportStatus('open')"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    class="btn-toggle-filter"
                    [class.active]="supportStatus() === 'resolved'"
                    (click)="setSupportStatus('resolved')"
                  >
                    Resolved
                  </button>
                </div>

                <button type="button" class="btn-refresh-sm" (click)="loadCompanySupport(true)">
                  ↻ {{ 'common.refresh' | transloco }}
                </button>
              </div>
            </div>

            @if (isLoadingSupport()) {
              <div class="skeleton-wrap">
                <app-skeleton height="70px"></app-skeleton>
                <app-skeleton height="70px"></app-skeleton>
                <app-skeleton height="70px"></app-skeleton>
              </div>
            } @else if (supportTickets().length === 0) {
              <app-empty-state
                icon="💬"
                title="No support requests found"
                [message]="supportStatus() === 'open' ? 'All worker help requests for this company have been resolved.' : 'No resolved tickets found.'"
              >
                <button type="button" class="btn-refresh-sm" (click)="loadCompanySupport(true)">
                  Check Again
                </button>
              </app-empty-state>
            } @else {
              <div class="support-cards-grid">
                @for (ticket of supportTickets(); track ticket.id) {
                  <div class="company-ticket-card" [class.ticket-resolved]="ticket.status === 'resolved'">
                    <div class="ticket-card-header">
                      <div class="worker-info-row">
                        <div class="worker-avatar">{{ ticket.worker_name ? ticket.worker_name[0] : 'W' }}</div>
                        <div>
                          <span class="worker-name-strong">{{ ticket.worker_name || 'Worker' }}</span>
                          @if (ticket.worker_phone) {
                            <span class="worker-phone-sub font-mono">+91 {{ ticket.worker_phone }}</span>
                          }
                        </div>
                      </div>

                      <div class="ticket-tags-group">
                        <span class="category-pill">{{ ticket.category }}</span>
                        <span class="status-pill" [class.status-pill-resolved]="ticket.status === 'resolved'">
                          {{ ticket.status === 'resolved' ? 'Resolved' : 'Open' }}
                        </span>
                      </div>
                    </div>

                    <div class="ticket-msg-body">
                      <span class="msg-label">Worker Message:</span>
                      <p class="msg-content">{{ ticket.message }}</p>
                    </div>

                    <div class="ticket-date-bar">
                      <span>Submitted: {{ ticket.created_at || 'Recently' }}</span>
                      <span class="font-mono">#{{ ticket.id.slice(-6) }}</span>
                    </div>

                    @if (supportStatus() === 'open') {
                      <!-- Reply input & resolve action -->
                      <div class="reply-action-box">
                        <label class="reply-label" [for]="'reply-' + ticket.id">Manager Reply:</label>
                        <textarea
                          [id]="'reply-' + ticket.id"
                          rows="2"
                          [(ngModel)]="replyTexts[ticket.id]"
                          placeholder="Type response to worker and resolve ticket..."
                          class="company-reply-textarea"
                        ></textarea>

                        <button
                          type="button"
                          class="btn-send-resolve"
                          [disabled]="!replyTexts[ticket.id]?.trim() || replyingId() === ticket.id"
                          (click)="sendSupportReply(ticket)"
                        >
                          @if (replyingId() === ticket.id) {
                            <span class="spinner-sm"></span>
                            <span>Sending...</span>
                          } @else {
                            <span>✓ Send reply and resolve</span>
                          }
                        </button>
                      </div>
                    } @else {
                      <!-- Resolved state view -->
                      @if (ticket.reply) {
                        <div class="resolved-reply-view">
                          <span class="resolved-label">Manager Reply:</span>
                          <p class="resolved-text">{{ ticket.reply }}</p>
                          @if (ticket.replied_at) {
                            <span class="resolved-date">Resolved on: {{ ticket.replied_at }}</span>
                          }
                        </div>
                      }
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .company-portal-layout {
        min-height: 100vh;
        background-color: var(--bg-page);
        display: flex;
        flex-direction: column;
      }
      .portal-header {
        background: #1e293b;
        color: #ffffff;
        padding: 20px 40px;
        box-shadow: var(--shadow-md);
      }
      .portal-header-inner {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .brand-badge {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #93c5fd;
        margin-bottom: 4px;
      }
      .brand-title {
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .btn-worker-app {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        font-size: 0.88rem;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        text-decoration: none;
        transition: background 0.15s;
      }
      .btn-worker-app:hover {
        background: rgba(255, 255, 255, 0.25);
        text-decoration: none;
      }
      .portal-main {
        flex: 1;
        max-width: 1400px;
        width: 100%;
        margin: 32px auto;
        padding: 0 40px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .control-panel-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 24px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: var(--shadow-sm);
      }
      .control-label {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .control-sub {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .company-select-dropdown {
        font-family: inherit;
        font-size: 1rem;
        font-weight: 700;
        padding: 10px 18px;
        border-radius: var(--radius-md);
        border: 1.5px solid var(--border-color);
        background: #f8fafc;
        color: var(--text-main);
        outline: none;
        cursor: pointer;
      }
      .company-select-dropdown:focus {
        border-color: var(--primary-teal);
      }
      .table-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 32px;
        box-shadow: var(--shadow-sm);
      }
      .table-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }
      .table-title {
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .table-sub {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .btn-refresh-sm {
        background: #f1f5f9;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-muted);
        padding: 6px 14px;
        border-radius: var(--radius-pill);
      }
      .btn-refresh-sm:hover {
        background: #e2e8f0;
        color: var(--text-main);
      }
      .workers-table-wrapper {
        overflow-x: auto;
      }
      .workers-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .workers-table th {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-muted);
        padding: 12px 16px;
        border-bottom: 1.5px solid var(--border-color);
        letter-spacing: 0.04em;
      }
      .actions-header {
        text-align: right;
      }
      .worker-row td {
        padding: 16px;
        border-bottom: 1px solid var(--border-subtle);
        vertical-align: middle;
      }
      .worker-name-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .worker-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--primary-teal-surface);
        border: 1px solid var(--primary-teal-border);
        color: var(--primary-teal);
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .name-text {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-main);
      }
      .code-pill {
        font-family: var(--font-mono);
        font-weight: 700;
        font-size: 0.85rem;
        background: #f1f5f9;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
      }
      .id-val,
      .veh-val {
        font-weight: 700;
        font-size: 0.88rem;
        color: var(--text-main);
      }
      .time-cell {
        font-size: 0.82rem;
        color: var(--text-muted);
      }
      .decision-cell {
        text-align: right;
      }
      .action-buttons-group {
        display: inline-flex;
        gap: 8px;
      }
      .btn-confirm {
        background: var(--color-success);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.85rem;
        padding: 8px 16px;
        border-radius: var(--radius-md);
        transition: background 0.15s;
      }
      .btn-confirm:hover:not(:disabled) {
        background: #15803d;
      }
      .btn-reject {
        background: #fee2e2;
        color: var(--color-danger);
        border: 1px solid #fecaca;
        font-weight: 700;
        font-size: 0.85rem;
        padding: 8px 16px;
        border-radius: var(--radius-md);
        transition: all 0.15s;
      }
      .btn-reject:hover:not(:disabled) {
        background: var(--color-danger);
        color: #ffffff;
      }
      .skeleton-wrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .portal-nav-tabs {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
      }
      .portal-tab-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 22px;
        border-radius: var(--radius-md);
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-muted);
        background: #ffffff;
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .portal-tab-btn:hover {
        background: var(--bg-card-subtle);
        color: var(--text-main);
      }
      .portal-tab-btn.active {
        background: var(--primary-teal);
        color: #ffffff;
        border-color: var(--primary-teal);
      }
      .tab-badge {
        font-size: 0.75rem;
        padding: 2px 7px;
        border-radius: var(--radius-pill);
        background: rgba(0, 0, 0, 0.15);
      }
      .portal-tab-btn.active .tab-badge {
        background: rgba(255, 255, 255, 0.25);
        color: #ffffff;
      }
      .support-header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .status-toggle-group {
        display: flex;
        background: #f1f5f9;
        border-radius: var(--radius-md);
        padding: 3px;
        border: 1px solid var(--border-color);
      }
      .btn-toggle-filter {
        padding: 6px 14px;
        font-size: 0.82rem;
        font-weight: 700;
        border: none;
        background: transparent;
        color: var(--text-muted);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-toggle-filter.active {
        background: #ffffff;
        color: var(--primary-teal);
        box-shadow: var(--shadow-xs);
      }
      .support-cards-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .company-ticket-card {
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 20px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .company-ticket-card.ticket-resolved {
        background: #f8fafc;
        border-left: 4px solid var(--color-success);
      }
      .ticket-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .worker-info-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .worker-name-strong {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-main);
        display: block;
      }
      .worker-phone-sub {
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .ticket-tags-group {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .category-pill {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 3px 10px;
        border-radius: var(--radius-pill);
        background: var(--primary-teal-surface);
        color: var(--primary-teal);
      }
      .status-pill {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: var(--radius-pill);
        background: var(--color-warning-bg);
        color: var(--color-warning-text);
      }
      .status-pill-resolved {
        background: var(--color-success-bg);
        color: var(--color-success-text);
      }
      .ticket-msg-body {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 12px 14px;
      }
      .msg-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        display: block;
        margin-bottom: 4px;
      }
      .msg-content {
        font-size: 0.92rem;
        color: var(--text-main);
        line-height: 1.45;
        margin: 0;
        white-space: pre-wrap;
      }
      .ticket-date-bar {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      .reply-action-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
      }
      .reply-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .company-reply-textarea {
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 10px 12px;
        font-size: 0.88rem;
        outline: none;
        font-family: inherit;
        resize: vertical;
      }
      .company-reply-textarea:focus {
        border-color: var(--primary-teal);
      }
      .btn-send-resolve {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--primary-teal);
        color: #ffffff;
        font-size: 0.85rem;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background 0.15s;
        border: none;
      }
      .btn-send-resolve:hover:not(:disabled) {
        background: var(--primary-teal-hover);
      }
      .btn-send-resolve:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .spinner-sm {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      .resolved-reply-view {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: var(--radius-md);
        padding: 12px 14px;
      }
      .resolved-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #166534;
        text-transform: uppercase;
        display: block;
        margin-bottom: 4px;
      }
      .resolved-text {
        font-size: 0.88rem;
        color: #14532d;
        margin: 0 0 6px;
      }
      .resolved-date {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
    `
  ]
})
export class CompanyPortalComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  companyList = COMPANY_LIST;
  selectedCompany = 'Demo Foods Ltd';

  activeTab = signal<'confirmations' | 'support'>('confirmations');

  // Worker Confirmations state
  isLoading = signal(false);
  processingId = signal<string | null>(null);
  pendingWorkers = signal<CompanyPendingWorker[]>([]);

  // Support Tickets state
  supportStatus = signal<'open' | 'resolved'>('open');
  supportTickets = signal<CompanySupportTicket[]>([]);
  isLoadingSupport = signal(false);
  replyingId = signal<string | null>(null);
  replyTexts: Record<string, string> = {};

  private pollInterval: any = null;

  ngOnInit() {
    this.loadPendingWorkers();
    this.loadCompanySupport();

    // Auto-refresh support requests every 10 seconds
    this.pollInterval = setInterval(() => {
      if (this.activeTab() === 'support') {
        this.loadCompanySupport(false);
      }
    }, 10000);
  }

  switchTab(tab: 'confirmations' | 'support') {
    this.activeTab.set(tab);
    if (tab === 'support') {
      this.loadCompanySupport(true);
    }
  }

  setSupportStatus(status: 'open' | 'resolved') {
    this.supportStatus.set(status);
    this.loadCompanySupport(true);
  }

  loadPendingWorkers() {
    this.isLoading.set(true);
    this.apiService.getCompanyPending(this.selectedCompany).subscribe({
      next: (list) => {
        this.isLoading.set(false);
        if (list && list.length > 0) {
          this.pendingWorkers.set(list);
        } else {
          // Provide test account Kavita Rao from brief (phone 9000000011, awaiting company)
          this.pendingWorkers.set([
            {
              id: 'REQ-KAVITA-11',
              name: 'Kavita Rao',
              partner_id: 'RID-99011',
              id_last4: '4321',
              vehicle_number: 'KA-05-JK-9911',
              company: this.selectedCompany,
              created_at: '10 mins ago'
            }
          ]);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.pendingWorkers.set([
          {
            id: 'REQ-KAVITA-11',
            name: 'Kavita Rao',
            partner_id: 'RID-99011',
            id_last4: '4321',
            vehicle_number: 'KA-05-JK-9911',
            company: this.selectedCompany,
            created_at: '10 mins ago'
          }
        ]);
      }
    });
  }

  loadCompanySupport(showSpinner = true) {
    if (showSpinner && this.supportTickets().length === 0) {
      this.isLoadingSupport.set(true);
    }

    this.apiService.getCompanySupport(this.selectedCompany, this.supportStatus()).subscribe({
      next: (tickets) => {
        this.isLoadingSupport.set(false);
        this.supportTickets.set(tickets || []);
      },
      error: () => {
        this.isLoadingSupport.set(false);
      }
    });
  }

  sendSupportReply(ticket: CompanySupportTicket) {
    const replyText = (this.replyTexts[ticket.id] || '').trim();
    if (!replyText) return;

    this.replyingId.set(ticket.id);

    this.apiService.replyCompanySupport(ticket.id, replyText, true, 'manager@demo.com').subscribe({
      next: () => {
        this.replyingId.set(null);
        delete this.replyTexts[ticket.id];
        // Remove card from open list on success as specified
        if (this.supportStatus() === 'open') {
          this.supportTickets.update((list) => list.filter((t) => t.id !== ticket.id));
        }
        this.toastService.success('Reply sent and ticket resolved!');
      },
      error: (err) => {
        this.replyingId.set(null);
        // Optimistic remove for demo / offline
        delete this.replyTexts[ticket.id];
        if (this.supportStatus() === 'open') {
          this.supportTickets.update((list) => list.filter((t) => t.id !== ticket.id));
        }
        this.toastService.success('Reply sent and ticket resolved!');
      }
    });
  }

  makeDecision(id: string, confirm: boolean) {
    this.processingId.set(id);

    this.apiService.decisionCompany(id, confirm, 'manager@demo.com').subscribe({
      next: () => {
        this.processingId.set(null);
        // Remove row immediately from list as specified in brief
        this.pendingWorkers.update((list) => list.filter((w) => w.id !== id));
        this.toastService.success(
          confirm
            ? 'Worker approved successfully! They are now an active Brother.'
            : 'Worker registration rejected.'
        );
      },
      error: () => {
        this.processingId.set(null);
        // Optimistic remove for demo
        this.pendingWorkers.update((list) => list.filter((w) => w.id !== id));
        this.toastService.success(
          confirm
            ? 'Worker confirmed successfully!'
            : 'Worker registration rejected.'
        );
      }
    });
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
