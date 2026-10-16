import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { LeaderboardEntry, HelpConfirmRequest } from '../../core/models/api.models';
import { getVerifiedBadgeConfig } from '../../core/utils/gender-badge.util';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoPipe],
  template: `
    <div class="leaderboard-page animate-fade-in">
      <!-- Top Hero Banner (Matches Mockup 3) -->
      <div class="hero-top-banner">
        <div class="banner-content">
          <div class="hero-title-group">
            <h1 class="page-title">{{ 'leaderboard.heroes_title' | transloco }}</h1>
            <p class="page-sub">{{ 'leaderboard.heroes_sub' | transloco }}</p>
          </div>

          <!-- Gold Pill Banner on Right (Mockup 3) -->
          <div class="hero-reward-pill">
            <span class="sparkles">✨</span>
            <div class="reward-text">
              <strong>{{ 'leaderboard.reward_title' | transloco }}</strong>
              <span>{{ 'leaderboard.reward_desc' | transloco }}</span>
            </div>
            <span class="sparkles">✨</span>
          </div>
        </div>

        <div class="help-action-row">
          <button type="button" class="btn-madad-mili" (click)="showHelpModal = true">
            <span>🤝</span>
            <span>{{ 'leaderboard.madad_btn' | transloco }}</span>
          </button>
        </div>
      </div>

      <!-- Main Layout: Podium & Top 10 List -->
      <div class="leaderboard-container">
        <!-- Top 3 Podium (Matches Mockup 3) -->
        <div class="podium-card">
          <div class="podium-stage">
            <!-- 2nd Place (Left) -->
            @if (topHelpers()[1]; as second) {
              <div class="podium-pillar rank-2">
                <div class="avatar-wrap">
                  <div class="avatar-circle">
                    <span class="avatar-letter">{{ second.name[0] }}</span>
                  </div>
                  <div class="medal-badge silver">🥈 2</div>
                </div>
                <div class="pillar-name-row">
                  <span class="pillar-name">{{ second.name }}</span>
                  <span class="podium-gender-pill" [ngClass]="getEntryBadge(second.gender).badgeClass">
                    {{ getEntryBadge(second.gender).icon }}
                  </span>
                </div>
                <div class="pillar-pts">{{ second.points | number }} {{ 'common.pts' | transloco }}</div>
                <div class="pedestal pedestal-2">2nd</div>
              </div>
            }

            <!-- 1st Place (Center - Elevated) -->
            @if (topHelpers()[0]; as first) {
              <div class="podium-pillar rank-1">
                <div class="avatar-wrap">
                  <div class="avatar-circle gold-ring">
                    <span class="avatar-letter">{{ first.name[0] }}</span>
                  </div>
                  <div class="medal-badge gold">🥇 1</div>
                </div>
                <div class="pillar-name-row">
                  <span class="pillar-name">{{ first.name }}</span>
                  <span class="podium-gender-pill" [ngClass]="getEntryBadge(first.gender).badgeClass">
                    {{ getEntryBadge(first.gender).icon }}
                  </span>
                </div>
                <div class="pillar-pts">{{ first.points | number }} {{ 'common.pts' | transloco }}</div>
                <div class="pedestal pedestal-1">1st</div>
              </div>
            }

            <!-- 3rd Place (Right) -->
            @if (topHelpers()[2]; as third) {
              <div class="podium-pillar rank-3">
                <div class="avatar-wrap">
                  <div class="avatar-circle">
                    <span class="avatar-letter">{{ third.name[0] }}</span>
                  </div>
                  <div class="medal-badge bronze">🥉 3</div>
                </div>
                <div class="pillar-name-row">
                  <span class="pillar-name">{{ third.name }}</span>
                  <span class="podium-gender-pill" [ngClass]="getEntryBadge(third.gender).badgeClass">
                    {{ getEntryBadge(third.gender).icon }}
                  </span>
                </div>
                <div class="pillar-pts">{{ third.points | number }} {{ 'common.pts' | transloco }}</div>
                <div class="pedestal pedestal-3">3rd</div>
              </div>
            }
          </div>
        </div>

        <!-- Ranks 4 to 10 List (Matches Mockup 3) -->
        <div class="ranks-card">
          <h2 class="ranks-heading">{{ 'leaderboard.top_contributors' | transloco }}</h2>
          <div class="ranks-list">
            @for (item of otherHelpers(); track item.id) {
              <div class="rank-item-row">
                <div class="rank-number">#{{ item.rank }}</div>
                <div class="rank-avatar">
                  {{ item.name[0] }}
                </div>
                <div class="rank-name-col">
                  <div class="rank-name-row">
                    <span class="rank-worker-name">{{ item.name }}</span>
                    <span class="leaderboard-gender-badge" [ngClass]="getEntryBadge(item.gender).badgeClass">
                      {{ getEntryBadge(item.gender).icon }} {{ getEntryBadge(item.gender).labelKey | transloco }}
                    </span>
                  </div>
                  <div class="rank-company-name">{{ item.company || (getEntryBadge(item.gender).labelKey | transloco) }}</div>
                </div>
                <div class="rank-pts-badge">
                  {{ item.points | number }} {{ 'common.pts' | transloco }}
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- 'Mujhe Madad Mili' Modal (POST /help/confirm) -->
      @if (showHelpModal) {
        <div class="modal-backdrop" (click)="showHelpModal = false">
          <div class="modal-card animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ 'leaderboard.confirm_modal_title' | transloco }}</h3>
              <button class="modal-close" (click)="showHelpModal = false">&times;</button>
            </div>

            <form (ngSubmit)="submitHelpConfirm()" class="help-form">
              <p class="modal-intro">
                {{ 'leaderboard.confirm_modal_intro' | transloco }}
              </p>

              <div class="form-group">
                <label for="helperPhone" class="field-label">{{ 'leaderboard.helper_id_label' | transloco }}</label>
                <input
                  id="helperPhone"
                  type="text"
                  [(ngModel)]="helperId"
                  name="helperId"
                  [placeholder]="'leaderboard.helper_placeholder' | transloco"
                  required
                  class="form-control"
                />
                <span class="field-hint">{{ 'leaderboard.helper_hint' | transloco }}</span>
              </div>

              <div class="form-group">
                <label class="field-label">{{ 'leaderboard.help_kind_title' | transloco }}</label>
                <div class="help-types-grid">
                  <label class="type-card" [class.selected]="helpType === 'urgent'">
                    <input type="radio" [(ngModel)]="helpType" name="helpType" value="urgent" />
                    <span class="type-icon">🚨</span>
                    <span class="type-text">{{ 'leaderboard.help_urgent' | transloco }}</span>
                  </label>
                  <label class="type-card" [class.selected]="helpType === 'money'">
                    <input type="radio" [(ngModel)]="helpType" name="helpType" value="money" />
                    <span class="type-icon">💵</span>
                    <span class="type-text">{{ 'leaderboard.help_money' | transloco }}</span>
                  </label>
                  <label class="type-card" [class.selected]="helpType === 'item'">
                    <input type="radio" [(ngModel)]="helpType" name="helpType" value="item" />
                    <span class="type-icon">🔧</span>
                    <span class="type-text">{{ 'leaderboard.help_item' | transloco }}</span>
                  </label>
                  <label class="type-card" [class.selected]="helpType === 'small'">
                    <input type="radio" [(ngModel)]="helpType" name="helpType" value="small" />
                    <span class="type-icon">📦</span>
                    <span class="type-text">{{ 'leaderboard.help_small' | transloco }}</span>
                  </label>
                </div>
              </div>

              <div class="anti-fraud-note">
                {{ 'leaderboard.anti_fraud_rule' | transloco }}
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-cancel-modal" (click)="showHelpModal = false">{{ 'common.cancel' | transloco }}</button>
                <button type="submit" class="btn-primary-teal" [disabled]="!helperId || isSubmittingHelp()">
                  @if (isSubmittingHelp()) {
                    <span>{{ 'leaderboard.confirming_btn' | transloco }}</span>
                  } @else {
                    <span>{{ 'leaderboard.confirm_help_btn' | transloco }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .leaderboard-page {
        display: flex;
        flex-direction: column;
        gap: 32px;
      }
      .hero-top-banner {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 32px 36px;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .banner-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }
      .page-title {
        font-size: 1.9rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
      }
      .page-sub {
        font-size: 0.95rem;
        color: var(--text-muted);
        margin-top: 4px;
      }
      .hero-reward-pill {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        color: #ffffff;
        padding: 14px 20px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
        max-width: 440px;
      }
      .reward-text {
        display: flex;
        flex-direction: column;
      }
      .reward-text strong {
        font-size: 0.95rem;
      }
      .reward-text span {
        font-size: 0.78rem;
        opacity: 0.9;
        margin-top: 2px;
      }
      .btn-madad-mili {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: var(--primary-teal);
        color: #ffffff;
        font-size: 0.95rem;
        font-weight: 800;
        padding: 12px 24px;
        border-radius: var(--radius-pill);
        transition: background 0.15s, transform 0.1s;
      }
      .btn-madad-mili:hover {
        background: var(--primary-teal-hover);
        transform: translateY(-1px);
      }
      .leaderboard-container {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 32px;
      }
      .podium-card,
      .ranks-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 36px;
        box-shadow: var(--shadow-sm);
      }
      .podium-stage {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 24px;
        padding-top: 20px;
        min-height: 380px;
      }
      .podium-pillar {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }
      .avatar-wrap {
        position: relative;
        margin-bottom: 12px;
      }
      .avatar-circle {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: #0f766e;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-md);
      }
      .gold-ring {
        width: 88px;
        height: 88px;
        background: #042f2e;
        border: 4px solid #f59e0b;
      }
      .avatar-letter {
        font-size: 1.6rem;
        font-weight: 800;
      }
      .medal-badge {
        position: absolute;
        bottom: -6px;
        right: -6px;
        background: #ffffff;
        border-radius: var(--radius-pill);
        padding: 2px 8px;
        font-size: 0.8rem;
        font-weight: 800;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border-color);
      }
      .pillar-name {
        font-weight: 800;
        font-size: 1rem;
        color: var(--text-main);
        text-align: center;
      }
      .pillar-pts {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--primary-teal);
        margin-top: 2px;
        margin-bottom: 14px;
      }
      .pedestal {
        width: 100%;
        border-radius: var(--radius-md) var(--radius-md) 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: #ffffff;
      }
      .pedestal-1 {
        height: 150px;
        background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        font-size: 1.5rem;
      }
      .pedestal-2 {
        height: 110px;
        background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
        font-size: 1.3rem;
      }
      .pedestal-3 {
        height: 80px;
        background: linear-gradient(180deg, #b45309 0%, #78350f 100%);
        font-size: 1.15rem;
      }
      .ranks-heading {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-main);
        margin-bottom: 20px;
      }
      .ranks-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .rank-item-row {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: #ffffff;
        gap: 14px;
      }
      .rank-number {
        font-weight: 800;
        font-size: 0.95rem;
        color: var(--text-muted);
        width: 28px;
      }
      .rank-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--bg-card-subtle);
        color: var(--text-main);
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-color);
      }
      .rank-name-col {
        flex: 1;
      }
      .pillar-name-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .podium-gender-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
      }
      .rank-name-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .leaderboard-gender-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: var(--radius-pill);
        line-height: 1;
      }
      .leaderboard-gender-badge.badge-gender-male {
        color: var(--primary-teal);
        background: var(--primary-teal-surface);
        border: 1px solid var(--primary-teal-border);
      }
      .leaderboard-gender-badge.badge-gender-female {
        color: #db2777;
        background: #fdf2f8;
        border: 1px solid #fbcfe8;
      }
      .leaderboard-gender-badge.badge-gender-other {
        color: #475569;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
      }
      .rank-worker-name {
        font-weight: 700;
        font-size: 0.92rem;
        color: var(--text-main);
      }
      .rank-company-name {
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .rank-pts-badge {
        font-weight: 800;
        font-size: 0.88rem;
        color: var(--primary-teal);
        background: var(--primary-teal-surface);
        padding: 4px 10px;
        border-radius: var(--radius-pill);
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-card {
        background: #ffffff;
        width: 100%;
        max-width: 520px;
        border-radius: var(--radius-xl);
        padding: 32px;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .modal-title { font-size: 1.3rem; font-weight: 800; }
      .modal-close { font-size: 1.5rem; }
      .help-form { display: flex; flex-direction: column; gap: 18px; }
      .modal-intro { font-size: 0.88rem; color: var(--text-muted); line-height: 1.4; }
      .form-group { display: flex; flex-direction: column; gap: 6px; }
      .field-label { font-size: 0.88rem; font-weight: 700; }
      .field-hint { font-size: 0.75rem; color: var(--text-muted); }
      .form-control { border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 14px; outline: none; }
      .form-control:focus { border-color: var(--primary-teal); }
      .help-types-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .type-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--bg-card-subtle);
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .type-card.selected {
        border-color: var(--primary-teal);
        background: var(--primary-teal-surface);
        color: var(--primary-teal);
        font-weight: 700;
      }
      .type-card input { display: none; }
      .anti-fraud-note {
        background: #fff7ed;
        border: 1px solid #fed7aa;
        padding: 10px 14px;
        border-radius: var(--radius-md);
        font-size: 0.8rem;
        color: #9a3412;
        line-height: 1.4;
      }
      .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
      .btn-cancel-modal { padding: 9px 18px; border-radius: var(--radius-md); background: #f1f5f9; font-weight: 700; }
      .btn-primary-teal { background: var(--primary-teal); color: #ffffff; padding: 10px 22px; border-radius: var(--radius-md); font-weight: 700; }

      @media (max-width: 1000px) {
        .banner-content { flex-direction: column; align-items: stretch; }
        .leaderboard-container { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class LeaderboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  topHelpers = signal<LeaderboardEntry[]>([]);
  otherHelpers = signal<LeaderboardEntry[]>([]);

  showHelpModal = false;
  helperId = '';
  helpType: 'urgent' | 'money' | 'item' | 'small' = 'urgent';
  isSubmittingHelp = signal(false);

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.apiService.getLeaderboard().subscribe({
      next: (entries) => {
        if (entries && entries.length >= 3) {
          const normalized: LeaderboardEntry[] = entries.map((e: any, idx: number) => ({
            rank: e.rank ?? (idx + 1),
            id: e.worker_id || e.id || `H-${idx + 1}`,
            name: e.name || 'Brother',
            points: Number(e.points ?? e.helper_points ?? 0),
            helper_points: Number(e.helper_points ?? e.points ?? 0),
            company: e.company || '',
            gender: e.gender
          }));
          this.topHelpers.set(normalized.slice(0, 3));
          this.otherHelpers.set(normalized.slice(3, 10));
        } else {
          this.setMockLeaderboard();
        }
      },
      error: () => {
        this.setMockLeaderboard();
      }
    });
  }

  getEntryBadge(gender?: string | null) {
    return getVerifiedBadgeConfig(gender);
  }

  private setMockLeaderboard() {
    // Matches Mockup 3 exact names and points:
    // 1. Rajesh M. (2500)
    // 2. Amit K. (2100)
    // 3. Rahul S. (1800)
    // 4. Priya S. (1550)
    // 5. Vikram P. (1400)
    // 6. Anjali R. (1320)
    const list: LeaderboardEntry[] = [
      { rank: 1, id: 'H-01', name: 'Rajesh M.', points: 2500, helper_points: 2500, company: 'Zomato Super Brother', gender: 'male' },
      { rank: 2, id: 'H-02', name: 'Amit K.', points: 2100, helper_points: 2100, company: 'Swiggy Hero', gender: 'male' },
      { rank: 3, id: 'H-03', name: 'Rahul S.', points: 1800, helper_points: 1800, company: 'Shadowfax Champion', gender: 'male' },
      { rank: 4, id: 'H-04', name: 'Priya S.', points: 1550, helper_points: 1550, company: 'Zepto Rider', gender: 'female' },
      { rank: 5, id: 'H-05', name: 'Vikram P.', points: 1400, helper_points: 1400, company: 'Blinkit Delivery', gender: 'male' },
      { rank: 6, id: 'H-06', name: 'Anjali R.', points: 1320, helper_points: 1320, company: 'Uber Moto', gender: 'female' },
      { rank: 7, id: 'H-07', name: 'Deepak V.', points: 1100, helper_points: 1100, company: 'Ola Bike', gender: 'male' },
      { rank: 8, id: 'H-08', name: 'Manish C.', points: 950, helper_points: 950, company: 'Rapido Captain', gender: 'male' },
      { rank: 9, id: 'H-09', name: 'Sanjay T.', points: 880, helper_points: 880, company: 'Ekart Express', gender: 'male' },
      { rank: 10, id: 'H-10', name: 'Kavita R.', points: 810, helper_points: 810, company: 'Demo Foods Ltd', gender: 'female' }
    ];

    this.topHelpers.set(list.slice(0, 3));
    this.otherHelpers.set(list.slice(3, 10));
  }

  submitHelpConfirm() {
    if (!this.helperId) return;
    this.isSubmittingHelp.set(true);

    const payload: HelpConfirmRequest = {
      helper_id: this.helperId.trim(),
      help_type: this.helpType
    };

    this.apiService.confirmHelp(payload).subscribe({
      next: (res) => {
        this.isSubmittingHelp.set(false);
        this.showHelpModal = false;
        this.toastService.success(
          res.message || 'Help confirmed! +150 Brotherhood Points awarded to helper.'
        );
        this.helperId = '';
        this.loadLeaderboard();
      },
      error: (err) => {
        this.isSubmittingHelp.set(false);
        const errorMsg =
          err.error?.detail ||
          err.error?.reason ||
          'Help pair limit exceeded: You cannot confirm help with the same brother more than 3 times.';
        this.toastService.error(errorMsg, 'Confirmation Limit');
      }
    });
  }
}
