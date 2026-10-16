import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { TrustService } from '../../../core/services/trust.service';
import { AudioPlayerComponent } from '../../../shared/components/audio-player/audio-player.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ClaimCreateRequest, ClaimCreateResponse } from '../../../core/models/api.models';
import { convertToJpeg } from '../../../core/utils/image.util';

@Component({
  selector: 'app-claim-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslocoPipe, AudioPlayerComponent, BadgeComponent],
  template: `
    <div class="claim-submit-page animate-fade-in">
      <!-- AI Status Banner (Mockup 4) -->
      @if (isAnalyzing()) {
        <div class="ai-analyzing-banner pulse">
          <div class="sparkle-icon">✨</div>
          <div class="analyzing-text">
            <strong>{{ 'claims.ai_analyzing_title' | transloco }}</strong>
            <span>{{ 'claims.ai_analyzing_sub' | transloco }}</span>
          </div>
          <div class="ai-spinner"></div>
        </div>
      }

      <div class="page-layout-grid">
        <!-- Left Incident Card (Mockup 4) -->
        <div class="incident-main-card">
          <div class="incident-header">
            <span class="sub-heading">{{ 'claims.create_sub' | transloco }}</span>
            <h1 class="main-heading">{{ 'claims.create_heading' | transloco }}</h1>
          </div>

          <!-- Photo Upload / Preview Section -->
          <div class="photo-section">
            @if (photoPreviewUrl()) {
              <div class="photo-preview-wrapper">
                <img [src]="photoPreviewUrl()" alt="Accident damage preview" class="preview-img" />
                <div class="badge-overlay">
                  <span class="photo-count-badge">{{ 'claims.uploaded_photo' | transloco }}</span>
                </div>
                <button type="button" class="btn-change-photo" (click)="clearPhoto()">
                  {{ 'claims.change_photo' | transloco }}
                </button>
              </div>
            } @else {
              <div class="photo-drop-zone">
                <input
                  type="file"
                  id="claimPhotoInput"
                  accept="image/*"
                  (change)="onPhotoSelected($event)"
                  class="file-hidden-input"
                />
                <label for="claimPhotoInput" class="drop-zone-label">
                  <div class="camera-icon-circle">📸</div>
                  <div class="drop-title">{{ 'claims.take_upload_photo' | transloco }}</div>
                  <p class="drop-sub">{{ 'claims.photo_hint' | transloco }}</p>
                  <span class="btn-select-photo">{{ 'claims.select_photo_btn' | transloco }}</span>
                </label>
              </div>
            }
          </div>

          <!-- Audio Voice Note Widget (Mockup 4) -->
          <div class="audio-section">
            <app-audio-player
              (audioReady)="onAudioCaptured($event)"
              (audioRemoved)="onAudioRemoved()"
            ></app-audio-player>
          </div>

          <!-- Optional Incident Note -->
          <div class="note-section">
            <label for="incidentNote" class="note-label">{{ 'claims.optional_note' | transloco }}</label>
            <textarea
              id="incidentNote"
              [(ngModel)]="note"
              rows="2"
              [placeholder]="'claims.note_placeholder' | transloco"
              class="form-control"
            ></textarea>
          </div>
        </div>

        <!-- Right Side: Claim Status & AI Analysis Preview (Mockup 4) -->
        <aside class="status-summary-aside">
          <div class="aside-card">
            <h2 class="aside-title">{{ 'claims.status_details_title' | transloco }}</h2>

            <!-- Peach Estimated Repair Highlight Card -->
            <div class="estimate-highlight-box">
              <span class="estimate-label">{{ 'claims.estimated_cost_label' | transloco }}</span>
              <div class="estimate-amount">₹{{ estimatedAmount() }}</div>
            </div>

            <!-- Steps Progress Mini List -->
            <div class="next-steps-list">
              <div class="step-bullet">
                <div class="bullet-icon bg-orange">📷</div>
                <div class="bullet-info">
                  <div class="bullet-title">{{ 'claims.photo_captured' | transloco }}</div>
                  <div class="bullet-sub">{{ photoUri() ? ('claims.photo_verified' | transloco) : ('claims.photo_required' | transloco) }}</div>
                </div>
              </div>

              <div class="step-bullet">
                <div class="bullet-icon bg-teal">🎙️</div>
                <div class="bullet-info">
                  <div class="bullet-title">{{ 'claims.voice_explanation' | transloco }}</div>
                  <div class="bullet-sub">{{ voiceUri() ? ('claims.voice_recorded' | transloco) : ('claims.voice_required' | transloco) }}</div>
                </div>
              </div>

              <div class="step-bullet">
                <div class="bullet-icon bg-blue">⚡</div>
                <div class="bullet-info">
                  <div class="bullet-title">{{ 'claims.next_steps' | transloco }}</div>
                  <div class="bullet-sub">{{ 'claims.analyzing_sub' | transloco }}</div>
                </div>
              </div>
            </div>

            <!-- AI Result Card if Analyzed -->
            @if (analysisResult()) {
              <div class="analysis-result-box animate-fade-in">
                <div class="result-header">
                  <span class="result-title">{{ 'claims.ai_assessment' | transloco }}</span>
                  <app-badge [variant]="getRiskBadgeVariant(analysisResult()?.fraud_risk)">
                    {{ 'claims.fraud_risk' | transloco: { risk: (analysisResult()?.fraud_risk | uppercase) } }}
                  </app-badge>
                </div>
                <div class="damage-summary-text">
                  {{ analysisResult()?.damage_summary }}
                </div>
                @if (analysisResult()?.fraud_reason) {
                  <div class="fraud-reason-note">
                    <strong>AI Notes:</strong> {{ analysisResult()?.fraud_reason }}
                  </div>
                }
              </div>
            }

            <!-- Big Green Submit Claim Button (Mockup 4) -->
            <button
              type="button"
              class="btn-submit-claim"
              [disabled]="!canSubmit() || isAnalyzing()"
              (click)="submitClaim()"
            >
              @if (isAnalyzing()) {
                <span class="btn-spinner"></span>
                <span>{{ 'claims.submitting_btn' | transloco }}</span>
              } @else {
                <span>{{ 'claims.submit_claim_btn' | transloco }}</span>
              }
            </button>

            <p class="terms-disclaimer">
              ✓ Verified workers receive instant garage towing and partner garage cashless settlement.
            </p>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .claim-submit-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .ai-analyzing-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        background: linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%);
        border: 1.5px solid #fdba74;
        padding: 16px 24px;
        border-radius: var(--radius-lg);
        color: #9a3412;
      }
      .sparkle-icon {
        font-size: 1.8rem;
      }
      .analyzing-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .analyzing-text strong {
        font-size: 1rem;
        font-weight: 800;
      }
      .analyzing-text span {
        font-size: 0.85rem;
        opacity: 0.9;
      }
      .ai-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #fed7aa;
        border-top-color: #ea580c;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .page-layout-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 32px;
      }
      .incident-main-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 36px;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .incident-header .sub-heading {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-muted);
      }
      .incident-header .main-heading {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
        margin-top: 4px;
      }
      .photo-section {
        width: 100%;
      }
      .photo-preview-wrapper {
        position: relative;
        width: 100%;
        height: 320px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 1px solid var(--border-color);
        background: #0f172a;
      }
      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .badge-overlay {
        position: absolute;
        top: 16px;
        left: 16px;
      }
      .photo-count-badge {
        background: rgba(15, 23, 42, 0.75);
        color: #ffffff;
        font-size: 0.8rem;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: var(--radius-pill);
        backdrop-filter: blur(4px);
      }
      .btn-change-photo {
        position: absolute;
        bottom: 16px;
        right: 16px;
        background: rgba(255, 255, 255, 0.9);
        color: var(--text-main);
        font-size: 0.82rem;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
      }
      .photo-drop-zone {
        border: 2px dashed #cbd5e1;
        border-radius: var(--radius-lg);
        padding: 40px 20px;
        text-align: center;
        background: var(--bg-card-subtle);
        transition: border-color 0.2s;
      }
      .photo-drop-zone:hover {
        border-color: var(--primary-teal);
      }
      .file-hidden-input {
        display: none;
      }
      .drop-zone-label {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .camera-icon-circle {
        font-size: 2.2rem;
        margin-bottom: 4px;
      }
      .drop-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .drop-sub {
        font-size: 0.85rem;
        color: var(--text-muted);
        max-width: 320px;
        margin-bottom: 12px;
      }
      .btn-select-photo {
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.85rem;
        padding: 8px 20px;
        border-radius: var(--radius-pill);
      }
      .note-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .note-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .form-control {
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 10px 14px;
        font-size: 0.9rem;
        outline: none;
        resize: vertical;
      }
      .form-control:focus {
        border-color: var(--primary-teal);
      }
      .aside-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 32px 28px;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .aside-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .estimate-highlight-box {
        background: #fff7ed;
        border: 1px solid #fed7aa;
        border-radius: var(--radius-lg);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .estimate-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #9a3412;
      }
      .estimate-amount {
        font-size: 2.2rem;
        font-weight: 800;
        color: #9a3412;
        letter-spacing: -0.02em;
      }
      .next-steps-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 14px 0;
        border-top: 1px solid var(--border-subtle);
        border-bottom: 1px solid var(--border-subtle);
      }
      .step-bullet {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .bullet-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        flex-shrink: 0;
      }
      .bg-orange { background: #ffedd5; }
      .bg-teal { background: #ccfbf1; }
      .bg-blue { background: #dbeafe; }
      .bullet-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-main);
      }
      .bullet-sub {
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .analysis-result-box {
        background: #f0fdfa;
        border: 1px solid #99f6e4;
        border-radius: var(--radius-md);
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .result-title {
        font-weight: 700;
        font-size: 0.85rem;
        color: var(--primary-teal);
      }
      .damage-summary-text {
        font-size: 0.85rem;
        color: var(--text-main);
        font-weight: 600;
      }
      .fraud-reason-note {
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .btn-submit-claim {
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 800;
        font-size: 1.05rem;
        padding: 14px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: background 0.15s, transform 0.1s;
      }
      .btn-submit-claim:hover:not(:disabled) {
        background: var(--primary-teal-hover);
        transform: translateY(-1px);
      }
      .btn-submit-claim:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .btn-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      .terms-disclaimer {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-align: center;
        line-height: 1.4;
      }

      @media (max-width: 1000px) {
        .page-layout-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class ClaimCreateComponent {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private trustService = inject(TrustService);
  private router = inject(Router);

  photoUri = signal<string>('');
  photoPreviewUrl = signal<string | null>(null);
  voiceUri = signal<string>('');
  note = '';

  isAnalyzing = signal(false);
  estimatedAmount = signal<number>(8500);
  analysisResult = signal<ClaimCreateResponse | null>(null);

  canSubmit(): boolean {
    return !!this.photoUri() && !!this.voiceUri();
  }

  async onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.photoPreviewUrl.set(URL.createObjectURL(file));
    this.toastService.info('Uploading accident photo...');

    try {
      const convertedBlob = await convertToJpeg(file);
      const filename = file.name.toLowerCase().endsWith('.pdf') ? file.name : 'accident.jpg';

      this.apiService.upload('claim_photo', convertedBlob, filename).subscribe({
        next: (res) => {
          this.photoUri.set(res.uri);
          this.toastService.success('Photo uploaded for AI inspection');
        },
        error: () => {
          // Fallback demo URI
          this.photoUri.set('mock://claim_photo/accident_' + Date.now());
          this.toastService.warning('Using sample photo reference for demo');
        }
      });
    } catch {
      this.photoUri.set('mock://claim_photo/accident_' + Date.now());
      this.toastService.warning('Using sample photo reference for demo');
    }
  }

  clearPhoto() {
    this.photoUri.set('');
    this.photoPreviewUrl.set(null);
  }

  onAudioCaptured(blob: Blob) {
    this.toastService.info('Uploading voice note...');
    this.apiService.upload('claim_voice', blob, 'voicenote.webm').subscribe({
      next: (res) => {
        this.voiceUri.set(res.uri);
        this.toastService.success('Voice note uploaded successfully');
      },
      error: () => {
        this.voiceUri.set('mock://claim_voice/note_' + Date.now());
        this.toastService.warning('Using sample voice note reference');
      }
    });
  }

  onAudioRemoved() {
    this.voiceUri.set('');
  }

  submitClaim() {
    if (!this.canSubmit()) return;

    this.isAnalyzing.set(true);

    const payload: ClaimCreateRequest = {
      photo_uri: this.photoUri(),
      voice_uri: this.voiceUri(),
      note: this.note.trim() || undefined
    };

    this.apiService.createClaim(payload).subscribe({
      next: (res) => {
        this.isAnalyzing.set(false);
        this.analysisResult.set(res);

        if (res.created) {
          this.trustService.refresh();
          this.toastService.success(
            `Claim filed! Estimated ₹${res.estimated_amount || 4500}. Risk: ${res.fraud_risk || 'Low'}`
          );
          if (res.estimated_amount) {
            this.estimatedAmount.set(res.estimated_amount);
          }
          // Navigate to claim detail after short view
          setTimeout(() => {
            this.router.navigate(['/claims', res.claim_id || 'OB-83491']);
          }, 1500);
        } else {
          this.toastService.error(res.reason || 'Claim creation was rejected by AI verification.');
        }
      },
      error: (err) => {
        this.isAnalyzing.set(false);
        this.trustService.refresh();
        console.error('Claim submission error:', err);
        // Fallback redirect for testing
        this.toastService.warning('Simulating AI assessment for demo');
        this.router.navigate(['/claims', 'OB-83491']);
      }
    });
  }

  getRiskBadgeVariant(risk?: string): 'success' | 'warning' | 'danger' {
    const r = (risk || '').toLowerCase();
    if (r === 'low') return 'success';
    if (r === 'medium') return 'warning';
    return 'danger';
  }
}
