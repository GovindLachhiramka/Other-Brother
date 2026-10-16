import { Injectable, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { AppLanguage, CURRENCY_CONFIG, DEFAULT_LANG, LANGUAGES } from './languages.config';
import { mapServerErrorToKey } from './error-map';

const STORAGE_KEY = 'ob_user_lang';

@Injectable({ providedIn: 'root' })
export class AppI18nService {
  private translocoService = inject(TranslocoService);
  private titleService = inject(Title);

  readonly languages: AppLanguage[] = LANGUAGES;
  readonly currencyConfig = CURRENCY_CONFIG;

  private getInitialLang(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    // Default is ALWAYS 'en'. Do NOT detect browser/phone language.
    return DEFAULT_LANG;
  }

  readonly currentLang = signal<string>(this.getInitialLang());

  readonly currentLocale = computed(() => {
    const lang = this.languages.find((l) => l.code === this.currentLang());
    return lang ? lang.locale : 'en-US';
  });

  constructor() {
    const initial = this.currentLang();
    this.translocoService.setActiveLang(initial);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = initial;
    }
    this.titleService.setTitle('Other/Brother');
  }

  setLanguage(code: string): void {
    if (!this.languages.some((l) => l.code === code)) return;

    this.currentLang.set(code);
    this.translocoService.setActiveLang(code);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
    }
    this.titleService.setTitle('Other/Brother');

    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Ignore localStorage errors
    }
  }

  translate(key: string, params?: Record<string, any>): string {
    return this.translocoService.translate(key, params);
  }

  translateApiError(detail: string): string {
    if (!detail) return '';
    const key = mapServerErrorToKey(detail);
    if (key) {
      const translated = this.translate(key);
      if (translated && translated !== key) {
        return translated;
      }
    }
    return detail;
  }

  formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return `${this.currencyConfig.symbol}${amount}`;
    try {
      const formattedNum = new Intl.NumberFormat(this.currentLocale()).format(num);
      return `${this.currencyConfig.symbol}${formattedNum}`;
    } catch {
      return `${this.currencyConfig.symbol}${num}`;
    }
  }

  formatDate(dateInput: string | Date | number, options?: Intl.DateTimeFormatOptions): string {
    if (!dateInput) return '';
    try {
      const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
      if (isNaN(d.getTime())) return String(dateInput);
      const defaultOptions: Intl.DateTimeFormatOptions = options || {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      return new Intl.DateTimeFormat(this.currentLocale(), defaultOptions).format(d);
    } catch {
      return String(dateInput);
    }
  }

  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.currentLocale(), options).format(num);
    } catch {
      return String(num);
    }
  }
}
