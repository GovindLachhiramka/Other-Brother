import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { AppI18nService } from '../i18n/i18n.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);
  const i18nService = inject(AppI18nService);

  const token = authService.getToken();
  const currentLang = i18nService.currentLang();
  const isRegisterPost = req.method === 'POST' && req.url.endsWith('/register');

  const headers: Record<string, string> = {
    'Accept-Language': currentLang
  };
  if (token && !isRegisterPost) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (!token && req.headers.has('Authorization')) {
    headers['Authorization'] = req.headers.get('Authorization')!;
  }

  const modifiedReq = req.clone({
    setHeaders: headers
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Extract backend detail/reason message
      let message = 'An unexpected server error occurred';
      if (error.error) {
        if (typeof error.error === 'string') {
          message = error.error;
        } else if (error.error.detail) {
          message = typeof error.error.detail === 'string' ? error.error.detail : JSON.stringify(error.error.detail);
        } else if (error.error.reason) {
          message = error.error.reason;
        } else if (error.error.message) {
          message = error.error.message;
        }
      } else if (error.statusText) {
        message = `${error.status}: ${error.statusText}`;
      }

      // Map error using substring translation matching
      const translatedMessage = i18nService.translateApiError(message);

      if (error.status === 401) {
        // Unauthorized - session expired or invalid token
        authService.clearSession();
        // Avoid redirecting if already on login, company, register, or wait, or on POST /register
        const currentUrl = router.url;
        if (
          !currentUrl.includes('/login') &&
          !currentUrl.includes('/company') &&
          !currentUrl.includes('/register') &&
          !currentUrl.includes('/wait') &&
          !isRegisterPost
        ) {
          toastService.error(
            i18nService.translate('errors.session_expired') || 'Session expired. Please log in again.',
            'Unauthorized'
          );
          router.navigate(['/login']);
        }
      } else if (error.status === 403) {
        toastService.warning(
          translatedMessage || i18nService.translate('errors.access_restricted') || 'Access restricted. Worker not approved.',
          'Access Denied'
        );
      } else if (error.status >= 400) {
        toastService.error(translatedMessage, error.status >= 500 ? 'Server Error' : 'Request Failed');
      }

      return throwError(() => error);
    })
  );
};
