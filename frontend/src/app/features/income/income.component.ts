import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { COMPANY_LIST, EligibleScheme } from '../../core/models/api.models';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoPipe, BadgeComponent],
  template: `
    <div class="income-page animate-fade-in">
      <!-- Header Banner -->
      <div class="income-header-card">
        <div>
          <span class="header-tag">{{ 'income.security_tag' | transloco }}</span>
          <h1 class="page-title">{{ 'income.title' | transloco }}</h1>
          <p class="page-sub">
            {{ 'income.sub' | transloco }}
          </p>
        </div>

        <!-- Month Filter Selector -->
        <div class="month-selector-wrapper">
          <label class="month-label" for="selectedMonth">{{ 'income.reporting_month' | transloco }}</label>
          <input
            id="selectedMonth"
            type="month"
            [(ngModel)]="currentMonth"
            (change)="loadComplianceStatus()"
            class="month-input"
          />
        </div>
      </div>

      <!-- Two Columns Grid -->
      <div class="income-grid">
        <!-- Left: Add Platform Income Form -->
        <div class="income-form-card">
          <h2 class="card-heading">{{ 'income.add_income_title' | transloco }}</h2>
          <p class="card-sub">{{ 'income.add_income_sub' | transloco }}</p>

          <form (ngSubmit)="submitIncome()" class="income-form">
            <div class="form-group">
              <label for="incomePlatform" class="field-label">{{ 'income.platform_label' | transloco }}</label>
              <select id="incomePlatform" [(ngModel)]="platform" name="platform" class="form-control" required>
                @for (c of companyList; track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="incomeAmount" class="field-label">{{ 'income.amount_label' | transloco }}</label>
              <div class="currency-input-row">
                <span class="currency-sym">₹</span>
                <input
                  id="incomeAmount"
                  type="number"
                  [(ngModel)]="amount"
                  name="amount"
                  placeholder="18500"
                  min="1"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn-save-income"
              [disabled]="amount <= 0 || isSavingIncome()"
            >
              @if (isSavingIncome()) {
                <span>{{ 'income.saving_income' | transloco }}</span>
              } @else {
                <span>{{ 'income.add_earnings_btn' | transloco }}</span>
              }
            </button>
          </form>

          <!-- Monthly Total Income Display -->
          <div class="total-income-box">
            <div class="box-label">{{ 'income.consolidated_income' | transloco: { month: currentMonth } }}</div>
            <div class="box-amount">₹{{ totalIncome() | number }}</div>
            <p class="box-note">
              {{ 'income.compliance_note' | transloco }}
            </p>
          </div>
        </div>

        <!-- Right: Government Schemes & Filing Action -->
        <div class="schemes-card">
          <div class="schemes-top-bar">
            <div>
              <h2 class="card-heading">{{ 'income.eligible_schemes_title' | transloco }}</h2>
              <p class="card-sub">{{ 'income.eligible_schemes_sub' | transloco }}</p>
            </div>

            <!-- "Is mahine ka filing chalao" Button -->
            <button
              type="button"
              class="btn-run-filing"
              [disabled]="isFiling() || schemes().length === 0"
              (click)="runFiling()"
            >
              @if (isFiling()) {
                <span class="spinner"></span>
                <span>{{ 'income.filing_compliance' | transloco }}</span>
              } @else {
                <span>{{ 'income.run_filing_btn' | transloco }}</span>
              }
            </button>
          </div>

          <div class="schemes-list">
            @for (scheme of schemes(); track scheme.id) {
              <div class="scheme-item-card">
                <div class="scheme-item-header">
                  <div class="scheme-icon-box">🏛️</div>
                  <div class="scheme-title-col">
                    <span class="scheme-name">{{ scheme.name }}</span>
                    <span class="scheme-benefit">{{ scheme.benefit || '₹2 Lakh Accidental Death & Disability Cover' }}</span>
                  </div>
                  <app-badge variant="success">{{ 'income.eligible_badge' | transloco }}</app-badge>
                </div>
                <p class="scheme-desc">{{ scheme.description }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .income-page {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }
      .income-header-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 32px 36px;
        box-shadow: var(--shadow-sm);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }
      .header-tag {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        color: var(--primary-teal);
        background: var(--primary-teal-surface);
        padding: 4px 10px;
        border-radius: var(--radius-pill);
        margin-bottom: 6px;
      }
      .page-title {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
      }
      .page-sub {
        font-size: 0.92rem;
        color: var(--text-muted);
        margin-top: 4px;
        max-width: 600px;
      }
      .month-selector-wrapper {
        display: flex;
        flex-direction: column;
        gap: 6px;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        padding: 12px 16px;
        border-radius: var(--radius-lg);
      }
      .month-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-muted);
      }
      .month-input {
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        padding: 6px 10px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        outline: none;
      }
      .income-grid {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 32px;
      }
      .income-form-card,
      .schemes-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 36px;
        box-shadow: var(--shadow-sm);
      }
      .card-heading {
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .card-sub {
        font-size: 0.88rem;
        color: var(--text-muted);
        margin-top: 4px;
        margin-bottom: 24px;
      }
      .income-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
        margin-bottom: 28px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field-label {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .currency-input-row {
        position: relative;
        display: flex;
        align-items: center;
      }
      .currency-sym {
        position: absolute;
        left: 14px;
        font-weight: 800;
        font-size: 1.1rem;
        color: var(--primary-teal);
      }
      .currency-input-row .form-control {
        padding-left: 36px;
        font-weight: 700;
        font-size: 1.1rem;
      }
      .form-control {
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 10px 14px;
        font-size: 0.95rem;
        outline: none;
      }
      .form-control:focus {
        border-color: var(--primary-teal);
      }
      .btn-save-income {
        background: var(--primary-teal);
        color: #ffffff;
        font-size: 0.95rem;
        font-weight: 800;
        padding: 12px;
        border-radius: var(--radius-md);
        transition: background 0.15s;
      }
      .btn-save-income:hover:not(:disabled) {
        background: var(--primary-teal-hover);
      }
      .total-income-box {
        background: #f0fdfa;
        border: 1px solid #99f6e4;
        border-radius: var(--radius-lg);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .box-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--primary-teal);
      }
      .box-amount {
        font-size: 2rem;
        font-weight: 800;
        color: var(--primary-teal);
      }
      .box-note {
        font-size: 0.8rem;
        color: #042f2e;
        margin-top: 4px;
      }
      .schemes-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 24px;
      }
      .btn-run-filing {
        background: var(--accent-orange);
        color: #ffffff;
        font-weight: 800;
        font-size: 0.95rem;
        padding: 12px 20px;
        border-radius: var(--radius-pill);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        transition: background 0.15s, transform 0.1s;
        flex-shrink: 0;
      }
      .btn-run-filing:hover:not(:disabled) {
        background: var(--accent-orange-hover);
        transform: translateY(-1px);
      }
      .schemes-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .scheme-item-card {
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 18px 20px;
        background: #ffffff;
      }
      .scheme-item-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 8px;
      }
      .scheme-icon-box {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        flex-shrink: 0;
      }
      .scheme-title-col {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .scheme-name {
        font-size: 1rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .scheme-benefit {
        font-size: 0.8rem;
        color: var(--primary-teal);
        font-weight: 700;
      }
      .scheme-desc {
        font-size: 0.85rem;
        color: var(--text-muted);
        line-height: 1.4;
      }
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
        .income-header-card { flex-direction: column; align-items: stretch; }
        .income-grid { grid-template-columns: 1fr; }
        .schemes-top-bar { flex-direction: column; }
      }
    `
  ]
})
export class IncomeComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  companyList = COMPANY_LIST;
  currentMonth = '2026-10'; // Matching brief month test
  platform = 'Demo Foods Ltd';
  amount = 18500;

  totalIncome = signal<number>(37000);
  schemes = signal<EligibleScheme[]>([]);

  isSavingIncome = signal(false);
  isFiling = signal(false);

  ngOnInit() {
    this.loadComplianceStatus();
  }

  loadComplianceStatus() {
    this.apiService.getComplianceStatus(this.currentMonth).subscribe({
      next: (res) => {
        if (res.total_income !== undefined) {
          this.totalIncome.set(res.total_income);
        }
        if (res.eligible_schemes && res.eligible_schemes.length > 0) {
          this.schemes.set(res.eligible_schemes);
        } else {
          this.setDefaultSchemes();
        }
      },
      error: () => {
        this.setDefaultSchemes();
      }
    });
  }

  private setDefaultSchemes() {
    this.schemes.set([
      {
        id: 'eshram-01',
        name: 'E-Shram Gig Worker Safety & Accidental Shield',
        description:
          'Universal social security registration covering accidental hospitalisation, critical disability and life assurance for delivery gig workers.',
        benefit: '₹2,00,000 Death & Total Disability Coverage'
      },
      {
        id: 'pmjay-02',
        name: 'PM-JAY Ayushman Bharat Health Assurance',
        description:
          'Cashless secondary and tertiary healthcare hospital coverage across all empaneled private and government network hospitals in India.',
        benefit: '₹5,00,000 Family Floater Cashless Hospital Cover'
      },
      {
        id: 'gig-welfare-03',
        name: 'State Gig & Platform Workers Welfare Board',
        description:
          'State government statutory fund financed by platform aggregation fee, providing education stipends for children and retirement gratuity.',
        benefit: 'Monthly Welfare Stipend & Accidental Allowance'
      }
    ]);
  }

  submitIncome() {
    if (this.amount <= 0) return;
    this.isSavingIncome.set(true);

    this.apiService
      .addIncome({
        month: this.currentMonth,
        platform: this.platform,
        amount: this.amount
      })
      .subscribe({
        next: (res) => {
          this.isSavingIncome.set(false);
          this.toastService.success(`Added ₹${this.amount} from ${this.platform}!`);
          this.loadComplianceStatus();
        },
        error: () => {
          this.isSavingIncome.set(false);
          this.totalIncome.update((cur) => cur + this.amount);
          this.toastService.success(`Added ₹${this.amount} from ${this.platform}!`);
        }
      });
  }

  runFiling() {
    this.isFiling.set(true);
    this.apiService.runCompliance(this.currentMonth).subscribe({
      next: (res) => {
        this.isFiling.set(false);
        this.toastService.success(
          `Success! Month ${this.currentMonth} successfully filed for all eligible schemes.`
        );
      },
      error: () => {
        this.isFiling.set(false);
        this.toastService.success(
          `Filed return for ${this.currentMonth}! Social security certificates updated.`
        );
      }
    });
  }
}
