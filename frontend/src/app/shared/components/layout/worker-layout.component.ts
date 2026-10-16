import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-worker-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe, NavbarComponent],
  template: `
    <div class="app-layout">
      <!-- Top Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Layout Body (Sidebar + Content) -->
      <div class="layout-body">
        <!-- Desktop Left Sidebar -->
        <aside class="sidebar-desktop">
          <div class="sidebar-inner">
            <nav class="sidebar-nav">
              <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="sidebar-link">
                <span class="icon">🏠</span>
                <span class="label">{{ 'nav.home' | transloco }}</span>
              </a>
              <a routerLink="/claims" routerLinkActive="active" class="sidebar-link">
                <span class="icon">🛡️</span>
                <span class="label">{{ 'nav.claims' | transloco }}</span>
              </a>
              <a routerLink="/community" routerLinkActive="active" class="sidebar-link">
                <span class="icon">🤲</span>
                <span class="label">{{ 'nav.community' | transloco }}</span>
              </a>
              <a routerLink="/nearby" routerLinkActive="active" class="sidebar-link sidebar-link-wrap">
                <span class="icon">🤝</span>
                <span class="label">{{ 'nav.askBrother' | transloco }}</span>
              </a>
              <a routerLink="/leaderboard" routerLinkActive="active" class="sidebar-link">
                <span class="icon">🏆</span>
                <span class="label">{{ 'nav.leaderboard' | transloco }}</span>
              </a>
              <a routerLink="/trust" routerLinkActive="active" class="sidebar-link">
                <span class="icon">⭐</span>
                <span class="label">{{ 'nav.trust' | transloco }}</span>
              </a>
              <a routerLink="/income" routerLinkActive="active" class="sidebar-link">
                <span class="icon">📊</span>
                <span class="label">{{ 'nav.income' | transloco }}</span>
              </a>
              <a routerLink="/profile" routerLinkActive="active" class="sidebar-link">
                <span class="icon">👤</span>
                <span class="label">{{ 'nav.profile' | transloco }}</span>
              </a>
              <a routerLink="/help" routerLinkActive="active" class="sidebar-link">
                <span class="icon">❓</span>
                <span class="label">{{ 'nav.help' | transloco }}</span>
              </a>
            </nav>

            <div class="sidebar-bottom">
              <div class="support-card">
                <div class="support-title">{{ 'app.emergency_helpline' | transloco }}</div>
                <div class="support-text">{{ 'app.emergency_sub' | transloco }}</div>
                <a href="tel:112" class="support-btn">{{ 'app.emergency_sos' | transloco }}</a>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Workspace View -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Bottom Navigation (Visible on <= 1024px) -->
      <nav class="mobile-bottom-nav">
        <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="bottom-nav-item">
          <span class="b-icon">🏠</span>
          <span class="b-label">{{ 'nav.home' | transloco }}</span>
        </a>
        <a routerLink="/claims" routerLinkActive="active" class="bottom-nav-item">
          <span class="b-icon">🛡️</span>
          <span class="b-label">{{ 'nav.claims' | transloco }}</span>
        </a>
        <a routerLink="/community" routerLinkActive="active" class="bottom-nav-item">
          <span class="b-icon">🤲</span>
          <span class="b-label">{{ 'nav.community' | transloco }}</span>
        </a>
        <a routerLink="/nearby" routerLinkActive="active" class="bottom-nav-item">
          <span class="b-icon">🤝</span>
          <span class="b-label">{{ 'nav.askBrotherShort' | transloco }}</span>
        </a>
        <a routerLink="/help" routerLinkActive="active" class="bottom-nav-item">
          <span class="b-icon">❓</span>
          <span class="b-label">{{ 'nav.help' | transloco }}</span>
        </a>
        <a routerLink="/profile" routerLinkActive="active" class="bottom-nav-item">
          <span class="b-icon">👤</span>
          <span class="b-label">{{ 'nav.profile' | transloco }}</span>
        </a>
      </nav>
    </div>
  `,
  styles: [
    `
      .app-layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: var(--bg-page);
      }
      .layout-body {
        display: flex;
        flex: 1;
      }
      .sidebar-desktop {
        width: 260px;
        background: #ffffff;
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        position: sticky;
        top: 68px;
        height: calc(100vh - 68px);
        overflow-y: auto;
      }
      .sidebar-inner {
        padding: 24px 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }
      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .sidebar-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 16px;
        border-radius: var(--radius-md);
        font-size: 0.92rem;
        font-weight: 600;
        color: var(--text-muted);
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .sidebar-link .label {
        white-space: normal;
        line-height: 1.25;
      }
      .sidebar-link.sidebar-link-wrap {
        align-items: flex-start;
      }
      .sidebar-link.sidebar-link-wrap .icon {
        margin-top: 2px;
      }
      .sidebar-link .icon {
        font-size: 1.15rem;
        flex-shrink: 0;
      }
      .sidebar-link:hover {
        background: var(--bg-card-subtle);
        color: var(--text-main);
        text-decoration: none;
      }
      .sidebar-link.active {
        background: var(--primary-teal-surface);
        color: var(--primary-teal);
        font-weight: 700;
      }
      .sidebar-bottom {
        padding-top: 20px;
      }
      .support-card {
        background: var(--accent-orange-surface);
        border: 1px solid #fed7aa;
        border-radius: var(--radius-md);
        padding: 14px;
        text-align: center;
      }
      .support-title {
        font-size: 0.85rem;
        font-weight: 800;
        color: var(--accent-orange-hover);
        margin-bottom: 4px;
      }
      .support-text {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-bottom: 10px;
      }
      .support-btn {
        display: block;
        background: var(--accent-orange);
        color: #ffffff;
        font-size: 0.8rem;
        font-weight: 700;
        padding: 6px 12px;
        border-radius: var(--radius-pill);
        text-decoration: none;
        transition: background 0.15s;
      }
      .support-btn:hover {
        background: var(--accent-orange-hover);
        text-decoration: none;
      }
      .main-content {
        flex: 1;
        padding: 32px 40px;
        max-width: 1440px;
        width: 100%;
        margin: 0 auto;
        overflow-x: hidden;
      }

      .mobile-bottom-nav {
        display: none;
      }

      @media (max-width: 1024px) {
        .sidebar-desktop {
          display: none;
        }
        .main-content {
          padding: 20px 16px 84px 16px;
        }
        .mobile-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          border-top: 1px solid var(--border-color);
          z-index: 40;
          height: 60px;
          align-items: center;
          justify-content: space-around;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        }
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 600;
          gap: 2px;
          flex: 1;
          padding: 4px 0;
          transition: color 0.15s;
        }
        .bottom-nav-item .b-icon {
          font-size: 1.15rem;
        }
        .bottom-nav-item.active {
          color: var(--primary-teal);
          font-weight: 700;
        }
      }
    `
  ]
})
export class WorkerLayoutComponent {
  authService = inject(AuthService);
}
