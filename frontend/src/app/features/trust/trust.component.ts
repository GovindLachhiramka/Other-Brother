import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TrustService } from '../../core/services/trust.service';
import { TrustRingComponent } from '../../shared/components/trust-ring/trust-ring.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { TrustScoreEvent } from '../../core/models/api.models';

@Component({
  selector: 'app-trust',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, TrustRingComponent, BadgeComponent],
  template: `
    <div class="trust-page animate-fade-in">
      <!-- Top Title and Slogan Banner -->
      <div class="trust-hero-card">
        <div class="hero-text-col">
          <div class="slogan-badge">{{ 'trust.badge_explainable' | transloco }}</div>
          <h1 class="page-title">{{ 'trust.hero_title' | transloco }}</h1>
          <p class="page-slogan">{{ 'trust.hero_slogan' | transloco }}</p>
          <p class="page-sub">
            {{ 'trust.hero_desc' | transloco }}
          </p>
        </div>

        <div class="score-ring-hero">
          <app-trust-ring [score]="trustScore()" [size]="180" [strokeWidth]="14"></app-trust-ring>
          <div class="band-tag" [class.band-high]="trustScore() >= 71" [class.band-med]="trustScore() >= 41 && trustScore() <= 70" [class.band-low]="trustScore() <= 40">
            {{ trustService.getBandKey() | transloco }}
          </div>
        </div>
      </div>

      <!-- Color Bands Legend -->
      <div class="bands-legend-card">
        <div class="legend-col red-band" [class.active-band]="trustScore() <= 40">
          <div class="legend-header">
            <span class="legend-color-dot dot-red"></span>
            <strong>{{ 'trust.band_red_title' | transloco }}</strong>
          </div>
          <p class="legend-desc">{{ 'trust.band_red_desc' | transloco }}</p>
        </div>

        <div class="legend-col amber-band" [class.active-band]="trustScore() >= 41 && trustScore() <= 70">
          <div class="legend-header">
            <span class="legend-color-dot dot-amber"></span>
            <strong>{{ 'trust.band_amber_title' | transloco }}</strong>
          </div>
          <p class="legend-desc">{{ 'trust.band_amber_desc' | transloco }}</p>
        </div>

        <div class="legend-col green-band" [class.active-band]="trustScore() >= 71">
          <div class="legend-header">
            <span class="legend-color-dot dot-green"></span>
            <strong>{{ 'trust.band_green_title' | transloco }}</strong>
          </div>
          <p class="legend-desc">{{ 'trust.band_green_desc' | transloco }}</p>
        </div>
      </div>

      <!-- Audit History: Why your score changed (List of Events) -->
      <div class="events-audit-card">
        <div class="card-header-row">
          <div>
            <h2 class="events-heading">{{ 'trust.history_title' | transloco }}</h2>
            <p class="events-sub">{{ 'trust.history_sub' | transloco }}</p>
          </div>
          <span class="events-count">{{ 'trust.events_count' | transloco: { count: events().length } }}</span>
        </div>

        <div class="events-timeline-list">
          @for (event of events(); track $index) {
            <div class="event-row">
              <div class="event-indicator" [class.pos]="event.change > 0" [class.neg]="event.change < 0">
                <span>{{ event.change > 0 ? '+' : '' }}{{ event.change }}</span>
              </div>
              <div class="event-details">
                <div class="event-reason">{{ event.reason }}</div>
                <div class="event-date">{{ event.date }}</div>
              </div>
              <div class="event-badge">
                <app-badge [variant]="event.change > 0 ? 'success' : 'danger'">
                  {{ event.change > 0 ? ('trust.positive_impact' | transloco) : ('trust.deduction' | transloco) }}
                </app-badge>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .trust-page {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }
      .trust-hero-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 40px;
        box-shadow: var(--shadow-sm);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 36px;
      }
      .hero-text-col {
        flex: 1;
      }
      .slogan-badge {
        display: inline-block;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--primary-teal);
        background: var(--primary-teal-surface);
        padding: 4px 12px;
        border-radius: var(--radius-pill);
        margin-bottom: 8px;
      }
      .page-title {
        font-size: 2.1rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
        margin-bottom: 6px;
      }
      .page-slogan {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--accent-orange);
        margin-bottom: 12px;
      }
      .page-sub {
        font-size: 0.95rem;
        color: var(--text-muted);
        line-height: 1.5;
        max-width: 580px;
      }
      .score-ring-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }
      .band-tag {
        font-size: 0.85rem;
        font-weight: 800;
        padding: 6px 16px;
        border-radius: var(--radius-pill);
      }
      .band-high { background: var(--color-success-bg); color: var(--color-success-text); }
      .band-med { background: var(--color-warning-bg); color: var(--color-warning-text); }
      .band-low { background: var(--color-danger-bg); color: var(--color-danger-text); }
      .bands-legend-card {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      .legend-col {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 20px;
        transition: transform 0.15s, border-color 0.15s;
      }
      .legend-col.active-band {
        box-shadow: 0 0 0 2px var(--primary-teal);
        border-color: var(--primary-teal);
      }
      .legend-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.95rem;
        margin-bottom: 6px;
      }
      .legend-color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .dot-red { background: var(--color-danger); }
      .dot-amber { background: var(--color-warning); }
      .dot-green { background: var(--color-success); }
      .legend-desc {
        font-size: 0.82rem;
        color: var(--text-muted);
        line-height: 1.4;
      }
      .events-audit-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 36px;
        box-shadow: var(--shadow-sm);
      }
      .card-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }
      .events-heading {
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--text-main);
      }
      .events-sub {
        font-size: 0.88rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .events-count {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-muted);
        background: var(--bg-card-subtle);
        padding: 4px 12px;
        border-radius: var(--radius-pill);
      }
      .events-timeline-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .event-row {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        gap: 18px;
        background: #ffffff;
        transition: background 0.15s;
      }
      .event-row:hover {
        background: var(--bg-card-subtle);
      }
      .event-indicator {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.95rem;
        flex-shrink: 0;
      }
      .event-indicator.pos {
        background: var(--color-success-bg);
        color: var(--color-success-text);
      }
      .event-indicator.neg {
        background: var(--color-danger-bg);
        color: var(--color-danger-text);
      }
      .event-details {
        flex: 1;
      }
      .event-reason {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-main);
      }
      .event-date {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 2px;
      }

      @media (max-width: 900px) {
        .trust-hero-card { flex-direction: column; }
        .bands-legend-card { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class TrustComponent implements OnInit {
  private apiService = inject(ApiService);
  authService = inject(AuthService);
  trustService = inject(TrustService);

  readonly trustScore = this.trustService.trustScore;
  events = signal<TrustScoreEvent[]>([]);

  ngOnInit() {
    this.loadTrustData();
  }

  loadTrustData() {
    this.apiService.getTrustScore().subscribe({
      next: (res) => {
        const serverScore = (res as any).trust_score ?? res.score;
        if (serverScore !== undefined && serverScore !== null) {
          this.trustService.setScore(serverScore);
        } else {
          this.trustService.refresh();
        }
        if (res.events && res.events.length > 0) {
          this.events.set(res.events);
        } else {
          this.setDefaultEvents();
        }
      },
      error: () => {
        this.trustService.refresh();
        this.setDefaultEvents();
      }
    });
  }

  private setDefaultEvents() {
    this.events.set([
      {
        id: 'EV-1',
        date: 'Oct 8, 2026',
        change: 15,
        reason: 'Confirmed assistance to stranded rider on Hosur Road (Roadside Help)'
      },
      {
        id: 'EV-2',
        date: 'Oct 1, 2026',
        change: 10,
        reason: 'Prompt full repayment of ₹500 emergency pool advance before Friday'
      },
      {
        id: 'EV-3',
        date: 'Sep 24, 2026',
        change: 25,
        reason: 'Biometric face match and government driving licence verified with zero flags'
      },
      {
        id: 'EV-4',
        date: 'Sep 15, 2026',
        change: 32,
        reason: 'Company confirmation approved by Demo Foods Ltd fleet manager'
      }
    ]);
  }

  getBandLabel(): string {
    return this.trustService.getBandLabel();
  }
}
