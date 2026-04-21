import { Injectable, signal } from '@angular/core';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { pt } from './pt';
import { it } from './it';

type TranslationMap = Record<string, string>;
export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly localeStorageKey = 'placafy.locale';
  private readonly dictionaries: Record<SupportedLocale, TranslationMap> = {
    en,
    es,
    fr,
    de,
    it,
    pt,
  };
  readonly supportedLocales: readonly SupportedLocale[] = ['en', 'es', 'fr', 'de', 'it', 'pt'];
  private translations = signal<TranslationMap>(en);
  private _locale = signal<SupportedLocale>('en');

  readonly locale = this._locale.asReadonly();

  constructor() {
    const locale = this.detectInitialLocale();
    void this.setLocale(locale);
  }

  /**
   * Translate a key, with optional interpolation params.
   * Usage: i18n.t('feed.noResults', { query: 'ABC' })
   */
  t(key: string, params?: Record<string, string | number>): string {
    let value = this.translations()[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return value;
  }

  async setLocale(locale: string) {
    const supportedLocale = this.normalizeLocale(locale);
    this.translations.set(this.dictionaries[supportedLocale]);
    this._locale.set(supportedLocale);
    localStorage.setItem(this.localeStorageKey, supportedLocale);
  }

  private detectInitialLocale(): SupportedLocale {
    const storedLocale = localStorage.getItem(this.localeStorageKey);
    if (storedLocale) {
      return this.normalizeLocale(storedLocale);
    }

    const preferredLocales = navigator.languages?.length ? navigator.languages : [navigator.language];
    const matchedLocale = preferredLocales
      .map(locale => this.normalizeLocale(locale))
      .find(locale => this.supportedLocales.includes(locale));

    return matchedLocale ?? 'en';
  }

  private normalizeLocale(locale: string): SupportedLocale {
    const normalized = locale.toLowerCase();
    if (normalized.startsWith('es')) {
      return 'es';
    }
    if (normalized.startsWith('fr')) {
      return 'fr';
    }
    if (normalized.startsWith('de')) {
      return 'de';
    }
    if (normalized.startsWith('it')) {
      return 'it';
    }
    if (normalized.startsWith('pt')) {
      return 'pt';
    }

    return 'en';
  }
}
