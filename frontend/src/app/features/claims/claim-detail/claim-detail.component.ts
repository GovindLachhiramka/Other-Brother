import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ClaimItem } from '../../../core/models/api.models';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe, BadgeComponent],
  template: `
    <div class="claim-track-page animate-fade-in">
      <!-- Top Title and Subtitle Row (Matches Mockup 2) -->
      <div class="page-top-bar">
        <div class="top-title-group">
          <div class="back-nav-row">
            <a routerLink="/claims" class="back-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </a>
            <h1 class="claim-title">{{ 'claims.track_title' | transloco: { id: (claim()?.claim_number || claimId) } }}</h1>
          </div>
          <div class="claim-breadcrumbs">
            <a routerLink="/claims/new">{{ 'claims.breadcrumbs_file' | transloco }}</a>
            <span>•</span>
            <span class="active-crumb">{{ 'claims.breadcrumbs_track' | transloco }}</span>
          </div>
        </div>

        <!-- Fraud Risk Badge (Matches Mockup 2) -->
        <div class="risk-badge-wrapper">
          <app-badge [variant]="getRiskVariant()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            {{ 'claims.fraud_risk' | transloco: { risk: (claim()?.fraud_risk || 'Low' | titlecase) } }}
          </app-badge>
        </div>
      </div>

      <!-- Two Main Columns Layout (Matches Mockup 2) -->
      <div class="claim-columns-grid">
        <!-- Left Column: Claim Details Card -->
        <div class="claim-details-card">
          <h2 class="card-heading">{{ 'claims.claim_details_title' | transloco }}</h2>

          <div class="claim-summary-info">
            <div class="info-label">{{ 'claims.active_claim_label' | transloco }}</div>
            <div class="info-title">{{ claim()?.title || ('claims.type_accident' | transloco) }}</div>

            <div class="repair-est-row">
              <span class="est-label">{{ 'claims.estimated_repair_label' | transloco }}</span>
              <span class="est-val">₹{{ claim()?.estimated_amount || 4500 | number }}</span>
            </div>
          </div>

          <!-- Photo Thumbnail -->
          <div class="photo-box">
            <img
              [src]="claim()?.photo_uri || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80'"
              alt="Accident scooter repair view"
              class="accident-photo"
            />
          </div>

          <!-- Action Buttons (Mockup 2) -->
          <div class="card-actions-col">
            <button type="button" class="btn-secondary" (click)="messageAgent()">
              {{ 'claims.message_agent' | transloco }}
            </button>
            <button type="button" class="btn-secondary" (click)="modifyDetails()">
              {{ 'claims.modify_details' | transloco }}
            </button>
          </div>
        </div>

        <!-- Right Column: Claim Status Timeline (Matches Mockup 2) -->
        <div class="timeline-card">
          <h2 class="card-heading">{{ 'claims.timeline_title' | transloco }}</h2>

          <div class="timeline-tree">
            <!-- Step 1: Claim submitted -->
            <div class="timeline-node done">
              <div class="node-indicator">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="node-content">
                <div class="node-title">{{ 'claims.step_submitted' | transloco }}</div>
                <div class="node-date">Oct 8, 10:20 AM</div>
              </div>
            </div>

            <!-- Step 2: Under review -->
            <div class="timeline-node done">
              <div class="node-indicator">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="node-content">
                <div class="node-title">{{ 'claims.step_review' | transloco }}</div>
                <div class="node-date">Done on Oct 8</div>
              </div>
            </div>

            <!-- Step 3: Approved - ₹4,500 incoming (Highlighted green pill in Mockup 2) -->
            <div class="timeline-node current">
              <div class="node-indicator icon-currency">
                <span>₹</span>
              </div>
              <div class="node-content">
                <div class="approved-pill-banner">
                  {{ 'claims.step_approved_banner' | transloco: { amount: (claim()?.estimated_amount || 4500 | number) } }}
                </div>
              </div>
            </div>

            <!-- Step 4: Garage confirmed for pickup -->
            <div class="timeline-node pending">
              <div class="node-indicator icon-scooter">
                <span>🛵</span>
              </div>
              <div class="node-content pickup-row">
                <div>
                  <div class="node-title">{{ 'claims.step_garage' | transloco }}</div>
                  <div class="node-date">{{ 'claims.step_garage_sub' | transloco }}</div>
                </div>
                <button type="button" class="btn-outline-sm" (click)="showGarageModal = true">
                  {{ 'claims.view_garage_details' | transloco }}
                </button>
              </div>
            </div>
          </div>

          <div class="timeline-footer-cta">
            <button type="button" class="btn-primary-teal" (click)="showGarageModal = true">
              {{ 'claims.view_garage_details' | transloco }}
            </button>
          </div>
        </div>
      </div>

      <!-- Garage Details Modal -->
      @if (showGarageModal) {
        <div class="modal-backdrop" (click)="showGarageModal = false">
          <div class="modal-card animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Partner Garage Details</h3>
              <button class="modal-close" (click)="showGarageModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="garage-info-item">
                <div class="info-key">Authorized Workshop:</div>
                <div class="info-val">Brother Auto Works & Towing (Koramangala Hub)</div>
              </div>
              <div class="garage-info-item">
                <div class="info-key">Mechanic In-charge:</div>
                <div class="info-val">Suresh M. (+91 98765 43210)</div>
              </div>
              <div class="garage-info-item">
                <div class="info-key">Cashless Guarantee:</div>
                <div class="info-val text-success">✓ 100% Direct Settlement from Other/Brother Pool</div>
              </div>
              <div class="garage-info-item">
                <div class="info-key">Estimated Delivery:</div>
                <div class="info-val">Tomorrow, 5:00 PM</div>
              </div>
            </div>
            <div class="modal-footer">
              <a href="tel:9876543210" class="btn-call-garage">Call Mechanic Now</a>
              <button class="btn-close-modal" (click)="showGarageModal = false">Close</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .claim-track-page {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }
      .page-top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .back-nav-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .back-link {
        color: var(--text-main);
        display: flex;
        align-items: center;
        padding: 4px;
        border-radius: var(--radius-sm);
      }
      .back-link:hover {
        background: var(--bg-card-subtle);
      }
      .claim-title {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
      }
      .claim-breadcrumbs {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.88rem;
        color: var(--text-muted);
        margin-top: 4px;
        margin-left: 36px;
      }
      .claim-breadcrumbs a {
        color: var(--text-muted);
      }
      .claim-breadcrumbs a:hover {
        color: var(--primary-teal);
      }
      .active-crumb {
        color: var(--text-main);
        font-weight: 600;
      }
      .claim-columns-grid {
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 32px;
      }
      .claim-details-card,
      .timeline-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 36px;
        box-shadow: var(--shadow-sm);
      }
      .card-heading {
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--text-main);
        margin-bottom: 20px;
      }
      .claim-summary-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 18px;
      }
      .info-label {
        font-size: 0.85rem;
        color: var(--text-muted);
        font-weight: 600;
      }
      .info-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .repair-est-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-top: 4px;
      }
      .est-label {
        font-size: 0.9rem;
        color: var(--text-muted);
      }
      .est-val {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .photo-box {
        width: 100%;
        height: 200px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 1px solid var(--border-color);
        margin-bottom: 24px;
      }
      .accident-photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .card-actions-col {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .btn-secondary {
        width: 100%;
        padding: 12px;
        border-radius: var(--radius-md);
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        font-weight: 700;
        font-size: 0.92rem;
        color: var(--text-main);
        transition: background 0.15s;
      }
      .btn-secondary:hover {
        background: #e2e8f0;
      }
      .timeline-tree {
        display: flex;
        flex-direction: column;
        position: relative;
        padding-left: 20px;
      }
      .timeline-tree::before {
        content: '';
        position: absolute;
        top: 20px;
        bottom: 30px;
        left: 36px;
        width: 2px;
        background: #cbd5e1;
      }
      .timeline-node {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 20px;
        padding-bottom: 36px;
      }
      .node-indicator {
        position: relative;
        z-index: 2;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid #cbd5e1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        flex-shrink: 0;
      }
      .timeline-node.done .node-indicator {
        background: var(--primary-teal);
        border-color: var(--primary-teal);
        color: #ffffff;
      }
      .timeline-node.current .node-indicator {
        background: #dcfce7;
        border-color: var(--color-success);
        color: var(--color-success);
        font-weight: 800;
      }
      .timeline-node.pending .node-indicator {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
      .node-content {
        flex: 1;
        padding-top: 4px;
      }
      .node-title {
        font-weight: 800;
        font-size: 1rem;
        color: var(--text-main);
      }
      .node-date {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .approved-pill-banner {
        display: inline-block;
        background: #86efac;
        color: #14532d;
        font-weight: 800;
        font-size: 0.95rem;
        padding: 10px 20px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
      }
      .pickup-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .btn-outline-sm {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-main);
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        padding: 8px 14px;
        border-radius: var(--radius-md);
      }
      .btn-outline-sm:hover {
        background: #e2e8f0;
      }
      .timeline-footer-cta {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
      }
      .btn-primary-teal {
        background: var(--primary-teal);
        color: #ffffff;
        font-size: 0.95rem;
        font-weight: 700;
        padding: 12px 24px;
        border-radius: var(--radius-md);
        transition: background 0.15s;
      }
      .btn-primary-teal:hover {
        background: var(--primary-teal-hover);
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-card {
        background: #ffffff;
        width: 100%;
        max-width: 480px;
        border-radius: var(--radius-xl);
        padding: 28px;
        box-shadow: var(--shadow-xl);
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .modal-title {
        font-size: 1.25rem;
        font-weight: 800;
      }
      .modal-close {
        font-size: 1.5rem;
        color: var(--text-muted);
      }
      .modal-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 24px;
      }
      .garage-info-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .info-key {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-weight: 600;
      }
      .info-val {
        font-size: 0.95rem;
        color: var(--text-main);
        font-weight: 700;
      }
      .text-success {
        color: var(--color-success-text);
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .btn-call-garage {
        background: var(--primary-teal);
        color: #ffffff;
        padding: 10px 18px;
        border-radius: var(--radius-md);
        font-size: 0.88rem;
        font-weight: 700;
        text-decoration: none;
      }
      .btn-close-modal {
        background: #f1f5f9;
        color: var(--text-main);
        padding: 10px 18px;
        border-radius: var(--radius-md);
        font-size: 0.88rem;
        font-weight: 700;
      }

      @media (max-width: 1000px) {
        .claim-columns-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class ClaimDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  claimId = 'OB-83491';
  claim = signal<ClaimItem | null>(null);
  showGarageModal = false;

  ngOnInit() {
    this.claimId = this.route.snapshot.paramMap.get('id') || 'OB-83491';
    this.loadClaim();
  }

  loadClaim() {
    this.apiService.getClaim(this.claimId).subscribe({
      next: (c) => this.claim.set(c),
      error: () => {
        // Fallback mockup model
        this.claim.set({
          id: this.claimId,
          claim_number: 'OB-83491',
          title: 'Road Accident (Scooter)',
          estimated_amount: 4500,
          status: 'approved',
          fraud_risk: 'low',
          damage_summary: 'Front bumper & side fairing dent',
          photo_uri: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80'
        });
      }
    });
  }

  getRiskVariant(): 'success' | 'warning' | 'danger' {
    const risk = (this.claim()?.fraud_risk || 'low').toLowerCase();
    if (risk === 'low') return 'success';
    if (risk === 'medium') return 'warning';
    return 'danger';
  }

  messageAgent() {
    this.toastService.info('Assigned Claim Specialist: Rahul Verma. Chat session initiated.');
  }

  modifyDetails() {
    this.toastService.info('Opening accident details modification form.');
  }
}
