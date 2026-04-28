type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';
type RelativeTimeKey =
  | 'time.justNow'
  | 'time.minutesAgo'
  | 'time.hoursAgo'
  | 'time.daysAgo'
  | 'time.weeksAgo';

const relativeTimeTranslations: Record<SupportedLocale, Record<RelativeTimeKey, string>> = {
  en: {
    'time.justNow': 'just now',
    'time.minutesAgo': '{count}m ago',
    'time.hoursAgo': '{count}h ago',
    'time.daysAgo': '{count}d ago',
    'time.weeksAgo': '{count}w ago',
  },
  es: {
    'time.justNow': 'ahora',
    'time.minutesAgo': 'hace {count} min',
    'time.hoursAgo': 'hace {count} h',
    'time.daysAgo': 'hace {count} d',
    'time.weeksAgo': 'hace {count} sem',
  },
  fr: {
    'time.justNow': "a l'instant",
    'time.minutesAgo': 'il y a {count} min',
    'time.hoursAgo': 'il y a {count} h',
    'time.daysAgo': 'il y a {count} j',
    'time.weeksAgo': 'il y a {count} sem',
  },
  de: {
    'time.justNow': 'gerade eben',
    'time.minutesAgo': 'vor {count} Min',
    'time.hoursAgo': 'vor {count} Std',
    'time.daysAgo': 'vor {count} T',
    'time.weeksAgo': 'vor {count} Wo',
  },
  it: {
    'time.justNow': 'adesso',
    'time.minutesAgo': '{count} min fa',
    'time.hoursAgo': '{count} h fa',
    'time.daysAgo': '{count} g fa',
    'time.weeksAgo': '{count} sett fa',
  },
  pt: {
    'time.justNow': 'agora',
    'time.minutesAgo': 'ha {count} min',
    'time.hoursAgo': 'ha {count} h',
    'time.daysAgo': 'ha {count} d',
    'time.weeksAgo': 'ha {count} sem',
  },
};

function normalizeLocale(locale: string): SupportedLocale {
  const normalized = locale.toLowerCase();
  if (normalized.startsWith('es')) return 'es';
  if (normalized.startsWith('fr')) return 'fr';
  if (normalized.startsWith('de')) return 'de';
  if (normalized.startsWith('it')) return 'it';
  if (normalized.startsWith('pt')) return 'pt';
  return 'en';
}

function currentLocale(): SupportedLocale {
  const storedLocale = localStorage.getItem('placafy.locale');
  if (storedLocale) {
    return normalizeLocale(storedLocale);
  }
  return normalizeLocale(navigator.language);
}

function t(key: RelativeTimeKey, params?: Record<string, number>): string {
  const locale = currentLocale();
  const template = relativeTimeTranslations[locale][key];
  if (!params) return template;

  let value = template;
  for (const [name, paramValue] of Object.entries(params)) {
    value = value.replace(new RegExp(`\\{${name}\\}`, 'g'), String(paramValue));
  }
  return value;
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return t('time.justNow');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('time.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('time.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t('time.daysAgo', { count: days });
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return t('time.weeksAgo', { count: weeks });
  return date.toLocaleDateString(currentLocale());
}
