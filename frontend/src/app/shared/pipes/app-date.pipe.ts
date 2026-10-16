import { Pipe, PipeTransform, inject } from '@angular/core';
import { AppI18nService } from '../../core/i18n/i18n.service';

@Pipe({
  name: 'appDate',
  standalone: true,
  pure: false
})
export class AppDatePipe implements PipeTransform {
  private i18n = inject(AppI18nService);

  transform(value: string | Date | number | null | undefined, options?: Intl.DateTimeFormatOptions): string {
    if (!value) return '';
    return this.i18n.formatDate(value, options);
  }
}
