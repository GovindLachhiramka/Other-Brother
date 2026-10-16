import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher/lang-switcher.component';

@Component({
  selector: 'app-wait',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe, LangSwitcherComponent],
  template: `
    <div class="wait-page-container">
      <div class="wait-lang-bar">
        <app-lang-switcher></app-lang-switcher>
      </div>

      <div class="wait-card animate-fade-in">
        <!-- Animated Hourglass / Clock Icon -->
        <div class="wait-icon-wrapper">
          <div class="pulse-ring"></div>
          <div class="wait-icon">⏳</div>
        </div>

        <h1 class="wait-title">{{ 'wait.title' | transloco }}</h1>
        <p class="wait-subtitle">
          {{ 'wait.subtitle' | transloco }}
        </p>

        <div class="status-indicator-box">
          <div class="polling-indicator">
            <span class="pulse-dot"></span>
            <span>{{ 'wait.polling_status' | transloco }}</span>
          </div>

          @if (requestId) {
            <div class="meta-row">
              <span class="meta-label">{{ 'wait.request_ref' | transloco }}</span>
              <span class="meta-val font-mono">{{ requestId }}</span>
            </div>
          }

          <div class="meta-row">
            <span class="meta-label">{{ 'wait.worker_phone' | transloco }}</span>
            <span class="meta-val font-mono">+91 {{ displayPhone() }}</span>
          </div>
        </div>

        <p class="wait-email-notice">
          {{ 'wait.email_notice' | transloco: { email: displayEmail() } }}
        </p>

        <div class="wait-footer">
          <button type="button" class="btn-refresh" (click)="checkStatusOnce()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            {{ 'wait.check_now' | transloco }}
          </button>
          <button type="button" class="btn-logout-link" (click)="logout()">
            {{ 'app.sign_out' | transloco }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .wait-page-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-page);
        padding: 24px;
      }
      .wait-lang-bar {
        max-width: 540px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }
      .wait-card {
        max-width: 540px;
        width: 100%;
        background: #ffffff;
        border-radius: var(--radius-xl);
        padding: 48px 36px;
        box-shadow: var(--shadow-xl);
        border: 1px solid var(--border-color);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .wait-icon-wrapper {
        position: relative;
        width: 84px;
        height: 84px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
      }
      .pulse-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: var(--accent-orange);
        opacity: 0.15;
        animation: ringPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes ringPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.15;
        }
        50% {
          transform: scale(1.3);
          opacity: 0.3;
        }
      }
      .wait-icon {
        font-size: 2.8rem;
        position: relative;
        z-index: 2;
      }
      .wait-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
        margin-bottom: 10px;
      }
      .wait-subtitle {
        font-size: 0.95rem;
        color: var(--text-muted);
        line-height: 1.5;
        max-width: 440px;
        margin-bottom: 28px;
      }
      .status-indicator-box {
        width: 100%;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 24px;
      }
      .polling-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--primary-teal);
      }
      .pulse-dot {
        width: 8px;
        height: 8px;
        background: var(--primary-teal);
        border-radius: 50%;
        animation: blink 1.2s infinite ease-in-out;
      }
      @keyframes blink {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 1; }
      }
      .meta-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
      }
      .meta-label {
        color: var(--text-muted);
        font-weight: 600;
      }
      .meta-val {
        color: var(--text-main);
        font-weight: 700;
      }
      .wait-email-notice {
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.5;
        margin-bottom: 24px;
        max-width: 440px;
        text-align: center;
      }
      .wait-footer {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .btn-refresh {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-main);
        background: #f1f5f9;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        transition: background 0.15s;
      }
      .btn-refresh:hover {
        background: #e2e8f0;
      }
      .btn-logout-link {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-muted);
      }
      .btn-logout-link:hover {
        color: var(--color-danger);
      }
    `
  ]
})
export class WaitComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  requestId: string | null = null;
  private pollInterval: any = null;

  displayPhone(): string {
    return (
      this.authService.phone() ||
      sessionStorage.getItem('ob_register_phone') ||
      '9999999999'
    );
  }

  displayEmail(): string {
    return (
      sessionStorage.getItem('ob_register_email') ||
      this.authService.currentUser()?.email ||
      'worker@gmail.com'
    );
  }

  ngOnInit() {
    this.requestId =
      sessionStorage.getItem('ob_register_request_id') ||
      this.authService.currentUser()?.request_id ||
      null;

    // Check status immediately
    this.checkStatusOnce();

    // Start 5 second polling as specified in brief
    this.pollInterval = setInterval(() => {
      this.checkStatusOnce();
    }, 5000);
  }

  checkStatusOnce() {
    // If request_id is known, check GET /register/status/{request_id}
    if (this.requestId) {
      this.apiService.getRegisterStatus(this.requestId).subscribe({
        next: (res) => {
          if (res.status === 'approved') {
            this.handleApproved();
          } else if (res.status === 'rejected') {
            this.handleRejected(res.reason);
          }
        },
        error: () => {
          // Fallback check on GET /auth/me
          this.checkAuthMeFallback();
        }
      });
    } else {
      this.checkAuthMeFallback();
    }
  }

  private checkAuthMeFallback() {
    this.apiService.getAuthMe().subscribe({
      next: (me) => {
        this.authService.setCurrentUser(me);
        if (me.state === 'approved') {
          this.handleApproved();
        } else if (me.state === 'rejected') {
          this.handleRejected(me.reason);
        }
      }
    });
  }

  private handleApproved() {
    const phone = this.displayPhone();
    if (phone) {
      this.authService.setPhone(phone);
    }
    this.toastService.success('Company confirmed! Welcome to Other/Brother.');
    this.cleanup();
    this.router.navigate(['/home']);
  }

  private handleRejected(reason?: string) {
    this.toastService.error(reason || 'Verification rejected by company manager.');
    this.cleanup();
    this.router.navigate(['/rejected']);
  }

  logout() {
    this.cleanup();
    sessionStorage.removeItem('ob_register_phone');
    sessionStorage.removeItem('ob_register_email');
    sessionStorage.removeItem('ob_register_request_id');
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }

  private cleanup() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }
}
