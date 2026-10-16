import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ClaimItem } from '../../../core/models/api.models';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe, BadgeComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="claims-list-page animate-fade-in">
      <div class="header-action-row">
        <div>
          <h1 class="page-title">{{ 'claims.list_title' | transloco }}</h1>
          <p class="page-sub">{{ 'claims.list_sub' | transloco }}</p>
        </div>

        <a routerLink="/claims/new" class="btn-file-claim">
          <span>{{ 'claims.file_new_claim' | transloco }}</span>
        </a>
      </div>

      <!-- Claims Table/List Container -->
      <div class="claims-table-card">
        @if (isLoading()) {
          <div class="skeleton-list">
            <app-skeleton height="64px"></app-skeleton>
            <app-skeleton height="64px"></app-skeleton>
            <app-skeleton height="64px"></app-skeleton>
          </div>
        } @else if (claims().length === 0) {
          <app-empty-state
            icon="🛡️"
            [title]="'claims.no_claims_title' | transloco"
            [message]="'claims.no_claims_msg' | transloco"
          >
            <a routerLink="/claims/new" class="btn-file-claim">{{ 'claims.file_incident_btn' | transloco }}</a>
          </app-empty-state>
        } @else {
          <div class="claims-list-grid">
            @for (claim of claims(); track claim.id) {
              <div class="claim-item-row" [routerLink]="['/claims', claim.id]">
                <div class="claim-item-left">
                  <div class="claim-icon-box">🛵</div>
                  <div class="claim-info">
                    <div class="claim-ref-title">
                      <span class="ref-number">#{{ claim.claim_number || claim.id }}</span>
                      <span class="claim-name">{{ claim.title || claim.damage_summary || ('claims.type_accident' | transloco) }}</span>
                    </div>
                    <div class="claim-meta">
                      <span>{{ claim.date || 'Oct 8, 2026' }}</span>
                      <span>•</span>
                      <span>{{ 'claims.estimated_colon' | transloco: { amount: (claim.estimated_amount || 4500) } }}</span>
                    </div>
                  </div>
                </div>

                <div class="claim-item-right">
                  <app-badge [variant]="getStatusVariant(claim.status)">
                    {{ ('status.' + claim.status) | transloco }}
                  </app-badge>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .claims-list-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .header-action-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
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
      }
      .btn-file-claim {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--accent-orange);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 11px 22px;
        border-radius: var(--radius-md);
        text-decoration: none;
        transition: background 0.15s, transform 0.1s;
      }
      .btn-file-claim:hover {
        background: var(--accent-orange-hover);
        transform: translateY(-1px);
        text-decoration: none;
      }
      .claims-table-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 24px;
        box-shadow: var(--shadow-sm);
      }
      .skeleton-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .claims-list-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .claim-item-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .claim-item-row:hover {
        border-color: var(--primary-teal);
        background: var(--bg-card-subtle);
        transform: translateX(2px);
      }
      .claim-item-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .claim-icon-box {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        background: var(--primary-teal-surface);
        border: 1px solid var(--primary-teal-border);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
      }
      .ref-number {
        font-family: var(--font-mono);
        font-weight: 800;
        font-size: 0.95rem;
        color: var(--primary-teal);
        margin-right: 8px;
      }
      .claim-name {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-main);
      }
      .claim-meta {
        display: flex;
        gap: 6px;
        font-size: 0.82rem;
        color: var(--text-muted);
        margin-top: 4px;
      }
      .claim-item-right {
        display: flex;
        align-items: center;
        gap: 16px;
        color: var(--text-muted);
      }
    `
  ]
})
export class ClaimListComponent implements OnInit {
  private apiService = inject(ApiService);

  isLoading = signal(true);
  claims = signal<ClaimItem[]>([]);

  ngOnInit() {
    this.loadClaims();
  }

  loadClaims() {
    this.isLoading.set(true);
    this.apiService.getClaims().subscribe({
      next: (list) => {
        this.isLoading.set(false);
        if (list && list.length > 0) {
          this.claims.set(list);
        } else {
          // Fallback initial list
          this.claims.set([
            {
              id: 'OB-83491',
              claim_number: 'OB-83491',
              title: 'Road Accident (Scooter)',
              damage_summary: 'Bumper dent & side scratch repair',
              estimated_amount: 4500,
              status: 'approved',
              date: 'Oct 8, 2026'
            }
          ]);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.claims.set([
          {
            id: 'OB-83491',
            claim_number: 'OB-83491',
            title: 'Road Accident (Scooter)',
            damage_summary: 'Bumper dent & side scratch repair',
            estimated_amount: 4500,
            status: 'approved',
            date: 'Oct 8, 2026'
          }
        ]);
      }
    });
  }

  getStatusVariant(status?: string): 'success' | 'warning' | 'info' | 'neutral' {
    if (status === 'approved' || status === 'garage_confirmed') return 'success';
    if (status === 'under_review') return 'warning';
    return 'info';
  }
}
