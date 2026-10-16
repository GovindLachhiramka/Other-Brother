import { Routes } from '@angular/router';
import { workerAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'wait',
    loadComponent: () =>
      import('./features/wait/wait.component').then((m) => m.WaitComponent)
  },
  {
    path: 'rejected',
    loadComponent: () =>
      import('./features/rejected/rejected.component').then((m) => m.RejectedComponent)
  },
  {
    path: 'company',
    loadComponent: () =>
      import('./features/company-portal/company-portal.component').then(
        (m) => m.CompanyPortalComponent
      )
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/worker-layout.component').then(
        (m) => m.WorkerLayoutComponent
      ),
    canActivate: [workerAuthGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'claims',
        loadComponent: () =>
          import('./features/claims/claim-list/claim-list.component').then(
            (m) => m.ClaimListComponent
          )
      },
      {
        path: 'claims/new',
        loadComponent: () =>
          import('./features/claims/claim-create/claim-create.component').then(
            (m) => m.ClaimCreateComponent
          )
      },
      {
        path: 'claims/:id',
        loadComponent: () =>
          import('./features/claims/claim-detail/claim-detail.component').then(
            (m) => m.ClaimDetailComponent
          )
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./features/community/community.component').then(
            (m) => m.CommunityComponent
          )
      },
      {
        path: 'nearby',
        loadComponent: () =>
          import('./features/peer/nearby-brothers.component').then(
            (m) => m.NearbyBrothersComponent
          )
      },
      {
        path: 'community/nearby',
        redirectTo: 'nearby'
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./features/support/help-support.component').then(
            (m) => m.HelpSupportComponent
          )
      },
      {
        path: 'leaderboard',
        loadComponent: () =>
          import('./features/leaderboard/leaderboard.component').then(
            (m) => m.LeaderboardComponent
          )
      },
      {
        path: 'trust',
        loadComponent: () =>
          import('./features/trust/trust.component').then((m) => m.TrustComponent)
      },
      {
        path: 'income',
        loadComponent: () =>
          import('./features/income/income.component').then((m) => m.IncomeComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
