import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher/lang-switcher.component';
import { BgVideoComponent } from '../../shared/components/bg-video/bg-video.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslocoPipe, LangSwitcherComponent, BgVideoComponent],
  template: `
    <div class="auth-split-page">
      <!-- Left Brand Panel -->
      <div class="brand-panel">
        <app-bg-video
          overlayVariant="teal"
          [breakpoint]="900"
          [showPosterOnReducedMotion]="true"
        ></app-bg-video>

        <div class="brand-panel-inner">
          <div class="brand-header">
            <div class="brand-icon">🤝</div>
            <h1 class="brand-title">{{ 'app.title' | transloco }}</h1>
          </div>

          <div class="brand-hero">
            <h2 class="hero-tagline">{{ 'app.tagline' | transloco }}</h2>
            <p class="hero-subtext">
              {{ 'app.subtext' | transloco }}
            </p>
          </div>

          <div class="brand-features">
            <div class="feat-item">
              <span class="feat-check">✓</span>
              <span>{{ 'auth.feat_ai_claims' | transloco }}</span>
            </div>
            <div class="feat-item">
              <span class="feat-check">✓</span>
              <span>{{ 'auth.feat_pool' | transloco }}</span>
            </div>
            <div class="feat-item">
              <span class="feat-check">✓</span>
              <span>{{ 'auth.feat_trust' | transloco }}</span>
            </div>
            <div class="feat-item">
              <span class="feat-check">✓</span>
              <span>{{ 'auth.feat_schemes' | transloco }}</span>
            </div>
          </div>

          <div class="brand-footer">
            <span>{{ 'app.verified_network' | transloco }}</span>
          </div>
        </div>
      </div>

      <!-- Right Form Card -->
      <div class="form-panel">
        <div class="login-lang-bar">
          <app-lang-switcher></app-lang-switcher>
        </div>
        <div class="auth-card">
          <div class="card-header">
            <h2 class="card-title">{{ 'auth.login_title' | transloco }}</h2>
            <p class="card-desc">{{ 'auth.login_desc' | transloco }}</p>
          </div>

          @if (step() === 'phone') {
            <!-- Phone Input Step -->
            <form (ngSubmit)="sendOtp()" class="auth-form">
              <div class="form-group">
                <label for="phone" class="input-label">{{ 'auth.phone_label' | transloco }}</label>
                <div class="phone-input-wrapper">
                  <span class="country-prefix">+91</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    maxlength="10"
                    [(ngModel)]="phone"
                    placeholder="9000000001"
                    class="form-control phone-input"
                    required
                    pattern="[0-9]{10}"
                    autocomplete="tel-national"
                  />
                </div>
                <span class="hint-text">{{ 'auth.phone_hint' | transloco }}</span>
              </div>

              <button
                type="submit"
                class="btn-primary"
                [disabled]="!isValidPhone() || isLoading()"
              >
                @if (isLoading()) {
                  <span class="spinner"></span>
                  <span>{{ 'common.loading' | transloco }}</span>
                } @else {
                  <span>{{ 'auth.get_otp' | transloco }} →</span>
                }
              </button>

              <button
                type="button"
                class="btn-secondary-register"
                (click)="goToRegister()"
              >
                {{ 'auth.new_here_register' | transloco }}
              </button>
            </form>

            <!-- Test Accounts Quick Fill (From Brief) -->
            <div class="test-accounts-section">
              <div class="test-title">{{ 'auth.demo_accounts_title' | transloco }}</div>
              <div class="accounts-grid">
                <button
                  type="button"
                  class="demo-account-chip chip-approved"
                  (click)="setTestAccount('9000000001')"
                >
                  <span class="demo-role">Approved (Ravi, 82 pts)</span>
                  <span class="demo-phone">9000000001</span>
                </button>
                <button
                  type="button"
                  class="demo-account-chip chip-approved"
                  (click)="setTestAccount('9000000002')"
                >
                  <span class="demo-role">Approved (Priya, 90 pts)</span>
                  <span class="demo-phone">9000000002</span>
                </button>
                <button
                  type="button"
                  class="demo-account-chip chip-approved"
                  (click)="setTestAccount('9000000003')"
                >
                  <span class="demo-role">Approved (Amit, 35 pts)</span>
                  <span class="demo-phone">9000000003</span>
                </button>
                <button
                  type="button"
                  class="demo-account-chip chip-waiting"
                  (click)="setTestAccount('9000000011')"
                >
                  <span class="demo-role">Awaiting (Kavita)</span>
                  <span class="demo-phone">9000000011</span>
                </button>
                <button
                  type="button"
                  class="demo-account-chip chip-new"
                  (click)="setTestAccount('9999999999')"
                >
                  <span class="demo-role">{{ 'auth.new_reg_role' | transloco }}</span>
                  <span class="demo-phone">9999999999</span>
                </button>
              </div>
            </div>
          } @else {
            <!-- Dummy OTP Step -->
            <form (ngSubmit)="verifyOtpAndRoute()" class="auth-form">
              <div class="otp-banner">
                <span>{{ 'auth.otp_sent_to' | transloco: { phone: phone } }}</span>
                <button type="button" class="change-phone-btn" (click)="step.set('phone')">{{ 'auth.change_phone' | transloco }}</button>
              </div>

              <div class="form-group">
                <label for="otp" class="input-label">{{ 'auth.enter_otp' | transloco }}</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxlength="6"
                  [(ngModel)]="otp"
                  placeholder="123456"
                  class="form-control otp-input"
                  required
                  autofocus
                />
                <span class="hint-text">{{ 'auth.otp_demo_hint' | transloco }}</span>
              </div>

              <button
                type="submit"
                class="btn-primary"
                [disabled]="otp.length < 4 || isLoading()"
              >
                @if (isLoading()) {
                  <span class="spinner"></span>
                  <span>{{ 'auth.verifying' | transloco }}</span>
                } @else {
                  <span>{{ 'auth.verify_enter' | transloco }}</span>
                }
              </button>

              <button
                type="button"
                class="btn-text"
                (click)="step.set('phone')"
                [disabled]="isLoading()"
              >
                ← {{ 'auth.change_phone' | transloco }}
              </button>
            </form>
          }

          <div class="card-notice">
            {{ 'auth.verification_notice' | transloco }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-split-page {
        min-height: 100vh;
        display: flex;
        background-color: var(--bg-page);
      }
      .brand-panel {
        flex: 1;
        max-width: 540px;
        background: linear-gradient(135deg, #0f766e 0%, #042f2e 100%);
        color: #ffffff;
        padding: 56px 48px;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
      }
      .brand-panel-inner {
        position: relative;
        z-index: 2;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .brand-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .brand-icon {
        font-size: 2.2rem;
      }
      .brand-title {
        font-size: 1.8rem;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .brand-hero {
        margin: 40px 0;
      }
      .hero-tagline {
        font-size: 2.2rem;
        font-weight: 800;
        line-height: 1.25;
        margin-bottom: 16px;
        color: #f0fdfa;
      }
      .hero-subtext {
        font-size: 1.05rem;
        color: #ccfbf1;
        line-height: 1.6;
        opacity: 0.9;
      }
      .brand-features {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 40px;
      }
      .feat-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.95rem;
        color: #e6fffa;
      }
      .feat-check {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(20, 184, 166, 0.3);
        border: 1px solid #14b8a6;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.8rem;
        flex-shrink: 0;
      }
      .brand-footer {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.85rem;
        color: #99f6e4;
      }
      .portal-link {
        color: #ffffff;
        font-weight: 700;
        text-decoration: underline;
      }
      .form-panel {
        flex: 1.2;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
      }
      .login-lang-bar {
        width: 100%;
        max-width: 480px;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }
      .auth-card {
        width: 100%;
        max-width: 480px;
        background: #ffffff;
        border-radius: var(--radius-xl);
        padding: 40px;
        box-shadow: var(--shadow-xl);
        border: 1px solid var(--border-color);
      }
      .card-header {
        margin-bottom: 28px;
      }
      .card-title {
        font-size: 1.65rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
        margin-bottom: 8px;
      }
      .card-desc {
        font-size: 0.92rem;
        color: var(--text-muted);
        line-height: 1.4;
      }
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .input-label {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .phone-input-wrapper {
        display: flex;
        align-items: center;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--bg-input);
        overflow: hidden;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .phone-input-wrapper:focus-within {
        border-color: var(--primary-teal);
        box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);
      }
      .country-prefix {
        padding: 12px 14px;
        background: var(--bg-card-subtle);
        border-right: 1px solid var(--border-color);
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-muted);
      }
      .phone-input {
        border: none;
        outline: none;
        padding: 12px 14px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        width: 100%;
      }
      .otp-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--primary-teal-surface);
        border: 1px solid var(--primary-teal-border);
        padding: 10px 14px;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        color: var(--primary-teal);
      }
      .change-phone-btn {
        font-weight: 700;
        color: var(--primary-teal);
        text-decoration: underline;
      }
      .otp-input {
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-align: center;
        outline: none;
      }
      .otp-input:focus {
        border-color: var(--primary-teal);
        box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);
      }
      .hint-text {
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .btn-primary {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 700;
        font-size: 1rem;
        padding: 13px;
        border-radius: var(--radius-md);
        transition: background 0.15s, transform 0.1s;
      }
      .btn-primary:hover:not(:disabled) {
        background: var(--primary-teal-hover);
        transform: translateY(-1px);
      }
      .btn-primary:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .btn-secondary-register {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        background: var(--primary-teal-surface);
        border: 1.5px solid var(--primary-teal);
        color: var(--primary-teal);
        font-weight: 700;
        font-size: 0.95rem;
        padding: 12px;
        border-radius: var(--radius-md);
        margin-top: 10px;
        transition: all 0.15s ease;
        cursor: pointer;
      }
      .btn-secondary-register:hover {
        background: var(--primary-teal);
        color: #ffffff;
      }
      .btn-text {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-muted);
        text-align: center;
        padding: 6px;
      }
      .btn-text:hover {
        color: var(--text-main);
      }
      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .test-accounts-section {
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px dashed var(--border-color);
      }
      .test-title {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .accounts-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 6px;
      }
      .demo-account-chip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        background: var(--bg-card-subtle);
        font-size: 0.82rem;
        transition: all 0.15s;
        text-align: left;
      }
      .demo-account-chip:hover {
        background: #ffffff;
        border-color: var(--primary-teal);
        transform: translateX(2px);
      }
      .demo-role {
        font-weight: 600;
        color: var(--text-main);
      }
      .demo-phone {
        font-family: var(--font-mono);
        color: var(--text-muted);
        font-weight: 700;
      }
      .chip-approved {
        border-left: 4px solid var(--color-success);
      }
      .chip-waiting {
        border-left: 4px solid var(--color-warning);
      }
      .chip-new {
        border-left: 4px solid var(--accent-orange);
      }
      .card-notice {
        margin-top: 24px;
        font-size: 0.75rem;
        color: var(--text-muted);
        line-height: 1.4;
        text-align: center;
      }

      @media (prefers-reduced-motion: reduce) {
        .brand-bg-video {
          display: none !important;
        }
      }

      @media (max-width: 900px) {
        .brand-bg-video,
        .brand-bg-poster {
          display: none !important;
        }
        .auth-split-page {
          flex-direction: column;
        }
        .brand-panel {
          max-width: 100%;
          padding: 32px 24px;
        }
        .brand-features {
          display: none;
        }
      }
    `
  ]
})
export class LoginComponent {
  authService = inject(AuthService);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  phone = '';
  otp = '123456';
  step = signal<'phone' | 'otp'>('phone');
  isLoading = signal(false);

