import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { ToastService } from '../../core/services/toast.service';
import { generateQrMatrix } from './qr-code.util';

@Component({
  selector: 'app-upi-pay',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  template: `
    <div class="upi-payment-card">
      <div class="upi-header-row">
        <div class="upi-payee-info">
          <span class="payee-label">{{ 'upi.pay_via_upi' | transloco: { name: name || 'Brother' } }}</span>
          <span class="payee-amount">₹{{ amount | number }}</span>
        </div>
        <span class="upi-tag">{{ 'upi.direct_upi' | transloco }}</span>
      </div>

      <!-- Payment disclaimer note (Requirement 9) -->
      <div class="upi-disclaimer-note">
        ℹ️ {{ 'upi.payment_disclaimer' | transloco }}
      </div>

      <!-- Primary Direct Tap Pay Now Link & Manual Confirmation Button -->
      <div class="primary-actions-row">
        <a
          [href]="safeUpiLink"
          class="btn-pay-now"
          aria-label="Pay now with UPI app"
        >
          <span>📲</span>
          <span>{{ 'upi.pay_now' | transloco: { amount: amount } }}</span>
        </a>

        <button
          type="button"
          class="btn-sent-money"
          [disabled]="isProcessing"
          (click)="moneySent.emit()"
        >
          @if (isProcessing) {
            <span class="spinner"></span>
            <span>{{ 'common.updating' | transloco }}</span>
          } @else {
            <span>{{ 'upi.sent_money_confirm' | transloco }}</span>
          }
        </button>
      </div>

      <!-- iOS Specific App Deep Links (gpay, phonepe, paytmmp) -->
      @if (isIosDevice() || showIosLinks()) {
        <div class="ios-upi-apps">
          <span class="ios-apps-label">{{ 'upi.open_ios_app' | transloco }}</span>
          <div class="ios-buttons-group">
            <a [href]="safeGpayLink" class="btn-ios-app">GPay</a>
            <a [href]="safePhonepeLink" class="btn-ios-app">PhonePe</a>
            <a [href]="safePaytmLink" class="btn-ios-app">Paytm</a>
          </div>
        </div>
      } @else {
        <div class="ios-toggle-row">
          <button type="button" class="btn-link-subtle" (click)="showIosLinks.set(true)">
            {{ 'upi.show_ios_links' | transloco }}
          </button>
        </div>
      }

      <!-- Desktop Section: UPI ID Copy + Scannable QR Code -->
      <div class="desktop-upi-panel">
        <div class="upi-copy-box">
          <div class="upi-id-details">
            <span class="upi-id-label">UPI ID</span>
            <code class="upi-id-code">{{ upi || 'Not provided' }}</code>
          </div>
          <button
            type="button"
            class="btn-copy-upi"
            [disabled]="!upi"
            (click)="copyUpiId()"
          >
            {{ copied() ? ('common.copied' | transloco) : ('upi.copy_upi_id' | transloco) }}
          </button>
        </div>

        @if (qrMatrix().length > 0) {
          <div class="qr-box">
            <svg
              [attr.viewBox]="'0 0 ' + (qrMatrix().length + 4) + ' ' + (qrMatrix().length + 4)"
              class="qr-svg"
              role="img"
              aria-label="UPI Payment QR Code"
            >
              <rect
                x="0"
                y="0"
                [attr.width]="qrMatrix().length + 4"
                [attr.height]="qrMatrix().length + 4"
                fill="#ffffff"
              />
              @for (row of qrMatrix(); track rIdx; let rIdx = $index) {
                @for (cell of row; track cIdx; let cIdx = $index) {
                  @if (cell) {
                    <rect
                      [attr.x]="cIdx + 2"
                      [attr.y]="rIdx + 2"
                      width="1"
                      height="1"
                      fill="#0f172a"
                    />
                  }
                }
              }
            </svg>
            <span class="qr-caption">{{ 'upi.scan_qr' | transloco }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .upi-payment-card {
        background: var(--bg-card-subtle);
        border: 1.5px solid var(--primary-teal-border);
        border-radius: var(--radius-lg);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-top: 10px;
      }
      .upi-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .upi-payee-info {
        display: flex;
        flex-direction: column;
      }
      .payee-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
      }
      .payee-amount {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .upi-tag {
        font-size: 0.75rem;
        font-weight: 800;
        background: var(--primary-teal-surface);
        color: var(--primary-teal);
        border: 1px solid var(--primary-teal-border);
        padding: 4px 10px;
        border-radius: var(--radius-pill);
      }
      .upi-disclaimer-note {
        font-size: 0.78rem;
        color: var(--text-muted);
        background: #f8fafc;
        border: 1px dashed var(--border-color);
        border-radius: var(--radius-md);
        padding: 8px 12px;
        line-height: 1.4;
      }
      .primary-actions-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .btn-pay-now {
        flex: 1;
        min-width: 150px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 800;
        font-size: 0.92rem;
        padding: 11px 16px;
        border-radius: var(--radius-md);
        text-decoration: none;
        transition: background 0.15s;
      }
      .btn-pay-now:hover {
        background: var(--primary-teal-hover);
        text-decoration: none;
      }
      .btn-sent-money {
        flex: 1;
        min-width: 150px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: var(--color-success);
        color: #ffffff;
        font-weight: 800;
        font-size: 0.92rem;
        padding: 11px 16px;
        border-radius: var(--radius-md);
        transition: opacity 0.15s;
      }
      .btn-sent-money:hover:not(:disabled) {
        opacity: 0.92;
      }
      .btn-sent-money:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .ios-upi-apps {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        padding: 8px 12px;
        border-radius: var(--radius-md);
      }
      .ios-apps-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-muted);
      }
      .ios-buttons-group {
        display: flex;
        gap: 6px;
      }
      .btn-ios-app {
        font-size: 0.78rem;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: var(--radius-sm);
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        color: var(--text-main);
        text-decoration: none;
      }
      .btn-ios-app:hover {
        border-color: var(--primary-teal);
        color: var(--primary-teal);
        text-decoration: none;
      }
      .ios-toggle-row {
        display: flex;
      }
      .btn-link-subtle {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--text-muted);
        text-decoration: underline;
      }
      .desktop-upi-panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 12px 14px;
      }
      .upi-copy-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }
      .upi-id-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .upi-id-label {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .upi-id-code {
        font-family: var(--font-mono);
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-main);
        word-break: break-all;
      }
      .btn-copy-upi {
        align-self: flex-start;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        color: var(--text-main);
        font-size: 0.78rem;
        font-weight: 700;
        padding: 6px 12px;
        border-radius: var(--radius-sm);
        transition: all 0.15s;
      }
      .btn-copy-upi:hover:not(:disabled) {
        border-color: var(--primary-teal);
        color: var(--primary-teal);
      }
      .qr-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
      .qr-svg {
        width: 112px;
        height: 112px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        background: #ffffff;
      }
      .qr-caption {
        font-size: 0.68rem;
        font-weight: 600;
        color: var(--text-muted);
      }
      .spinner {
        width: 14px;
        height: 14px;
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

      @media (max-width: 640px) {
        .desktop-upi-panel {
          flex-direction: column;
          align-items: stretch;
        }
        .qr-box {
          align-self: center;
        }
      }
    `
  ]
})
export class UpiPayComponent implements OnChanges {
  private sanitizer = inject(DomSanitizer);
  private toastService = inject(ToastService);

