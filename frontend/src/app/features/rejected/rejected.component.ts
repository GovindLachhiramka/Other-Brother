import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher/lang-switcher.component';

@Component({
  selector: 'app-rejected',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe, LangSwitcherComponent],
  template: `
    <div class="rejected-page animate-fade-in">
      <div class="rejected-lang-bar">
        <app-lang-switcher></app-lang-switcher>
      </div>

      <div class="rejected-card">
        <div class="icon-danger-circle">⚠️</div>
        <h1 class="rejected-title">{{ 'rejected.title' | transloco }}</h1>
        <p class="rejected-desc">
          {{ 'rejected.subtitle' | transloco }}
        </p>

        <div class="reason-box">
          <div class="reason-title">{{ 'rejected.reason_label' | transloco }}</div>
          <div class="reason-text">
            {{ reasonText() }}
          </div>
          <div class="rule-hint">
            🔒 {{ 'auth.block_note' | transloco }}
          </div>
        </div>

        <div class="rejected-actions">
          <a routerLink="/register" class="btn-retry">
            ↻ {{ 'rejected.try_again' | transloco }}
          </a>
          <button type="button" class="btn-logout-sec" (click)="logout()">
            {{ 'app.sign_out' | transloco }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rejected-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-page);
        padding: 24px;
      }
      .rejected-lang-bar {
        max-width: 520px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }
      .rejected-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 48px 36px;
        max-width: 520px;
        width: 100%;
        text-align: center;
        box-shadow: var(--shadow-xl);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .icon-danger-circle {
        font-size: 3rem;
        margin-bottom: 16px;
      }
      .rejected-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-danger);
        margin-bottom: 10px;
      }
      .rejected-desc {
        font-size: 0.95rem;
        color: var(--text-muted);
        line-height: 1.5;
        margin-bottom: 24px;
      }
      .reason-box {
        background: var(--color-danger-bg);
        border: 1px solid #fecaca;
        border-radius: var(--radius-md);
        padding: 16px;
        text-align: left;
        width: 100%;
        margin-bottom: 28px;
      }
      .reason-title {
        font-size: 0.82rem;
        font-weight: 800;
        color: var(--color-danger-text);
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .reason-text {
        font-size: 0.9rem;
        color: #7f1d1d;
        font-weight: 600;
        line-height: 1.4;
      }
      .rule-hint {
        font-size: 0.78rem;
        color: #991b1b;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px dashed #fca5a5;
      }
      .rejected-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }
      .btn-retry {
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 12px;
        border-radius: var(--radius-md);
        text-decoration: none;
        transition: background 0.15s;
      }
      .btn-retry:hover {
        background: var(--primary-teal-hover);
        text-decoration: none;
      }
      .btn-logout-sec {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-muted);
      }
      .btn-logout-sec:hover {
        color: var(--text-main);
      }
    `
  ]
})
export class RejectedComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  reasonText = () =>
    this.authService.currentUser()?.reason ||
    'Name or photo on documents did not match platform rider records.';

  logout() {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
