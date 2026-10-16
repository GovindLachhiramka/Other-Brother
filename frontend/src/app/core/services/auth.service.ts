import { Injectable, signal, computed } from '@angular/core';
import { AuthMeResponse } from '../models/api.models';

const STORAGE_KEY_PHONE = 'ob_worker_phone';
const STORAGE_KEY_DEVICE = 'ob_device_id';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private phoneSignal = signal<string | null>(this.getStoredPhone());
  private deviceIdSignal = signal<string>(this.getOrCreateDeviceId());
  private currentUserSignal = signal<AuthMeResponse | null>(null);

  readonly phone = this.phoneSignal.asReadonly();
  readonly deviceId = this.deviceIdSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.phoneSignal());
  readonly isApproved = computed(() => this.currentUserSignal()?.state === 'approved');

  constructor() {}

  /**
   * IMPORTANT AUTH CONTRACT:
   * Returns the token used in Authorization headers for every backend request.
   * Currently returns 'demo:' + the 10-digit phone number for demo verification.
   *
   * FUTURE FIREBASE INTEGRATION:
   * When Firebase Phone OTP Auth is integrated, replace the body of this single function
   * with `await firebase.auth().currentUser?.getIdToken()`.
   * Nothing else in the app needs to change.
   */
  getToken(): string | null {
    const phone = this.phoneSignal();
    if (!phone) {
      return null;
    }
    return `demo:${phone}`;
  }

  setPhone(phone: string) {
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    this.phoneSignal.set(cleanPhone);
    localStorage.setItem(STORAGE_KEY_PHONE, cleanPhone);
  }

  setCurrentUser(user: AuthMeResponse | null) {
    this.currentUserSignal.set(user);
  }

  clearSession() {
    this.phoneSignal.set(null);
    this.currentUserSignal.set(null);
    localStorage.removeItem(STORAGE_KEY_PHONE);
  }

  private getStoredPhone(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_PHONE);
    } catch {
      return null;
    }
  }

  private getOrCreateDeviceId(): string {
    try {
      let id = localStorage.getItem(STORAGE_KEY_DEVICE);
      if (!id) {
        id = 'dev-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem(STORAGE_KEY_DEVICE, id);
      }
      return id;
    } catch {
      return 'dev-' + Math.random().toString(36).substring(2, 10);
    }
  }
}