  @Input({ required: true }) upi = '';
  @Input({ required: true }) name = '';
  @Input({ required: true }) amount = 0;
  @Input() isProcessing = false;

  @Output() moneySent = new EventEmitter<void>();

  copied = signal(false);
  isIosDevice = signal(this.detectIos());
  showIosLinks = signal(false);
  qrMatrix = signal<boolean[][]>([]);

  rawUpiLink = '';
  safeUpiLink: SafeUrl = '';
  safeGpayLink: SafeUrl = '';
  safePhonepeLink: SafeUrl = '';
  safePaytmLink: SafeUrl = '';

  ngOnChanges() {
    this.buildLinksAndQr();
  }

  private buildLinksAndQr() {
    const pa = encodeURIComponent(this.upi || '');
    const pn = encodeURIComponent(this.name || 'Worker');
    const am = encodeURIComponent(String(this.amount || 0));
    const cu = encodeURIComponent('INR');
    const tn = encodeURIComponent('Other/Brother');

    const query = `pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}`;

    this.rawUpiLink = `upi://pay?${query}`;
    this.safeUpiLink = this.sanitizer.bypassSecurityTrustUrl(this.rawUpiLink);
    this.safeGpayLink = this.sanitizer.bypassSecurityTrustUrl(`gpay://upi/pay?${query}`);
    this.safePhonepeLink = this.sanitizer.bypassSecurityTrustUrl(`phonepe://pay?${query}`);
    this.safePaytmLink = this.sanitizer.bypassSecurityTrustUrl(`paytmmp://pay?${query}`);

    if (this.upi) {
      try {
        this.qrMatrix.set(generateQrMatrix(this.rawUpiLink));
      } catch {
        this.qrMatrix.set([]);
      }
    } else {
      this.qrMatrix.set([]);
    }
  }

  copyUpiId() {
    if (!this.upi) return;
    navigator.clipboard?.writeText(this.upi).then(
      () => {
        this.copied.set(true);
        this.toastService.success('UPI ID copied to clipboard');
        setTimeout(() => this.copied.set(false), 2000);
      },
      () => {
        this.toastService.info(`UPI ID: ${this.upi}`);
      }
    );
  }

  private detectIos(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isIpadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return /iPad|iPhone|iPod/.test(ua) || isIpadOS;
  }
}
