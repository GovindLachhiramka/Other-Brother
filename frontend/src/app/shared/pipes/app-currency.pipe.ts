import { Pipe, PipeTransform, inject } from '@angular/core';
import { AppI18nService } from '../../core/i18n/i18n.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false
})
export class AppCurrencyPipe implements PipeTransform {
  private i18n = inject(AppI18nService);

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    return this.i18n.formatCurrency(value);
  }
}
