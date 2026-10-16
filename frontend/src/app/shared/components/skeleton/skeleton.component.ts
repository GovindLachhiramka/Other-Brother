import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton-box"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="radius"
    ></div>
  `,
  styles: [
    `
      .skeleton-box {
        background: linear-gradient(
          90deg,
          #f1f5f9 25%,
          #e2e8f0 37%,
          #f1f5f9 63%
        );
        background-size: 400% 100%;
        animation: skeletonShimmer 1.4s ease infinite;
      }
      @keyframes skeletonShimmer {
        0% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0 50%;
        }
      }
    `
  ]
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() radius = 'var(--radius-sm)';
}
