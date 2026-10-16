import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe],
  template: `
    <div class="not-found-page animate-fade-in">
      <div class="not-found-card">
        <div class="err-badge">{{ 'not_found.badge' | transloco }}</div>
        <h1 class="err-title">{{ 'not_found.title' | transloco }}</h1>
        <p class="err-desc">
          {{ 'not_found.desc' | transloco }}
        </p>
        <a routerLink="/home" class="btn-return-home">
          {{ 'not_found.return_home' | transloco }}
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-page);
        padding: 24px;
      }
      .not-found-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 48px 36px;
        max-width: 480px;
        width: 100%;
        text-align: center;
        box-shadow: var(--shadow-xl);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .err-badge {
        font-size: 4rem;
        font-weight: 800;
        color: var(--accent-orange);
        line-height: 1;
        margin-bottom: 12px;
      }
      .err-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-main);
        margin-bottom: 8px;
      }
      .err-desc {
        font-size: 0.95rem;
        color: var(--text-muted);
        line-height: 1.5;
        margin-bottom: 24px;
      }
      .btn-return-home {
        background: var(--primary-teal);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 12px 24px;
        border-radius: var(--radius-pill);
        text-decoration: none;
        transition: background 0.15s;
      }
      .btn-return-home:hover {
        background: var(--primary-teal-hover);
        text-decoration: none;
      }
    `
  ]
})
export class NotFoundComponent {}
