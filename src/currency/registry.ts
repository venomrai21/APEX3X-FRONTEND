import { CurrencyDefinition, CurrencyRegistryExtension } from './types';
import { currencies } from 'countries-list/currencies';

const extensionRegistry = new Map<string, CurrencyRegistryExtension>();

const getLocale = (locale?: string) => locale || (typeof navigator !== 'undefined' ? navigator.languages?.[0] || navigator.language : 'en-US');

const getSupportedCodes = (): string[] => {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: 'currency') => string[] };
  if (typeof intl.supportedValuesOf === 'function') return intl.supportedValuesOf('currency').map(code => code.toUpperCase());
  return [];
};

const getDisplayName = (code: string, locale: string): string => {
  try {
    const DisplayNamesCtor = (Intl as any).DisplayNames;
    if (DisplayNamesCtor) return DisplayNamesCtor([locale], { type: 'currency' }).of(code) || code;
  } catch { /* fall through */ }
  return code;
};

const getSymbol = (code: string, locale: string, display: 'symbol' | 'narrowSymbol'): string | undefined => {
  try {
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: display }).formatToParts(0);
    return parts.find(part => part.type === 'currency')?.value || code;
  } catch {
    return undefined;
  }
};

const getMinorUnit = (code: string, locale: string): number | undefined => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits;
  } catch {
    return undefined;
  }
};

export function registerCurrencyExtensions(entries: CurrencyRegistryExtension[]): void {
  entries.forEach(entry => extensionRegistry.set(entry.code.toUpperCase(), { ...entry, code: entry.code.toUpperCase() }));
}

export function getCurrencyRegistry(locale = getLocale()): CurrencyDefinition[] {
  const runtimeEntries = getSupportedCodes().map(code => ({
    code,
    numericCode: (currencies as Record<string, { numeric?: string }>)[code]?.numeric,
    name: getDisplayName(code, locale),
    symbol: getSymbol(code, locale, 'symbol'),
    narrowSymbol: getSymbol(code, locale, 'narrowSymbol'),
    minorUnit: getMinorUnit(code, locale),
    status: 'supported' as const,
    source: 'CLDR_RUNTIME' as const,
  }));

  const merged = new Map<string, CurrencyDefinition>(runtimeEntries.map(entry => [entry.code, entry]));
  extensionRegistry.forEach((entry, code) => merged.set(code, entry));
  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name, locale, { sensitivity: 'base' }) || a.code.localeCompare(b.code));
}

export function getCurrency(code: string, locale = getLocale()): CurrencyDefinition | undefined {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) return undefined;
  return getCurrencyRegistry(locale).find(currency => currency.code === normalized);
}

export function isSupportedCurrency(code: string): boolean {
  const normalized = String(code || '').trim().toUpperCase();
  return getSupportedCodes().includes(normalized) || extensionRegistry.has(normalized);
}