  isValidPhone(): boolean {
    return /^[0-9]{10}$/.test(this.phone.trim());
  }

  setTestAccount(phoneNumber: string) {
    this.phone = phoneNumber;
  }

  goToRegister() {
    this.authService.clearSession();
    sessionStorage.removeItem('ob_register_phone');
    sessionStorage.removeItem('ob_register_email');
    sessionStorage.removeItem('ob_register_request_id');
    this.router.navigate(['/register']);
  }

  sendOtp() {
    if (!this.isValidPhone()) return;
    this.authService.setPhone(this.phone);
    this.step.set('otp');
  }

  verifyOtpAndRoute() {
    if (!this.phone) return;
    this.isLoading.set(true);
    this.authService.setPhone(this.phone);

    // Call GET /auth/me to inspect state
    this.apiService.getAuthMe().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.authService.setCurrentUser(response);

        this.toastService.success(`Welcome back! State: ${response.state}`);

        switch (response.state) {
          case 'approved':
            this.router.navigate(['/home']);
            break;
          case 'awaiting_company':
            this.router.navigate(['/wait']);
            break;
          case 'rejected':
            this.router.navigate(['/rejected']);
            break;
          case 'not_registered':
            this.router.navigate(['/register']);
            break;
          default:
            this.router.navigate(['/register']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Auth verification error:', err);
        // If error suggests not registered or 404, route to register
        if (err.status === 404 || err.status === 400) {
          this.router.navigate(['/register']);
        } else {
          this.toastService.error('Failed to verify session. Check network or phone.');
        }
      }
    });
  }
}
