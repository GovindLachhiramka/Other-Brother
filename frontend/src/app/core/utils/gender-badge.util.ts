export interface VerifiedBadgeConfig {
  labelKey: 'badge.verifiedBrother' | 'badge.verifiedSister' | 'badge.verifiedMember';
  icon: string;
  variant: 'teal' | 'rose' | 'neutral';
  badgeClass: string;
}

export function getVerifiedBadgeConfig(gender?: string | null): VerifiedBadgeConfig {
  const g = (gender || '').trim().toLowerCase();
  if (g === 'female') {
    return {
      labelKey: 'badge.verifiedSister',
      icon: '🌸',
      variant: 'rose',
      badgeClass: 'badge-gender-female'
    };
  }
  if (g === 'male') {
    return {
      labelKey: 'badge.verifiedBrother',
      icon: '🤝',
      variant: 'teal',
      badgeClass: 'badge-gender-male'
    };
  }
  return {
    labelKey: 'badge.verifiedMember',
    icon: '✨',
    variant: 'neutral',
    badgeClass: 'badge-gender-other'
  };
}
