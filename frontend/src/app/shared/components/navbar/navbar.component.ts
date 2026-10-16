import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { TrustService } from '../../../core/services/trust.service';
import { LangSwitcherComponent } from '../lang-switcher/lang-switcher.component';
import { getVerifiedBadgeConfig } from '../../../core/utils/gender-badge.util';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe, LangSwitcherComponent],
  template: `
    <!-- Top Header Bar -->
    <header class="top-header">
      <div class="header-left">
        <a routerLink="/home" class="brand-logo" aria-label="Other/Brother Home">
          <div class="logo-icon">🤝</div>
          <span class="brand-name">Other<span class="brand-slash">/</span>Brother</span>
        </a>

        <!-- Top Nav Links (Matches Mockup 2, 3, 4) -->
        <nav class="top-nav-tabs">
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="tab-link">{{ 'nav.home' | transloco }}</a>
          <a routerLink="/claims" routerLinkActive="active" class="tab-link">{{ 'nav.claims' | transloco }}</a>
          <a routerLink="/community" routerLinkActive="active" class="tab-link">{{ 'nav.community' | transloco }}</a>
          <a routerLink="/nearby" routerLinkActive="active" class="tab-link">{{ 'nav.askBrotherShort' | transloco }}</a>
          <a routerLink="/leaderboard" routerLinkActive="active" class="tab-link">{{ 'nav.leaderboard' | transloco }}</a>
          <a routerLink="/trust" routerLinkActive="active" class="tab-link">{{ 'nav.trust' | transloco }}</a>
          <a routerLink="/income" routerLinkActive="active" class="tab-link">{{ 'nav.income' | transloco }}</a>
        </nav>
      </div>

      <div class="header-right">
        <!-- Multi-language Switcher -->
        <app-lang-switcher></app-lang-switcher>

        <!-- Trust Score Pill Badge -->
        @if (authService.isAuthenticated()) {
          <div class="trust-badge" [class.trust-high]="trustScore() >= 71" [class.trust-med]="trustScore() >= 41 && trustScore() <= 70" [class.trust-low]="trustScore() <= 40">
            <span class="trust-dot"></span>
            <span class="trust-text">{{ 'app.trust_score' | transloco: { score: trustScore() } }}</span>
          </div>
        }

        <!-- User Profile Dropdown -->
        <div class="user-menu-wrapper">
          <button
            type="button"
            class="user-avatar-btn"
            (click)="toggleMenu()"
            aria-label="User profile and settings"
          >
            <div class="avatar-circle">
              {{ initials() }}
            </div>
            <span class="user-name">{{ userName() }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          @if (isMenuOpen()) {
            <div class="dropdown-menu animate-fade-in" (click)="$event.stopPropagation()">
              <div class="dropdown-user-info">
                <div class="dd-name-row">
                  <div class="dd-name">{{ userName() }}</div>
                  <span class="header-verified-pill" [ngClass]="verifiedBadge().badgeClass">
                    {{ verifiedBadge().icon }} {{ verifiedBadge().labelKey | transloco }}
                  </span>
                </div>
                <div class="dd-phone">+91 {{ authService.phone() }}</div>
                @if (authService.currentUser()?.company) {
                  <div class="dd-company">{{ authService.currentUser()?.company }}</div>
                }
              </div>
              <div class="dropdown-divider"></div>
              <a routerLink="/profile" (click)="closeMenu()" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {{ 'app.worker_profile' | transloco }}
              </a>
              <a routerLink="/help" (click)="closeMenu()" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                {{ 'nav.help' | transloco }}
              </a>
              <div class="dropdown-divider"></div>
              <button type="button" (click)="logout()" class="dropdown-item text-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                {{ 'app.sign_out' | transloco }}
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .top-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: #ffffff;
        border-bottom: 1px solid var(--border-color);
        padding: 0 28px;
        height: 68px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 36px;
      }
      .brand-logo {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
      }
      .logo-icon {
        font-size: 1.5rem;
      }
      .brand-name {
        font-weight: 800;
        font-size: 1.25rem;
        color: var(--text-main);
        letter-spacing: -0.02em;
      }
      .brand-slash {
        color: var(--accent-orange);
      }
      .top-nav-tabs {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 68px;
      }
      .tab-link {
        position: relative;
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 14px;
        font-size: 0.92rem;
        font-weight: 600;
        color: var(--text-muted);
        text-decoration: none;
        transition: color 0.15s;
      }
      .tab-link:hover {
        color: var(--text-main);
        text-decoration: none;
      }
      .tab-link.active {
        color: var(--primary-teal);
        font-weight: 700;
      }
      .tab-link.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 10px;
        right: 10px;
        height: 3px;
        background: var(--primary-teal);
        border-radius: 3px 3px 0 0;
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .trust-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: var(--radius-pill);
        font-size: 0.85rem;
        font-weight: 700;
      }
      .trust-high {
        background: var(--color-success-bg);
        color: var(--color-success-text);
      }
      .trust-high .trust-dot {
        background: var(--color-success);
      }
      .trust-med {
        background: var(--color-warning-bg);
        color: var(--color-warning-text);
      }
      .trust-med .trust-dot {
        background: var(--color-warning);
      }
      .trust-low {
        background: var(--color-danger-bg);
        color: var(--color-danger-text);
      }
      .trust-low .trust-dot {
        background: var(--color-danger);
      }
      .trust-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .user-menu-wrapper {
        position: relative;
      }
      .user-avatar-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 8px;
        border-radius: var(--radius-pill);
        transition: background 0.15s;
      }
      .user-avatar-btn:hover {
        background: var(--bg-card-subtle);
      }
      .avatar-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .user-name {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--text-main);
      }
      .dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 230px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        padding: 8px 0;
        z-index: 100;
      }
      .dropdown-user-info {
        padding: 8px 16px;
      }
      .dd-name-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-bottom: 2px;
      }
      .header-verified-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: var(--radius-pill);
        line-height: 1;
        white-space: nowrap;
      }
      .header-verified-pill.badge-gender-male {
        color: var(--primary-teal);
        background: var(--primary-teal-surface);
        border: 1px solid var(--primary-teal-border);
      }
      .header-verified-pill.badge-gender-female {
        color: #db2777;
        background: #fdf2f8;
        border: 1px solid #fbcfe8;
      }
      .header-verified-pill.badge-gender-other {
        color: #475569;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
      }
      .dd-name {
        font-weight: 700;
        font-size: 0.95rem;
      }
      .dd-phone {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .dd-company {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--primary-teal);
        margin-top: 2px;
      }
      .dropdown-divider {
        height: 1px;
        background: var(--border-color);
        margin: 6px 0;
      }
      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 16px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-main);
        text-decoration: none;
        width: 100%;
        text-align: left;
        transition: background 0.15s;
      }
      .dropdown-item:hover {
        background: var(--bg-card-subtle);
        text-decoration: none;
      }
      .dropdown-item.text-danger {
        color: var(--color-danger);
      }
      .dropdown-item.text-danger:hover {
        background: var(--color-danger-bg);
      }

      @media (max-width: 900px) {
        .top-nav-tabs {
          display: none;
        }
        .user-name {
          display: none;
        }
      }
    `
  ]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private trustService = inject(TrustService);
  private router = inject(Router);

  isMenuOpen = signal(false);

  userName = computed(() => {
    return this.authService.currentUser()?.name || 'Worker';
  });

  readonly trustScore = this.trustService.trustScore;
  readonly verifiedBadge = computed(() => getVerifiedBadgeConfig(this.authService.currentUser()?.gender));

  initials = computed(() => {
    const name = this.userName();
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  logout() {
    this.closeMenu();
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
