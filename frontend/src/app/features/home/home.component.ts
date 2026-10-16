import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { TrustService } from '../../core/services/trust.service';
import { TrustRingComponent } from '../../shared/components/trust-ring/trust-ring.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { BgVideoComponent } from '../../shared/components/bg-video/bg-video.component';
import { ClaimItem, PoolBalanceResponse } from '../../core/models/api.models';
import { getVerifiedBadgeConfig } from '../../core/utils/gender-badge.util';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe, TrustRingComponent, BadgeComponent, SkeletonComponent, BgVideoComponent],
  template: `
    <div class="home-page animate-fade-in">
      <!-- Welcome Hero Header -->
      <section class="hero-banner">
        <app-bg-video overlayVariant="light" [breakpoint]="768"></app-bg-video>

        <div class="hero-left">
          <div class="greeting-row">
            <span class="greeting-badge" [ngClass]="verifiedBadge().badgeClass">
              <span class="badge-icon">{{ verifiedBadge().icon }}</span>
              <span>{{ verifiedBadge().labelKey | transloco }}</span>
            </span>
            <h1 class="greeting-title">{{ 'home.greeting_hello' | transloco: { name: workerName() } }}</h1>
            <p class="greeting-subtitle">
              {{ companyName() }} • {{ 'home.active_partner' | transloco }} • {{ 'home.vehicle_label' | transloco: { vehicle: vehicleNumber() } }}
            </p>
          </div>

          <!-- Big Orange 'Something Happened' Incident Button -->
          <div class="action-cta-area">
            <a routerLink="/claims/new" class="btn-incident-orange">
              <div class="incident-icon-bubble">⚡</div>
              <div class="incident-cta-text">
                <span class="cta-headline">{{ 'home.something_happened' | transloco }}</span>
                <span class="cta-sub">{{ 'home.something_happened_sub' | transloco }}</span>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="cta-arrow">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>

        <div class="hero-right">
          <!-- Trust Score Ring Card -->
          <div class="trust-summary-card">
            <app-trust-ring [score]="trustScore()" [size]="140" [strokeWidth]="11"></app-trust-ring>
            <div class="trust-card-footer">
              <span class="trust-level-pill" [class.high]="trustScore() >= 71" [class.med]="trustScore() >= 41 && trustScore() <= 70" [class.low]="trustScore() <= 40">
                {{ trustLabel() }}
              </span>
              <a routerLink="/trust" class="trust-details-link">{{ 'home.explain_score' | transloco }}</a>
            </div>
          </div>
        </div>
      </section>

      <!-- 4 Dashboard Metric Summary Cards -->
      <section class="dashboard-grid">
        <!-- Card 1: Latest Claim Status -->
        <div class="summary-card">
          <div class="card-top">
            <div class="card-icon icon-claim">🛡️</div>
            <span class="card-title">{{ 'home.latest_claim' | transloco }}</span>
            @if (latestClaim()) {
              <app-badge [variant]="getClaimBadgeVariant(latestClaim()?.status)">
                {{ ('status.' + latestClaim()?.status) | transloco }}
              </app-badge>
            }
          </div>

          <div class="card-body">
            @if (isLoading()) {
              <app-skeleton height="24px" width="70%"></app-skeleton>
              <app-skeleton height="18px" width="90%"></app-skeleton>
            } @else if (latestClaim()) {
              <div class="metric-value">₹{{ latestClaim()?.estimated_amount || 4500 }}</div>
              <p class="metric-desc">
                {{ latestClaim()?.damage_summary || ('home.claim_approved_sub' | transloco) }}
              </p>
            } @else {
              <div class="metric-empty">{{ 'home.no_active_claims' | transloco }}</div>
              <p class="metric-desc">{{ 'home.no_active_claims_sub' | transloco }}</p>
            }
          </div>

          <div class="card-bottom">
            <a routerLink="/claims" class="card-action-link">{{ 'home.view_claims_history' | transloco }}</a>
          </div>
        </div>

        <!-- Card 2: Community Pool -->
        <div class="summary-card">
          <div class="card-top">
            <div class="card-icon icon-pool">🤲</div>
            <span class="card-title">{{ 'home.community_pool' | transloco }}</span>
            <app-badge variant="teal">{{ 'home.instant' | transloco }}</app-badge>
          </div>

          <div class="card-body">
            @if (isLoading()) {
              <app-skeleton height="24px" width="50%"></app-skeleton>
              <app-skeleton height="18px" width="80%"></app-skeleton>
            } @else {
              <div class="metric-value">₹{{ poolBalance() }}</div>
              <p class="metric-desc">
                {{ 'home.pool_reserve_desc' | transloco }}
              </p>
            }
          </div>

          <div class="card-bottom">
            <a routerLink="/community" class="card-action-link">{{ 'home.request_or_contribute' | transloco }}</a>
          </div>
        </div>

        <!-- Card 3: Helper Points & Leaderboard -->
        <div class="summary-card">
          <div class="card-top">
            <div class="card-icon icon-trophy">🏆</div>
            <span class="card-title">{{ 'home.brotherhood_points' | transloco }}</span>
            <app-badge variant="warning">{{ 'home.rank_badge' | transloco: { rank: helperRank() } }}</app-badge>
          </div>

          <div class="card-body">
            @if (isLoading()) {
              <app-skeleton height="24px" width="40%"></app-skeleton>
              <app-skeleton height="18px" width="85%"></app-skeleton>
            } @else {
              <div class="metric-value">{{ helperPoints() }} {{ 'common.pts' | transloco }}</div>
              <p class="metric-desc">
                {{ 'home.points_desc' | transloco }}
              </p>
            }
          </div>

          <div class="card-bottom">
            <a routerLink="/leaderboard" class="card-action-link">{{ 'home.leaderboard_action' | transloco }}</a>
          </div>
        </div>

        <!-- Card 4: Income & Government Schemes -->
        <div class="summary-card">
          <div class="card-top">
            <div class="card-icon icon-income">📊</div>
            <span class="card-title">{{ 'home.income_schemes' | transloco }}</span>
            <app-badge variant="success">{{ 'home.eligible' | transloco }}</app-badge>
          </div>

          <div class="card-body">
            @if (isLoading()) {
              <app-skeleton height="24px" width="60%"></app-skeleton>
              <app-skeleton height="18px" width="90%"></app-skeleton>
            } @else {
              <div class="metric-value">{{ 'home.schemes_count' | transloco }}</div>
              <p class="metric-desc">
                {{ 'home.schemes_desc' | transloco }}
              </p>
            }
          </div>

          <div class="card-bottom">
            <a routerLink="/income" class="card-action-link">{{ 'home.file_monthly_return' | transloco }}</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .home-page {
        display: flex;
        flex-direction: column;
        gap: 32px;
      }
      .hero-banner {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 36px 40px;
        box-shadow: var(--shadow-sm);
        gap: 32px;
      }
      .hero-left {
        position: relative;
        z-index: 2;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .greeting-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 4px 10px;
        border-radius: var(--radius-pill);
        margin-bottom: 8px;
        line-height: 1;
      }
      .greeting-badge.badge-gender-male {
        color: var(--primary-teal);
        background: var(--primary-teal-surface);
        border: 1px solid var(--primary-teal-border);
      }
      .greeting-badge.badge-gender-female {
        color: #db2777;
        background: #fdf2f8;
        border: 1px solid #fbcfe8;
      }
      .greeting-badge.badge-gender-other {
        color: #475569;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
      }
      .greeting-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.03em;
        line-height: 1.2;
      }
      .greeting-subtitle {
        font-size: 0.95rem;
        color: var(--text-muted);
        margin-top: 4px;
      }
      .btn-incident-orange {
        display: flex;
        align-items: center;
        gap: 20px;
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        color: #ffffff;
        padding: 20px 28px;
        border-radius: var(--radius-lg);
        box-shadow: 0 10px 20px -3px rgba(249, 115, 22, 0.35);
        text-decoration: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        max-width: 580px;
      }
      .btn-incident-orange:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 26px -4px rgba(249, 115, 22, 0.45);
        text-decoration: none;
      }
      .incident-icon-bubble {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      .incident-cta-text {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .cta-headline {
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.01em;
      }
      .cta-sub {
        font-size: 0.85rem;
        opacity: 0.92;
        margin-top: 2px;
      }
      .cta-arrow {
        flex-shrink: 0;
        transition: transform 0.15s;
      }
      .btn-incident-orange:hover .cta-arrow {
        transform: translateX(4px);
      }
      .hero-right {
        position: relative;
        z-index: 2;
        flex-shrink: 0;
      }
      .trust-summary-card {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 24px 28px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      .trust-card-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .trust-level-pill {
        font-size: 0.8rem;
        font-weight: 800;
        padding: 4px 12px;
        border-radius: var(--radius-pill);
      }
      .trust-level-pill.high {
        background: var(--color-success-bg);
        color: var(--color-success-text);
      }
      .trust-level-pill.med {
        background: var(--color-warning-bg);
        color: var(--color-warning-text);
      }
      .trust-level-pill.low {
        background: var(--color-danger-bg);
        color: var(--color-danger-text);
      }
      .trust-details-link {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--primary-teal);
      }
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
      }
      .summary-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 24px;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 18px;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .summary-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .card-icon {
        font-size: 1.5rem;
      }
      .card-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-main);
        flex: 1;
        margin-left: 10px;
      }
      .card-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .metric-value {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .metric-empty {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-muted);
      }
      .metric-desc {
        font-size: 0.85rem;
        color: var(--text-muted);
        line-height: 1.4;
      }
      .card-bottom {
        padding-top: 14px;
        border-top: 1px solid var(--border-subtle);
      }
      .card-action-link {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--primary-teal);
        display: inline-flex;
        align-items: center;
      }

      @media (max-width: 1200px) {
        .dashboard-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 800px) {
        .hero-banner {
          flex-direction: column;
          padding: 24px;
        }
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);
  trustService = inject(TrustService);

  isLoading = signal(true);
  latestClaim = signal<ClaimItem | null>(null);
  poolBalance = signal<number>(25000);
  helperRank = signal<number>(4);

  workerName = () => this.authService.currentUser()?.name || 'Ravi Kumar';
  companyName = () => this.authService.currentUser()?.company || 'Demo Foods Ltd';
  vehicleNumber = () => this.authService.currentUser()?.vehicle || 'KA-01-AB-1234';
  readonly trustScore = this.trustService.trustScore;
  helperPoints = () => this.authService.currentUser()?.helper_points ?? 1250;

  trustLabel = () => this.trustService.getHomeTierLabel();
  readonly verifiedBadge = computed(() => getVerifiedBadgeConfig(this.authService.currentUser()?.gender));

  ngOnInit() {
    this.trustService.refresh();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);

    // Refresh me profile
    this.apiService.getAuthMe().subscribe({
      next: (me) => this.authService.setCurrentUser(me),
      error: () => {}
    });

    // Fetch latest claim
    this.apiService.getClaims().subscribe({
      next: (claims) => {
        if (claims && claims.length > 0) {
          this.latestClaim.set(claims[0]);
        }
      },
      error: () => {
        // Mock fallback if offline
        this.latestClaim.set({
          id: 'OB-83491',
          status: 'approved',
          estimated_amount: 4500,
          damage_summary: 'Road Accident (Scooter) - Approved for garage pickup'
        });
      }
    });

    // Fetch pool balance
    this.apiService.getPoolBalance().subscribe({
      next: (res) => {
        this.poolBalance.set(res.balance || 25000);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getClaimBadgeVariant(status?: string): 'success' | 'warning' | 'info' | 'neutral' {
    if (status === 'approved' || status === 'garage_confirmed') return 'success';
    if (status === 'under_review') return 'warning';
    return 'info';
  }
}
