import { Injectable, signal, computed } from '@angular/core';

export interface Country {
  code: string;       // ISO 3166-1 alpha-2
  name: string;
  flag: string;       // emoji
  plateRegex: RegExp;
  placeholder: string;
  formatHint: string;
}

const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States',  flag: '🇺🇸', plateRegex: /^[A-Z0-9]{1,8}$/,           placeholder: 'ABC-1234',  formatHint: '1–8 letters/numbers' },
  { code: 'MX', name: 'México',         flag: '🇲🇽', plateRegex: /^[A-Z]{3}-?\d{3,4}$/,       placeholder: 'ABC-1234',  formatHint: '3 letters + 3–4 digits' },
  { code: 'BR', name: 'Brasil',         flag: '🇧🇷', plateRegex: /^[A-Z]{3}\d[A-Z0-9]\d{2}$/, placeholder: 'ABC1D23',   formatHint: '3 letters + 1 digit + 1 letter/digit + 2 digits' },
  { code: 'AR', name: 'Argentina',      flag: '🇦🇷', plateRegex: /^[A-Z]{2}\d{3}[A-Z]{2}$/,   placeholder: 'AB123CD',   formatHint: '2 letters + 3 digits + 2 letters' },
  { code: 'CO', name: 'Colombia',       flag: '🇨🇴', plateRegex: /^[A-Z]{3}-?\d{3}$/,         placeholder: 'ABC-123',   formatHint: '3 letters + 3 digits' },
  { code: 'CL', name: 'Chile',          flag: '🇨🇱', plateRegex: /^[A-Z]{4}-?\d{2}$/,         placeholder: 'ABCD-12',   formatHint: '4 letters + 2 digits' },
  { code: 'ES', name: 'España',         flag: '🇪🇸', plateRegex: /^\d{4}[A-Z]{3}$/,           placeholder: '1234ABC',   formatHint: '4 digits + 3 letters' },
  { code: 'DE', name: 'Deutschland',    flag: '🇩🇪', plateRegex: /^[A-Z]{1,3}-?[A-Z]{1,2}-?\d{1,4}$/, placeholder: 'B-AB-1234', formatHint: '1–3 letters + 1–2 letters + 1–4 digits' },
  { code: 'FR', name: 'France',         flag: '🇫🇷', plateRegex: /^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/,       placeholder: 'AB-123-CD', formatHint: '2 letters + 3 digits + 2 letters' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', plateRegex: /^[A-Z]{2}\d{2}[A-Z]{3}$/,   placeholder: 'AB12CDE',   formatHint: '2 letters + 2 digits + 3 letters' },
  { code: 'PT', name: 'Portugal',       flag: '🇵🇹', plateRegex: /^[A-Z]{2}-?\d{2}-?[A-Z]{2}$/, placeholder: 'AB-12-CD', formatHint: '2 letters + 2 digits + 2 letters' },
  { code: 'IT', name: 'Italia',         flag: '🇮🇹', plateRegex: /^[A-Z]{2}\d{3}[A-Z]{2}$/,   placeholder: 'AB123CD',   formatHint: '2 letters + 3 digits + 2 letters' },
];

@Injectable({ providedIn: 'root' })
export class PlateValidationService {
  private _selectedCountry = signal<Country>(COUNTRIES[0]);

  readonly selectedCountry = this._selectedCountry.asReadonly();
  readonly countries = COUNTRIES;

  readonly placeholder = computed(() => this._selectedCountry().placeholder);
  readonly formatHint = computed(() => this._selectedCountry().formatHint);

  selectCountry(code: string) {
    const country = COUNTRIES.find(c => c.code === code);
    if (country) this._selectedCountry.set(country);
  }

  /**
   * Validate a plate number against the currently selected country's format.
   * Strips dashes/spaces before matching so users can type freely.
   */
  validate(plateNumber: string): { valid: boolean; hint: string } {
    const cleaned = plateNumber.replace(/[-\s]/g, '').toUpperCase().trim();
    console.log('cleaned', cleaned);
    if (!cleaned) return { valid: false, hint: '' };

    // TODO: re-enable country-specific regex validation
    // const country = this._selectedCountry();
    // const valid = country.plateRegex.test(cleaned);
    return {
      valid: cleaned.length >= 2,
      hint: '',
    };
  }
}
