import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { COMPANY_LIST, RegisterRequest } from '../../core/models/api.models';
import { WebcamCaptureComponent } from '../../shared/components/webcam-capture/webcam-capture.component';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher/lang-switcher.component';
import { convertToJpeg } from '../../core/utils/image.util';
import { AppI18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslocoPipe, WebcamCaptureComponent, LangSwitcherComponent],
  template: `
    <div class="reg-page-wrapper">
      <!-- Dev Mode & Language Bar -->
      <div class="dev-bar">
        <label class="dev-toggle">
          <input type="checkbox" [(ngModel)]="devMode" />
          <span>⚡ Developer Mode (Quick Mock URIs)</span>
        </label>
        <div class="dev-bar-right">
          <app-lang-switcher></app-lang-switcher>
          @if (devMode) {
            <button type="button" class="btn-fill-dev" (click)="fillDevMockData()">
              Fill Sample Worker Data & Mock URIs
            </button>
          }
        </div>
      </div>

      <div class="split-container">
        <!-- Left Teal Brand Panel (Matches Mockup 1) -->
        <aside class="stepper-panel">
          <div class="stepper-header">
            <div class="brand-row">
              <span class="logo-icon">🤝</span>
              <span class="brand-text">Other/Brother</span>
            </div>
            <h2 class="stepper-heading">Join as a<br />verified worker</h2>
            <p class="stepper-tagline">When an Other becomes a Brother.</p>
          </div>

          <!-- Vertical Stepper (1 to 5) -->
          <div class="vertical-stepper">
            <!-- Step 1: Phone -->
            <div class="step-item" [class.completed]="currentStep() > 1" [class.active]="currentStep() === 1">
              <div class="step-indicator">
                @if (currentStep() > 1) {
                  <span class="check-icon">✓</span>
                } @else {
                  <span>1</span>
                }
              </div>
              <div class="step-label">{{ 'auth.step_phone' | transloco }}</div>
            </div>

            <!-- Step 2: Payment and Work Details -->
            <div class="step-item" [class.completed]="currentStep() > 2" [class.active]="currentStep() === 2">
              <div class="step-indicator">
                @if (currentStep() > 2) {
                  <span class="check-icon">✓</span>
                } @else {
                  <span>2</span>
                }
              </div>
              <div class="step-label">{{ 'auth.step_work' | transloco }}</div>
            </div>

            <!-- Step 3: Documents -->
            <div class="step-item" [class.completed]="currentStep() > 3" [class.active]="currentStep() === 3">
              <div class="step-indicator">
                @if (currentStep() > 3) {
                  <span class="check-icon">✓</span>
                } @else {
                  <span>3</span>
                }
              </div>
              <div class="step-label">{{ 'auth.step_docs' | transloco }}</div>
            </div>

            <!-- Step 4: Live Selfie -->
            <div class="step-item" [class.completed]="currentStep() > 4" [class.active]="currentStep() === 4">
              <div class="step-indicator">
                @if (currentStep() > 4) {
                  <span class="check-icon">✓</span>
                } @else {
                  <span>4</span>
                }
              </div>
              <div class="step-label">{{ 'auth.step_selfie' | transloco }}</div>
            </div>

            <!-- Step 5: Final Check -->
            <div class="step-item" [class.completed]="currentStep() === 5" [class.active]="currentStep() === 5">
              <div class="step-indicator">
                <span>5</span>
              </div>
              <div class="step-label">{{ 'auth.step_review' | transloco }}</div>
            </div>
          </div>

          <!-- Footer Verification Badge -->
          <div class="stepper-footer">
            <div class="shield-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <div>
                <div class="shield-title">Strict verification.</div>
                <div class="shield-sub">Only real workers get in.</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right White Form Card -->
        <main class="form-card-container">
          <div class="form-card">
            <!-- Progress Bar -->
            <div class="progress-section">
              <div class="step-count">Step {{ currentStep() }} of 5</div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" [style.width.%]="(currentStep() / 5) * 100"></div>
              </div>
            </div>

            <!-- Alert banner for Rejection / Block -->
            @if (errorMessage()) {
              <div class="alert-box alert-error">
                <div class="alert-title">
                  {{ isBlocked() ? 'Account Blocked for 24 Hours' : 'Verification Issue' }}
                </div>
                <p>{{ errorMessage() }}</p>
                @if (attemptsLeft() !== null && !isBlocked()) {
                  <span class="attempts-hint">Attempts remaining: {{ attemptsLeft() }}</span>
                }
              </div>
            }

            <!-- STEP 1: Phone Confirmation -->
            @if (currentStep() === 1) {
              <div class="step-content">
                <h2 class="form-title">Confirm Your Mobile Number</h2>
                <p class="form-subtitle">This phone will be linked to your worker identity and community score.</p>

                <div class="form-group">
                  <label class="field-label">Mobile Number</label>
                  <div class="verified-input-row">
                    <input
                      type="tel"
                      maxlength="10"
                      [(ngModel)]="phone"
                      class="form-control"
                      placeholder="9876543210"
                    />
                    @if (isLoggedIn() && phone === authService.phone()) {
                      <div class="verified-tag">
                        <span>✓</span> Verified
                      </div>
                    }
                  </div>
                  <span class="field-help">Enter your 10-digit mobile number</span>
                </div>

                <div class="form-group">
                  <label class="field-label">Device Identifier</label>
                  <input
                    type="text"
                    [value]="authService.deviceId()"
                    class="form-control text-muted-val"
                    disabled
                  />
                  <span class="field-help">Assigned uniquely to this browser session</span>
                </div>
              </div>
            }

            <!-- STEP 2: Payment and Work Details (Matches Mockup 1) -->
            @if (currentStep() === 2) {
              <div class="step-content">
                <h2 class="form-title">Tell us about your work</h2>
                <p class="form-subtitle">Enter your payout UPI and gig delivery platform details.</p>

                <form [formGroup]="workForm" class="grid-form">
                  <!-- Row 1: Mobile & UPI ID -->
                  <div class="form-row two-col">
                    <div class="form-group">
                      <label class="field-label">Mobile Number</label>
                      <div class="verified-input-row">
                        <input type="text" [value]="phone" class="form-control" disabled />
                        @if (isLoggedIn()) {
                          <span class="verified-tag">✓ Verified</span>
                        }
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="upi_id" class="field-label">UPI ID</label>
                      <input
                        id="upi_id"
                        type="text"
                        formControlName="upi_id"
                        placeholder="9876543210@ybl"
                        class="form-control"
                      />
                      <span class="field-help">{{ 'register.upi_hint' | transloco }}</span>
                    </div>
                  </div>

                  <!-- Row 2: Email & Name on UPI -->
                  <div class="form-row two-col">
                    <div class="form-group">
                      <label for="email" class="field-label">{{ 'register.email_label' | transloco }}</label>
                      <input
                        id="email"
                        type="email"
                        formControlName="email"
                        placeholder="yourname@gmail.com"
                        class="form-control"
                      />
                      <span class="field-help">{{ 'register.email_hint' | transloco }}</span>
                    </div>

                    <div class="form-group">
                      <label for="upi_name" class="field-label">Name on UPI</label>
                      <input
                        id="upi_name"
                        type="text"
                        formControlName="upi_name"
                        placeholder="Ravi Kumar"
                        class="form-control"
                      />
                    </div>
                  </div>

                  <!-- Row 3: Company & Partner ID -->
                  <div class="form-row two-col">
                    <div class="form-group">
                      <label for="company" class="field-label">Company</label>
                      <select id="company" formControlName="company" class="form-control select-control">
                        <option value="" disabled>Select company or platform</option>
                        @for (comp of companyList; track comp) {
                          <option [value]="comp">{{ comp }}</option>
                        }
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="partner_id" class="field-label">Partner / Rider ID</label>
                      <input
                        id="partner_id"
                        type="text"
                        formControlName="partner_id"
                        placeholder="RID-12345"
                        class="form-control"
                      />
                    </div>
                  </div>

                  <!-- Row 4: Name on Platform Profile & Gender -->
                  <div class="form-row two-col">
                    <div class="form-group">
                      <label for="platform_name" class="field-label">Name on Platform Profile</label>
                      <input
                        id="platform_name"
                        type="text"
                        formControlName="platform_name"
                        placeholder="Ravi Kumar"
                        class="form-control"
                      />
                    </div>

                    <div class="form-group">
                      <label class="field-label">{{ 'register.gender_label' | transloco }}</label>
                      <div class="gender-radio-group">
                        <label class="gender-radio-btn" [class.selected]="workForm.value.gender === 'female'">
                          <input type="radio" formControlName="gender" value="female" />
                          <span>🌸 {{ 'register.gender_female' | transloco }}</span>
                        </label>
                        <label class="gender-radio-btn" [class.selected]="workForm.value.gender === 'male'">
                          <input type="radio" formControlName="gender" value="male" />
                          <span>🤝 {{ 'register.gender_male' | transloco }}</span>
                        </label>
                        <label class="gender-radio-btn" [class.selected]="workForm.value.gender === 'other'">
                          <input type="radio" formControlName="gender" value="other" />
                          <span>✨ {{ 'register.gender_other' | transloco }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            }

            <!-- STEP 3: Documents Upload -->
            @if (currentStep() === 3) {
              <div class="step-content">
                <h2 class="form-title">Upload your documents</h2>
                <p class="form-subtitle">{{ 'register.docs_subtitle' | transloco }}</p>

                <!-- Documents Grid (Matches Mockup 1) -->
                <div class="doc-upload-grid">
                  <!-- Doc 1: Government ID -->
                  <div class="doc-card" [class.doc-uploaded]="!!idUri()" [class.doc-skipped]="idSkipped() && !idUri()">
                    <div class="doc-icon">🪪</div>
                    <div class="doc-title">Government ID</div>
                    <span class="doc-opt-badge">Optional</span>
                    @if (idUri()) {
                      <div class="doc-status status-success">
                        <span>✓</span> Read successfully
                      </div>
                      <button type="button" class="doc-skip-btn" (click)="skipDoc('id')">Skip instead</button>
                    } @else if (idSkipped()) {
                      <div class="doc-status status-skipped">Skipped</div>
                      <label class="doc-upload-btn">
                        <input type="file" accept="image/*,.pdf" (change)="onFileSelected($event, 'id')" />
                        <span>Upload ID Photo</span>
                      </label>
                    } @else {
                      <div class="doc-actions">
                        <label class="doc-upload-btn">
                          <input type="file" accept="image/*,.pdf" (change)="onFileSelected($event, 'id')" />
                          <span>Upload ID Photo</span>
                        </label>
                        <button type="button" class="doc-skip-btn" (click)="skipDoc('id')">Skip</button>
                      </div>
                    }
                  </div>

                  <!-- Doc 2: Driving Licence -->
                  <div class="doc-card" [class.doc-uploaded]="!!licenceUri()" [class.doc-skipped]="licenceSkipped() && !licenceUri()">
                    <div class="doc-icon">🚗</div>
                    <div class="doc-title">Driving Licence</div>
                    <span class="doc-opt-badge">Optional</span>
                    @if (licenceUri()) {
                      <div class="doc-status status-success">
                        <span>✓</span> Uploaded
                      </div>
                      <button type="button" class="doc-skip-btn" (click)="skipDoc('licence')">Skip instead</button>
                    } @else if (licenceSkipped()) {
                      <div class="doc-status status-skipped">Skipped</div>
                      <label class="doc-upload-btn">
                        <input type="file" accept="image/*,.pdf" (change)="onFileSelected($event, 'licence')" />
                        <span>Upload Licence</span>
                      </label>
                    } @else {
                      <div class="doc-actions">
                        <label class="doc-upload-btn">
                          <input type="file" accept="image/*,.pdf" (change)="onFileSelected($event, 'licence')" />
                          <span>Upload Licence</span>
                        </label>
                        <button type="button" class="doc-skip-btn" (click)="skipDoc('licence')">Skip</button>
                      </div>
                    }
                  </div>

                  <!-- Doc 3: Vehicle RC -->
                  <div class="doc-card" [class.doc-uploaded]="!!rcUri()" [class.doc-skipped]="rcSkipped() && !rcUri()">
                    <div class="doc-icon">📄</div>
                    <div class="doc-title">Vehicle RC</div>
                    <span class="doc-opt-badge">Optional</span>
                    @if (rcUri()) {
                      <div class="doc-status status-success">
                        <span>✓</span> Uploaded
                      </div>
                      <button type="button" class="doc-skip-btn" (click)="skipDoc('rc')">Skip instead</button>
                    } @else if (rcSkipped()) {
                      <div class="doc-status status-skipped">Skipped</div>
                      <label class="doc-upload-btn">
                        <input type="file" accept="image/*,.pdf" (change)="onFileSelected($event, 'rc')" />
                        <span>Upload RC</span>
                      </label>
                    } @else {
                      <div class="doc-actions">
                        <label class="doc-upload-btn">
                          <input type="file" accept="image/*,.pdf" (change)="onFileSelected($event, 'rc')" />
                          <span>Upload RC</span>
                        </label>
                        <button type="button" class="doc-skip-btn" (click)="skipDoc('rc')">Skip</button>
                      </div>
                    }
                  </div>
                </div>

                <!-- AI Reading Notice Pill -->
                <div class="ai-status-pill">
                  <span class="sparkle">✨</span>
                  <span>AI is reading and verifying your documents</span>
                </div>
              </div>
            }

            <!-- STEP 4: Live Selfie (Strict Camera - No gallery) -->
            @if (currentStep() === 4) {
              <div class="step-content">
                <h2 class="form-title">Live Selfie Verification</h2>
                <p class="form-subtitle">
                  We use live facial recognition to prevent fraud and protect your community account.
                </p>

                <app-webcam-capture (photoCaptured)="onSelfieCaptured($event)"></app-webcam-capture>

                @if (selfieUri()) {
                  <div class="selfie-success-banner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Facial biometric signature recorded</span>
                  </div>
                }
              </div>
            }

            <!-- STEP 5: Final Review & Confirmation -->
            @if (currentStep() === 5) {
              <div class="step-content">
                <h2 class="form-title">Review and Submit</h2>
                <p class="form-subtitle">Review your details before sending them for instant company verification.</p>

                <div class="review-table-card">
                  <div class="review-row">
                    <span class="label">Mobile Number:</span>
                    <span class="val font-mono">+91 {{ phone }}</span>
                  </div>
                  <div class="review-row">
                    <span class="label">{{ 'register.email_label' | transloco }}:</span>
                    <span class="val font-mono">{{ workForm.value.email }}</span>
                  </div>
                  <div class="review-row">
                    <span class="label">Worker Name:</span>
                    <span class="val">{{ workForm.value.upi_name || workForm.value.platform_name }}</span>
                  </div>
                  <div class="review-row">
                    <span class="label">UPI ID:</span>
                    <span class="val">{{ workForm.value.upi_id }}</span>
                  </div>
                  <div class="review-row">
                    <span class="label">Platform / Company:</span>
                    <span class="val highlight-teal">{{ workForm.value.company }}</span>
                  </div>
                  <div class="review-row">
                    <span class="label">Partner / Rider ID:</span>
                    <span class="val">{{ workForm.value.partner_id }}</span>
                  </div>
                  <div class="review-row">
                    <span class="label">{{ 'register.gender_label' | transloco }}:</span>
                    <span class="val">{{ ('register.gender_' + workForm.value.gender) | transloco }}</span>
                  </div>
                  <div class="review-row">
                    <span class="label">Documents & Selfie:</span>
                    <span class="val status-ok">✓ {{ reviewDocsSummary() }}Biometric Selfie Verified</span>
                  </div>
                </div>

                <!-- Terms Checkbox (Mockup 1) -->
                <div class="terms-row">
                  <label class="terms-label">
                    <input type="checkbox" [(ngModel)]="agreedToPolicy" />
                    <span>{{ 'auth.agree_policy' | transloco }}</span>
                  </label>
                </div>
              </div>
            }

            <!-- Bottom Navigation Actions -->
            <div class="form-actions">
              <button
                type="button"
                class="btn-back"
                [disabled]="currentStep() === 1 || isSubmitting()"
                (click)="goBack()"
              >
                {{ 'common.back' | transloco }}
              </button>

              @if (currentStep() < 5) {
                <button
                  type="button"
                  class="btn-continue"
                  [disabled]="!canContinue()"
                  (click)="goNext()"
                >
                  {{ 'common.continue' | transloco }}
                </button>
              } @else {
                <button
                  type="button"
                  class="btn-continue btn-submit"
                  [disabled]="!canContinue()"
                  (click)="submitRegistration()"
                >
                  @if (isSubmitting()) {
                    <span class="spinner"></span>
                    <span>{{ 'auth.submitting_app' | transloco }}</span>
                  } @else {
                    <span>{{ 'auth.submit_app' | transloco }}</span>
                  }
                </button>
              }
            </div>

            <!-- Footer Warning Note (From Mockup 1) -->
            <div class="footer-block-note">
              {{ 'auth.block_note' | transloco }}
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .reg-page-wrapper {
        min-height: 100vh;
        background-color: var(--bg-page);
        display: flex;
        flex-direction: column;
      }
      .dev-bar {
        background: #1e293b;
        color: #f1f5f9;
        padding: 8px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
      }
      .dev-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: #fde047;
        font-weight: 700;
      }
      .btn-fill-dev {
        background: #0f766e;
        color: #ffffff;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: var(--radius-pill);
      }
      .split-container {
        display: flex;
        flex: 1;
        max-width: 1360px;
        margin: 24px auto;
        width: calc(100% - 48px);
        background: #ffffff;
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl);
        overflow: hidden;
        border: 1px solid var(--border-color);
      }
      .stepper-panel {
        width: 380px;
        background: linear-gradient(175deg, #0f766e 0%, #115e59 60%, #042f2e 100%);
        color: #ffffff;
        padding: 44px 36px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .brand-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.15rem;
        font-weight: 800;
        margin-bottom: 24px;
      }
      .stepper-heading {
        font-size: 1.9rem;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 10px;
        color: #ffffff;
      }
      .stepper-tagline {
        font-size: 0.95rem;
        color: #ccfbf1;
        margin-bottom: 36px;
      }
      .vertical-stepper {
        display: flex;
        flex-direction: column;
        gap: 24px;
        position: relative;
      }
      .vertical-stepper::before {
        content: '';
        position: absolute;
        top: 20px;
        bottom: 20px;
        left: 17px;
        width: 2px;
        background: rgba(255, 255, 255, 0.2);
        z-index: 1;
      }
      .step-item {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .step-indicator {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.9rem;
        color: #ffffff;
        transition: all 0.2s;
      }
      .step-item.active .step-indicator {
        background: var(--accent-orange);
        border-color: #ffffff;
        color: #ffffff;
        box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3);
      }
      .step-item.completed .step-indicator {
        background: var(--color-success);
        border-color: var(--color-success);
        color: #ffffff;
      }
      .step-label {
        font-size: 0.95rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7);
      }
      .step-item.active .step-label {
        color: #ffffff;
        font-weight: 800;
      }
      .step-item.completed .step-label {
        color: #ffffff;
      }
      .stepper-footer {
        padding-top: 32px;
      }
      .shield-badge {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(0, 0, 0, 0.15);
        padding: 12px 16px;
        border-radius: var(--radius-md);
      }
      .shield-title {
        font-size: 0.82rem;
        font-weight: 700;
      }
      .shield-sub {
        font-size: 0.75rem;
        color: #ccfbf1;
      }
      .form-card-container {
        flex: 1;
        padding: 48px;
        display: flex;
        flex-direction: column;
      }
      .progress-section {
        margin-bottom: 28px;
      }
      .step-count {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-muted);
        margin-bottom: 8px;
      }
      .progress-bar-track {
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        background: var(--accent-orange);
        transition: width 0.3s ease;
      }
      .form-title {
        font-size: 1.7rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
        margin-bottom: 6px;
      }
      .form-subtitle {
        font-size: 0.95rem;
        color: var(--text-muted);
        margin-bottom: 28px;
      }
      .grid-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
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
      .form-control {
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 11px 14px;
        font-size: 0.95rem;
        font-weight: 500;
        width: 100%;
        outline: none;
        transition: border 0.2s, box-shadow 0.2s;
        background: #ffffff;
      }
      .form-control:focus {
        border-color: var(--primary-teal);
        box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);
      }
      .select-control {
        cursor: pointer;
      }
      .verified-input-row {
        position: relative;
        display: flex;
        align-items: center;
      }
      .verified-tag {
        position: absolute;
        right: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-success-text);
        background: var(--color-success-bg);
        padding: 4px 10px;
        border-radius: var(--radius-pill);
      }
      .gender-radio-group {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .gender-radio-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 12px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        background: #ffffff;
        color: var(--text-main);
        transition: all 0.15s ease;
      }
      .gender-radio-btn input[type="radio"] {
        margin: 0;
        accent-color: var(--primary-teal);
        cursor: pointer;
      }
      .gender-radio-btn.selected {
        border-color: var(--primary-teal);
        background: var(--primary-teal-surface);
        color: var(--primary-teal);
        font-weight: 700;
      }
      .doc-upload-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
        margin-bottom: 24px;
      }
      .doc-card {
        border: 2px dashed var(--border-color);
        border-radius: var(--radius-lg);
        padding: 24px 16px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        transition: all 0.2s;
      }
      .doc-card.doc-uploaded {
        border-color: var(--color-success);
        background: #f0fdf4;
      }
      .doc-card.doc-skipped {
        border-color: #cbd5e1;
        background: #f8fafc;
      }
      .doc-icon {
        font-size: 2rem;
      }
      .doc-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .doc-req-badge {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--primary-teal);
        background: var(--primary-teal-surface);
        padding: 2px 8px;
        border-radius: var(--radius-pill);
      }
      .doc-opt-badge {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: var(--radius-pill);
      }
      .doc-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .doc-skip-btn {
        background: transparent;
        border: none;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-muted);
        text-decoration: underline;
        cursor: pointer;
        padding: 2px 8px;
      }
      .doc-skip-btn:hover {
        color: var(--text-main);
      }
      .doc-status.status-skipped {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted);
        font-size: 0.8rem;
        font-weight: 700;
        background: #e2e8f0;
        padding: 4px 12px;
        border-radius: var(--radius-pill);
      }
      .doc-status.status-success {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--color-success-text);
        font-size: 0.8rem;
        font-weight: 700;
        background: var(--color-success-bg);
        padding: 4px 12px;
        border-radius: var(--radius-pill);
      }
      .doc-upload-btn {
        display: inline-block;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--primary-teal);
        background: var(--primary-teal-surface);
        border: 1px solid var(--primary-teal-border);
        padding: 6px 14px;
        border-radius: var(--radius-pill);
        cursor: pointer;
        transition: background 0.15s;
      }
      .doc-upload-btn:hover {
        background: #ccfbf1;
      }
      .doc-upload-btn input {
        display: none;
      }
      .ai-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #fefce8;
        border: 1px solid #fef08a;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        font-size: 0.85rem;
        font-weight: 600;
        color: #854d0e;
      }
      .selfie-success-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: var(--color-success-bg);
        color: var(--color-success-text);
        padding: 12px 20px;
        border-radius: var(--radius-pill);
        font-weight: 700;
        font-size: 0.9rem;
      }
      .review-table-card {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 24px;
      }
      .review-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.9rem;
      }
      .review-row .label {
        color: var(--text-muted);
        font-weight: 600;
      }
      .review-row .val {
        color: var(--text-main);
        font-weight: 700;
      }
      .highlight-teal {
        color: var(--primary-teal) !important;
      }
      .status-ok {
        color: var(--color-success-text) !important;
      }
      .terms-row {
        margin-bottom: 24px;
      }
      .terms-label {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-main);
        cursor: pointer;
      }
      .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 24px;
        border-top: 1px solid var(--border-color);
      }
      .btn-back {
        padding: 11px 24px;
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 0.92rem;
        background: #f1f5f9;
        color: var(--text-muted);
        transition: all 0.15s;
      }
      .btn-back:hover:not(:disabled) {
        background: #e2e8f0;
        color: var(--text-main);
      }
      .btn-back:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .btn-continue {
        padding: 12px 32px;
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 0.95rem;
        background: var(--primary-teal);
        color: #ffffff;
        transition: background 0.15s, transform 0.1s;
      }
      .btn-continue:hover:not(:disabled) {
        background: var(--primary-teal-hover);
        transform: translateY(-1px);
      }
      .btn-continue:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .btn-submit {
        background: var(--accent-orange);
      }
      .btn-submit:hover:not(:disabled) {
        background: var(--accent-orange-hover);
      }
      .footer-block-note {
        text-align: center;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-danger);
        margin-top: 16px;
      }
      .alert-box {
        padding: 14px 18px;
        border-radius: var(--radius-md);
        margin-bottom: 20px;
      }
      .alert-error {
        background: var(--color-danger-bg);
        border: 1px solid #fecaca;
        color: var(--color-danger-text);
      }
      .alert-title {
        font-weight: 800;
        font-size: 0.95rem;
        margin-bottom: 4px;
      }
      .attempts-hint {
        display: inline-block;
        margin-top: 6px;
        font-weight: 700;
        font-size: 0.8rem;
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
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 900px) {
        .split-container {
          flex-direction: column;
          margin: 12px;
          width: calc(100% - 24px);
        }
        .stepper-panel {
          width: 100%;
          padding: 24px;
        }
        .form-card-container {
          padding: 24px;
        }
        .two-col {
          grid-template-columns: 1fr;
        }
        .doc-upload-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class RegisterComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private i18nService = inject(AppI18nService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  phone = '';
  currentStep = signal(1);
  devMode = false;
  companyList = COMPANY_LIST;

  workForm!: FormGroup;

  idUri = signal<string>('');
  licenceUri = signal<string>('');
  rcUri = signal<string>('');
  selfieUri = signal<string>('');
  idSkipped = signal<boolean>(false);
  licenceSkipped = signal<boolean>(false);
  rcSkipped = signal<boolean>(false);

  isUploading = signal<boolean>(false);
  failedUploads = signal<Set<string>>(new Set());

  agreedToPolicy = false;
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  attemptsLeft = signal<number | null>(null);
  isBlocked = signal(false);

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit() {
    const navState = history.state?.phone;
    const qParam = this.route.snapshot.queryParams['phone'];
    const isPendingReg = this.authService.currentUser()?.state === 'not_registered';
    this.phone = navState || qParam || (isPendingReg ? this.authService.phone() || '' : '');

    this.workForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
        ]
      ],
      upi_id: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/)
        ]
      ],
      upi_name: ['', [Validators.required]],
      company: ['Demo Foods Ltd', [Validators.required]],
      platform_name: ['', [Validators.required]],
      partner_id: ['', [Validators.required]],
      gender: ['male', [Validators.required]]
    });
  }

  fillDevMockData() {
    this.phone = '9876543210';
    this.workForm.patchValue({
      email: 'ravi.kumar@gmail.com',
      upi_id: '9876543210@ybl',
      upi_name: 'Ravi Kumar',
      company: 'Demo Foods Ltd',
      platform_name: 'Ravi Kumar',
      partner_id: 'RID-12345',
      gender: 'male'
    });

    // URIs from PDF section 7
    this.idUri.set('mock://id/Ravi Kumar/123412341234/none');
    this.licenceUri.set('mock://licence/Ravi Kumar/KA0120250001/2030-12-31');
    this.rcUri.set('mock://rc/Ravi Kumar/KA01AB1234/2035-01-01');
    this.selfieUri.set('mock://selfie/Ravi Kumar');
    this.idSkipped.set(false);
    this.licenceSkipped.set(false);
    this.rcSkipped.set(false);
    this.agreedToPolicy = true;

    this.toastService.info('Developer mock URIs loaded!');
  }

  private getUploadAuthHeader(): string | undefined {
    if (this.authService.isAuthenticated()) {
      return undefined;
    }
    const cleanPhone = this.phone.trim().replace(/\D/g, '').slice(-10);
    return cleanPhone ? `Bearer demo:${cleanPhone}` : undefined;
  }

  private extractServerErrorMessage(err: any): string {
    let message = 'Upload failed. Please try again.';
    if (!err) return message;
    if (typeof err === 'string') {
      message = err;
    } else if (err.error) {
      if (typeof err.error === 'string') {
        message = err.error;
      } else if (err.error.detail) {
        message = typeof err.error.detail === 'string'
          ? err.error.detail
          : JSON.stringify(err.error.detail);
      } else if (err.error.reason) {
        message = err.error.reason;
      } else if (err.error.message) {
        message = err.error.message;
      }
    } else if (err.statusText) {
      message = `${err.status ? err.status + ' ' : ''}${err.statusText}`.trim();
    } else if (err.message) {
      message = err.message;
    }
    return this.i18nService.translateApiError(message) || message;
  }

  skipDoc(kind: 'id' | 'licence' | 'rc') {
    this.failedUploads.update((s) => {
      const next = new Set(s);
      next.delete(kind);
      return next;
    });
    if (kind === 'id') {
      this.idUri.set('');
      this.idSkipped.set(true);
    } else if (kind === 'licence') {
      this.licenceUri.set('');
      this.licenceSkipped.set(true);
    } else {
      this.rcUri.set('');
      this.rcSkipped.set(true);
    }
  }

  async onFileSelected(event: Event, kind: 'id' | 'licence' | 'rc') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const rawFile = input.files[0];
    this.toastService.info(`Uploading ${kind}...`);
    this.isUploading.set(true);
    this.failedUploads.update((s) => {
      const next = new Set(s);
      next.delete(kind);
      return next;
    });

    try {
      const convertedBlob = await convertToJpeg(rawFile);
      const filename = rawFile.name.toLowerCase().endsWith('.pdf') ? rawFile.name : `${kind}.jpg`;

      this.apiService.upload(kind, convertedBlob, filename, this.getUploadAuthHeader()).subscribe({
        next: (res) => {
          this.isUploading.set(false);
          this.failedUploads.update((s) => {
            const next = new Set(s);
            next.delete(kind);
            return next;
          });
          if (kind === 'id') {
            this.idSkipped.set(false);
            this.idUri.set(res.uri);
          }
          if (kind === 'licence') {
            this.licenceSkipped.set(false);
            this.licenceUri.set(res.uri);
          }
          if (kind === 'rc') {
            this.rcSkipped.set(false);
            this.rcUri.set(res.uri);
          }
          this.toastService.success(`${kind.toUpperCase()} uploaded successfully`);
        },
        error: (err) => {
          this.isUploading.set(false);
          this.failedUploads.update((s) => new Set(s).add(kind));
          if (kind === 'id') this.idUri.set('');
          if (kind === 'licence') this.licenceUri.set('');
          if (kind === 'rc') this.rcUri.set('');
          console.error(`Upload ${kind} failed:`, err);
          const errorMsg = this.extractServerErrorMessage(err);
          this.toastService.error(errorMsg);
          input.value = '';
        }
      });
    } catch (err) {
      this.isUploading.set(false);
      this.failedUploads.update((s) => new Set(s).add(kind));
      if (kind === 'id') this.idUri.set('');
      if (kind === 'licence') this.licenceUri.set('');
      if (kind === 'rc') this.rcUri.set('');
      console.error(`Error converting ${kind} photo:`, err);
      const errorMsg = this.extractServerErrorMessage(err);
      this.toastService.error(errorMsg);
      input.value = '';
    }
  }

  async onSelfieCaptured(blob: Blob) {
    this.toastService.info('Uploading live selfie biometric...');
    this.isUploading.set(true);
    this.selfieUri.set('');
    this.failedUploads.update((s) => {
      const next = new Set(s);
      next.delete('selfie');
      return next;
    });

    try {
      const convertedBlob = await convertToJpeg(blob);
      this.apiService.upload('selfie', convertedBlob, 'selfie.jpg', this.getUploadAuthHeader()).subscribe({
        next: (res) => {
          this.isUploading.set(false);
          this.failedUploads.update((s) => {
            const next = new Set(s);
            next.delete('selfie');
            return next;
          });
          this.selfieUri.set(res.uri);
          this.toastService.success('Live selfie captured and verified!');
        },
        error: (err) => {
          this.isUploading.set(false);
          this.selfieUri.set('');
          this.failedUploads.update((s) => new Set(s).add('selfie'));
          console.error('Selfie upload error:', err);
          const errorMsg = this.extractServerErrorMessage(err);
          this.toastService.error(errorMsg);
        }
      });
    } catch (err) {
      this.isUploading.set(false);
      this.selfieUri.set('');
      this.failedUploads.update((s) => new Set(s).add('selfie'));
      console.error('Selfie conversion error:', err);
      const errorMsg = this.extractServerErrorMessage(err);
      this.toastService.error(errorMsg);
    }
  }

  reviewDocsSummary(): string {
    const docs: string[] = [];
    if (this.idUri() && !this.idSkipped()) docs.push('Gov ID');
    if (this.licenceUri() && !this.licenceSkipped()) docs.push('Licence');
    if (this.rcUri() && !this.rcSkipped()) docs.push('RC');
    if (docs.length > 0) {
      return docs.join(', ') + ' + ';
    }
    return '';
  }

  canContinue(): boolean {
    const s = this.currentStep();
    if (s === 1) return /^[0-9]{10}$/.test(this.phone.trim());
    if (s === 2) return this.workForm.valid;
    if (s === 3) {
      if (this.isUploading()) return false;
      const failed = this.failedUploads();
      if (failed.has('id') || failed.has('licence') || failed.has('rc')) return false;
      return true;
    }
    if (s === 4) {
      if (this.isUploading()) return false;
      if (this.failedUploads().has('selfie')) return false;
      return !!this.selfieUri();
    }
    if (s === 5) return this.agreedToPolicy && !this.isSubmitting() && !this.isBlocked();
    return true;
  }

  goNext() {
    if (this.canContinue() && this.currentStep() < 5) {
      this.currentStep.update((s) => s + 1);
    }
  }

  goBack() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  submitRegistration() {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const cleanPhone = this.phone.trim().replace(/\D/g, '').slice(-10);
    const cleanEmail = (this.workForm.value.email || '').trim().toLowerCase();
    const cleanUpi = (this.workForm.value.upi_id || '').trim().toLowerCase();

    const payload: RegisterRequest = {
      phone: cleanPhone,
      email: cleanEmail,
      device_id: this.authService.deviceId(),
      upi_id: cleanUpi,
      upi_name: this.workForm.value.upi_name?.trim(),
      platform_name: this.workForm.value.platform_name?.trim(),
      company: this.workForm.value.company,
      partner_id: this.workForm.value.partner_id?.trim(),
      gender: this.workForm.value.gender || 'male',
      ...(this.idUri() && !this.idSkipped() ? { id_uri: this.idUri() } : {}),
      ...(this.licenceUri() && !this.licenceSkipped() ? { licence_uri: this.licenceUri() } : {}),
      ...(this.rcUri() && !this.rcSkipped() ? { rc_uri: this.rcUri() } : {}),
      selfie_uri: this.selfieUri()
    };

    this.apiService.register(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.status === 'awaiting_company') {
          this.authService.setPhone(cleanPhone);
          sessionStorage.setItem('ob_register_phone', cleanPhone);
          sessionStorage.setItem('ob_register_email', cleanEmail);
          if (res.request_id) {
            sessionStorage.setItem('ob_register_request_id', res.request_id);
          }
          this.toastService.success('Registration submitted! Awaiting company confirmation.');
          this.router.navigate(['/wait']);
        } else {
          // Rejection
          this.handleRejection(res);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Registration failed:', err);
        const errorData = err.error || {};
        this.handleRejection(errorData);
      }
    });
  }

  private handleRejection(res: any) {
    const reason = res.reason || res.detail || 'Verification rejected by AI compliance engine.';
    this.errorMessage.set(reason);

    if (res.attempts_left !== undefined) {
      this.attemptsLeft.set(res.attempts_left);
    }

    if (res.failed_layer === 'blocked' || (res.attempts_left !== undefined && res.attempts_left <= 0)) {
      this.isBlocked.set(true);
      this.errorMessage.set('Account blocked for 24 hours due to 3 failed verification attempts.');
    }
  }
}
