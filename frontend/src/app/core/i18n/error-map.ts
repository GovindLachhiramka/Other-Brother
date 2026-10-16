export interface ErrorMapping {
  substring: string;
  translationKey: string;
}

export const SERVER_ERROR_MAPPINGS: ErrorMapping[] = [
  { substring: 'already has an active request', translationKey: 'errors.already_has_active_request' },
  { substring: 'active request', translationKey: 'errors.already_has_active_request' },
  { substring: 'request not found', translationKey: 'errors.request_not_found' },
  { substring: 'cannot accept own', translationKey: 'errors.cannot_accept_own_request' },
  { substring: 'no longer open', translationKey: 'errors.request_no_longer_open' },
  { substring: 'already accepted', translationKey: 'errors.already_accepted' },
  { substring: 'cannot cancel', translationKey: 'errors.cannot_cancel' },
  { substring: 'bonus must be higher', translationKey: 'errors.bonus_must_be_higher' },
  { substring: 'not approved', translationKey: 'errors.worker_not_approved' },
  { substring: 'access restricted', translationKey: 'errors.access_restricted' },
  { substring: 'blocked', translationKey: 'errors.account_blocked' },
  { substring: 'failed verification', translationKey: 'errors.failed_attempts' },
  { substring: 'attempts left', translationKey: 'errors.failed_attempts' },
  { substring: 'session expired', translationKey: 'errors.session_expired' },
  { substring: 'unauthorized', translationKey: 'errors.unauthorized' },
  { substring: 'invalid phone', translationKey: 'errors.invalid_phone' },
  { substring: 'invalid credentials', translationKey: 'errors.invalid_credentials' },
  { substring: 'server error', translationKey: 'errors.server_error' },
  { substring: 'network error', translationKey: 'errors.network_error' }
];

export function mapServerErrorToKey(detail: string): string | null {
  if (!detail || typeof detail !== 'string') return null;
  const lower = detail.toLowerCase();
  for (const mapping of SERVER_ERROR_MAPPINGS) {
    if (lower.includes(mapping.substring.toLowerCase())) {
      return mapping.translationKey;
    }
  }
  return null;
}
