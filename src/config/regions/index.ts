export type RegionCode = 'MA' | 'FR' | 'ES' | 'NA' | 'TN' | 'DZ';

export interface RegionConfig {
  code: RegionCode;
  name: string;
  currency: {
    code: string;        // 'MAD', 'EUR', 'TND', 'DZD'
    symbol: string;      // 'MAD', '€', 'DT', 'DA'
    position: 'before' | 'after';  // ¿El símbolo va antes o después?
  };
  languages: Array<{
    code: string;        // 'fr', 'es', 'en', 'ar'
    name: string;
    default?: boolean;
  }>;
  locale: string;        // 'fr-MA', 'fr-FR', 'es-ES'
  timezone: string;
  dateFormat: string;
  phonePrefix: string;
}

export const regions: Record<RegionCode, RegionConfig> = {
  MA: {
    code: 'MA',
    name: 'Maroc',
    currency: {
      code: 'MAD',
      symbol: 'MAD',
      position: 'after'
    },
    languages: [
      { code: 'fr', name: 'Français', default: true },
      { code: 'en', name: 'English' }
    ],
    locale: 'fr-MA',
    timezone: 'Africa/Casablanca',
    dateFormat: 'dd/MM/yyyy',
    phonePrefix: '+212'
  },
  FR: {
    code: 'FR',
    name: 'France',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'before'
    },
    languages: [
      { code: 'fr', name: 'Français', default: true },
      { code: 'en', name: 'English' }
    ],
    locale: 'fr-FR',
    timezone: 'Europe/Paris',
    dateFormat: 'dd/MM/yyyy',
    phonePrefix: '+33'
  },
  ES: {
    code: 'ES',
    name: 'España',
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'before'
    },
    languages: [
      { code: 'es', name: 'Español', default: true },
      { code: 'en', name: 'English' }
    ],
    locale: 'es-ES',
    timezone: 'Europe/Madrid',
    dateFormat: 'dd/MM/yyyy',
    phonePrefix: '+34'
  },
  NA: {
    code: 'NA',
    name: 'Afrique du Nord',
    currency: {
      code: 'MAD',
      symbol: 'MAD',
      position: 'after'
    },
    languages: [
      { code: 'fr', name: 'Français', default: true },
      { code: 'en', name: 'English' }
    ],
    locale: 'fr-MA',
    timezone: 'Africa/Casablanca',
    dateFormat: 'dd/MM/yyyy',
    phonePrefix: '+212'
  },
  TN: {
    code: 'TN',
    name: 'Tunisie',
    currency: {
      code: 'TND',
      symbol: 'DT',
      position: 'after'
    },
    languages: [
      { code: 'fr', name: 'Français', default: true },
      { code: 'en', name: 'English' }
    ],
    locale: 'fr-TN',
    timezone: 'Africa/Tunis',
    dateFormat: 'dd/MM/yyyy',
    phonePrefix: '+216'
  },
  DZ: {
    code: 'DZ',
    name: 'Algérie',
    currency: {
      code: 'DZD',
      symbol: 'DA',
      position: 'after'
    },
    languages: [
      { code: 'fr', name: 'Français', default: true },
      { code: 'en', name: 'English' }
    ],
    locale: 'fr-DZ',
    timezone: 'Africa/Algiers',
    dateFormat: 'dd/MM/yyyy',
    phonePrefix: '+213'
  }
};

// Región por defecto
export const DEFAULT_REGION = regions.MA;
