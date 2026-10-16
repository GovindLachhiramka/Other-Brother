import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { TrustService } from '../../core/services/trust.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { getVerifiedBadgeConfig } from '../../core/utils/gender-badge.util';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, BadgeComponent],
  template: `
    <div class="profile-page animate-fade-in">
      <div class="profile-card">
        <!-- Profile Header -->
        <div class="profile-header-band">
          <div class="avatar-large">
            {{ userInitial() }}
          </div>
          <div class="header-name-col">
            <div class="badge-row">
              <app-badge [variant]="verifiedBadge().variant">
                <span>{{ verifiedBadge().icon }}</span>
                <span>{{ verifiedBadge().labelKey | transloco }}</span>
              </app-badge>
              <app-badge variant="teal">{{ currentUser()?.company || 'Demo Foods Ltd' }}</app-badge>
            </div>
            <h1 class="worker-full-name">{{ currentUser()?.name || 'Ravi Kumar' }}</h1>
            <p class="worker-phone">+91 {{ authService.phone() }} • {{ 'profile.partner_id_prefix' | transloco: { id: (currentUser()?.partner_id || 'RID-12345') } }}</p>
          </div>
        </div>

        <!-- Metric Highlights Row -->
        <div class="profile-metrics-row">
          <div class="metric-box">
            <span class="m-label">{{ 'profile.trust_score_label' | transloco }}</span>
            <div class="m-val" [class.highlight-teal]="trustScore() >= 71" [class.highlight-orange]="trustScore() >= 41 && trustScore() <= 70" [class.text-danger]="trustScore() <= 40">{{ trustScore() }}/100</div>
            <span class="m-sub">{{ 'profile.tier1_approved' | transloco }}</span>
          </div>

          <div class="metric-box">
            <span class="m-label">{{ 'profile.points_label' | transloco }}</span>
            <div class="m-val highlight-orange">{{ currentUser()?.helper_points ?? 1250 }} {{ 'common.pts' | transloco }}</div>
            <span class="m-sub">{{ 'profile.community_hero_rank' | transloco }}</span>
          </div>

          <div class="metric-box">
            <span class="m-label">{{ 'profile.registered_vehicle' | transloco }}</span>
            <div class="m-val">{{ currentUser()?.vehicle || 'KA-01-AB-1234' }}</div>
            <span class="m-sub">{{ 'profile.vehicle_type_sub' | transloco }}</span>
          </div>

          <div class="metric-box">
            <span class="m-label">{{ 'profile.safety_net_label' | transloco }}</span>
            <div class="m-val text-success">{{ 'profile.active_cover' | transloco }}</div>
            <span class="m-sub">{{ 'profile.accident_shield' | transloco }}</span>
          </div>
        </div>

        <!-- Details List -->
        <div class="details-section">
          <h2 class="section-title">{{ 'profile.credentials_title' | transloco }}</h2>
          <div class="credentials-grid">
            <div class="cred-item">
              <span class="cred-key">{{ 'profile.national_id_key' | transloco }}</span>
              <span class="cred-val">XXXXXXXX1234 ({{ 'profile.verified_check' | transloco }})</span>
            </div>
            <div class="cred-item">
              <span class="cred-key">{{ 'profile.licence_key' | transloco }}</span>
              <span class="cred-val">KA0120250001 ({{ 'profile.valid_till' | transloco }})</span>
            </div>
            <div class="cred-item">
              <span class="cred-key">{{ 'profile.facial_match_key' | transloco }}</span>
              <span class="cred-val">{{ 'profile.biometric_match' | transloco }}</span>
            </div>
            <div class="cred-item">
              <span class="cred-key">{{ 'profile.fleet_confirm_key' | transloco }}</span>
              <span class="cred-val">{{ 'profile.confirmed_manager' | transloco }}</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="profile-footer-row">
          <button type="button" class="btn-logout" (click)="logout()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {{ 'profile.sign_out_btn' | transloco }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-page {
        max-width: 960px;
        margin: 0 auto;
      }
      .profile-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 44px;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 32px;
      }
      .profile-header-band {
        display: flex;
        align-items: center;
        gap: 24px;
      }
      .avatar-large {
        width: 88px;
        height: 88px;
        border-radius: 50%;
        background: var(--primary-teal);
        color: #ffffff;
        font-size: 2.2rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-md);
        flex-shrink: 0;
      }
      .header-name-col {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .badge-row {
        display: flex;
        gap: 8px;
      }
      .worker-full-name {
        font-size: 2rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
      }
      .worker-phone {
        font-size: 0.95rem;
        color: var(--text-muted);
      }
      .profile-metrics-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
      }
      .metric-box {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .m-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .m-val {
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .m-sub {
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .highlight-teal { color: var(--primary-teal); }
      .highlight-orange { color: var(--accent-orange); }
      .text-success { color: var(--color-success-text); }
      .details-section {
        border-top: 1px solid var(--border-subtle);
        padding-top: 24px;
      }
      .section-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-main);
        margin-bottom: 16px;
      }
      .credentials-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .cred-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 16px;
        background: #f8fafc;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        font-size: 0.88rem;
      }
      .cred-key {
        color: var(--text-muted);
        font-weight: 600;
      }
      .cred-val {
        font-weight: 700;
        color: var(--text-main);
      }
      .profile-footer-row {
        display: flex;
        justify-content: flex-end;
        border-top: 1px solid var(--border-subtle);
        padding-top: 20px;
      }
      .btn-logout {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--color-danger);
        background: var(--color-danger-bg);
        border: 1px solid #fecaca;
        font-weight: 700;
        font-size: 0.92rem;
        padding: 10px 20px;
        border-radius: var(--radius-md);
        transition: all 0.15s;
      }
      .btn-logout:hover {
        background: #fee2e2;
        border-color: var(--color-danger);
      }

      @media (max-width: 800px) {
        .profile-header-band { flex-direction: column; align-items: flex-start; }
        .profile-metrics-row { grid-template-columns: 1fr 1fr; }
        .credentials-grid { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  trustService = inject(TrustService);
  private router = inject(Router);

  currentUser = () => this.authService.currentUser();
  readonly trustScore = this.trustService.trustScore;
  readonly verifiedBadge = computed(() => getVerifiedBadgeConfig(this.currentUser()?.gender));

  ngOnInit() {
    this.trustService.refresh();
  }

  userInitial = () => {
    const name = this.currentUser()?.name || 'Ravi Kumar';
    return name[0].toUpperCase();
  };

  logout() {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
