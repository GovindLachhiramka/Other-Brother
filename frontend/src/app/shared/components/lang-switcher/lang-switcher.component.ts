import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppI18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lang-switcher" [class.compact]="compact">
      <span class="globe-icon" aria-hidden="true">🌐</span>
      <select
        [ngModel]="i18n.currentLang()"
        (ngModelChange)="onLangChange($event)"
        class="lang-select"
        aria-label="Select language"
      >
        @for (lang of i18n.languages; track lang.code) {
          <option [value]="lang.code">
            {{ lang.nativeName }}
          </option>
        }
      </select>
      <span class="chevron" aria-hidden="true">▼</span>
    </div>
  `,
  styles: [
    `
      .lang-switcher {
        position: relative;
        display: inline-flex;
        align-items: center;
        background: #ffffff;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: var(--radius-pill, 9999px);
        padding: 4px 10px 4px 8px;
        transition: all 0.15s ease;
      }
      .lang-switcher:hover {
        border-color: var(--primary-teal, #0f766e);
        background: var(--primary-teal-surface, #f0fdfa);
      }
      .globe-icon {
        font-size: 0.95rem;
        margin-right: 6px;
        pointer-events: none;
      }
      .lang-select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background: transparent;
        border: none;
        outline: none;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-main, #1e293b);
        padding-right: 14px;
        cursor: pointer;
      }
      .chevron {
        position: absolute;
        right: 8px;
        font-size: 0.55rem;
        color: var(--text-muted, #64748b);
        pointer-events: none;
      }
      .lang-switcher.compact {
        padding: 2px 8px 2px 6px;
      }
      .lang-switcher.compact .lang-select {
        font-size: 0.78rem;
      }
    `
  ]
})
export class LangSwitcherComponent {
  i18n = inject(AppI18nService);
  compact = false;

  onLangChange(code: string) {
    this.i18n.setLanguage(code);
  }
}
