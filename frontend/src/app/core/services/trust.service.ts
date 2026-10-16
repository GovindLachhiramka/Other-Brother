import { Injectable, effect, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TrustService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  /**
   * Single shared signal for the trust score across the entire application.
   * Navbar, Home, Profile, and Trust Score page all read from this signal.
   */
  readonly trustScore = signal<number>(80);

  constructor() {
    // Initialize from currentUser if available
    const initialScore = this.authService.currentUser()?.trust_score;
    if (initialScore !== undefined && initialScore !== null) {
      this.trustScore.set(Math.round(initialScore));
    }

    // Keep trustScore synchronized whenever currentUser changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.trust_score !== undefined && user.trust_score !== null) {
        const rounded = Math.round(user.trust_score);
        if (this.trustScore() !== rounded) {
          this.trustScore.set(rounded);
        }
      }
    }, { allowSignalWrites: true });

    // Refresh every 30 seconds while the app is open
    setInterval(() => {
      if (this.authService.isAuthenticated()) {
        this.refresh();
      }
    }, 30000);

    // Refresh when the browser tab becomes visible again
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.authService.isAuthenticated()) {
          this.refresh();
        }
      });
    }
  }

  /**
   * Updates the shared trustScore signal with a rounded integer value.
   */
  setScore(rawScore: number | undefined | null) {
    if (rawScore !== undefined && rawScore !== null && !isNaN(Number(rawScore))) {
      const rounded = Math.round(Number(rawScore));
      this.trustScore.set(rounded);

      // Keep AuthService currentUser in sync
      const user = this.authService.currentUser();
      if (user && user.trust_score !== rounded) {
        this.authService.setCurrentUser({ ...user, trust_score: rounded });
      }
    }
  }

  /**
   * Refreshes the score from the server (GET /auth/me or GET /trust/me).
   */
  refresh() {
    this.apiService.getTrustScore().subscribe({
      next: (res) => {
        const score = (res as any).trust_score ?? res.score;
        if (score !== undefined && score !== null) {
          this.setScore(score);
        } else {
          this.refreshFromAuthMe();
        }
      },
      error: () => {
        this.refreshFromAuthMe();
      }
    });
  }

  private refreshFromAuthMe() {
    this.apiService.getAuthMe().subscribe({
      next: (me) => {
        this.authService.setCurrentUser(me);
        if (me.trust_score !== undefined && me.trust_score !== null) {
          this.setScore(me.trust_score);
        }
      },
      error: () => {}
    });
  }

  /**
   * Returns consistent color band name:
   * 0 to 40 -> red
   * 41 to 70 -> amber
   * 71 to 100 -> green
   */
  getBand(score: number = this.trustScore()): 'red' | 'amber' | 'green' {
    const s = Math.round(score);
    if (s <= 40) return 'red';
    if (s <= 70) return 'amber';
    return 'green';
  }

  getBandLabel(score: number = this.trustScore()): string {
    const s = Math.round(score);
    if (s >= 71) return 'Trusted';
    if (s >= 41) return 'Standard';
    return 'High Risk';
  }

  getBandKey(score: number = this.trustScore()): string {
    const s = Math.round(score);
    if (s >= 71) return 'trust.tier_trusted';
    if (s >= 41) return 'trust.tier_standard';
    return 'trust.tier_high_risk';
  }

  getHomeTierLabel(score: number = this.trustScore()): string {
    const s = Math.round(score);
    if (s >= 71) return 'High Trust Tier';
    if (s >= 41) return 'Standard Tier';
    return 'Action Needed';
  }
}
