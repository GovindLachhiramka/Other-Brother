import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { of, map, catchError } from 'rxjs';

export const workerAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const apiService = inject(ApiService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // If we already have the approved current user in memory
  const user = authService.currentUser();
  if (user) {
    if (user.state === 'approved') {
      return true;
    }
    if (user.state === 'awaiting_company') {
      return router.createUrlTree(['/wait']);
    }
    if (user.state === 'rejected') {
      return router.createUrlTree(['/rejected']);
    }
    return router.createUrlTree(['/register']);
  }

  // Otherwise verify against /auth/me
  return apiService.getAuthMe().pipe(
    map((me) => {
      authService.setCurrentUser(me);
      if (me.state === 'approved') {
        return true;
      }
      if (me.state === 'awaiting_company') {
        return router.createUrlTree(['/wait']);
      }
      if (me.state === 'rejected') {
        return router.createUrlTree(['/rejected']);
      }
      return router.createUrlTree(['/register']);
    }),
    catchError(() => {
      authService.clearSession();
      return of(router.createUrlTree(['/login']));
    })
  );
};
