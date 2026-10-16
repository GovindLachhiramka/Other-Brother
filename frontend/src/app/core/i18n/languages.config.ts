export interface AppLanguage {
  code: string;
  name: string;
  nativeName: string;
  locale: string;
}

export const DEFAULT_LANG = 'en';

export const LANGUAGES: AppLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', locale: 'en-US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', locale: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', locale: 'bn-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', locale: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', locale: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', locale: 'mr-IN' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', locale: 'id-ID' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', locale: 'vi-VN' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', locale: 'th-TH' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', locale: 'fil-PH' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', locale: 'ms-MY' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', locale: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', locale: 'ko-KR' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文', locale: 'zh-CN' }
];

export const CURRENCY_CONFIG = {
  symbol: '₹',
  code: 'INR'
};
