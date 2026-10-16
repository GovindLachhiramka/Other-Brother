import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trust-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trust-ring-wrapper" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 120 120" class="ring-svg">
        <!-- Background Track -->
        <circle
          cx="60"
          cy="60"
          [attr.r]="radius"
          fill="none"
          stroke="#E2E8F0"
          [attr.stroke-width]="strokeWidth"
        />
        <!-- Progress Ring -->
        <circle
          cx="60"
          cy="60"
          [attr.r]="radius"
          fill="none"
          [attr.stroke]="strokeColor()"
          [attr.stroke-width]="strokeWidth"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset()"
          class="progress-ring-circle"
        />
      </svg>
      <div class="score-center">
        <span class="score-number" [style.color]="strokeColor()">{{ displayScore() }}</span>
        @if (showLabel) {
          <span class="score-label">Trust Score</span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .trust-ring-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ring-svg {
        transform: rotate(-90deg);
      }
      .progress-ring-circle {
        transition: stroke-dashoffset 0.8s ease, stroke 0.3s ease;
      }
      .score-center {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      .score-number {
        font-weight: 800;
        font-size: 1.85rem;
        line-height: 1;
      }
      .score-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 600;
        margin-top: 4px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    `
  ]
})
export class TrustRingComponent {
  @Input() score = 0;
  @Input() size = 130;
  @Input() strokeWidth = 10;
  @Input() showLabel = true;

  readonly radius = 48;
  readonly circumference = 2 * Math.PI * 48; // ~301.59

  displayScore = computed(() => Math.round(this.score || 0));

  dashOffset = computed(() => {
    const clamped = Math.max(0, Math.min(100, this.displayScore()));
    return this.circumference - (clamped / 100) * this.circumference;
  });

  strokeColor = computed(() => {
    const s = this.displayScore();
    if (s <= 40) return 'var(--color-danger)';
    if (s <= 70) return 'var(--color-warning)';
    return 'var(--primary-teal)';
  });
}
