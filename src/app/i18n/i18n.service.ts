import { Injectable, signal } from '@angular/core';
import { en } from './en';

type TranslationMap = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class I18nService {
  private translations = signal<TranslationMap>(en);
  private _locale = signal<string>('en');

  readonly locale = this._locale.asReadonly();

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

  /**
   * Switch language at runtime (load a different translation map).
   * For now only 'en' is available.
   */
  async setLocale(locale: string) {
    // Future: dynamically import other locale files
    // const mod = await import(`./${locale}.ts`);
    // this.translations.set(mod.default);
    this._locale.set(locale);
  }
}
