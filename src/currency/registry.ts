import { CurrencyDefinition, CurrencyRegistryExtension } from './types';
import { currencies } from 'countries-list/currencies';

const extensionRegistry = new Map<string, CurrencyRegistryExtension>();

const getLocale = (locale?: string) => locale || (typeof navigator !== 'undefined' ? navigator.languages?.[0] || navigator.language : 'en-US');

const getSupportedCodes = (): string[] => {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: 'currency') => string[] };
  const runtimeCodes = typeof intl.supportedValuesOf === 'function' ? intl.supportedValuesOf('currency') : [];
  return Array.from(new Set([...runtimeCodes, ...Object.keys(currencies)])).map(code => code.toUpperCase());
};

type CurrencyDatasetEntry = {
  name?: string;
  symbol?: string;
  numeric?: string;
  decimals?: number;
  withdrawn?: boolean;
};

const getDatasetEntry = (code: string): CurrencyDatasetEntry | undefined =>
  (currencies as Record<string, CurrencyDatasetEntry>)[code];

const getDisplayName = (code: string, locale: string, fallback?: string): string => {
  try {
    const DisplayNamesCtor = (Intl as any).DisplayNames;
    if (DisplayNamesCtor) return new DisplayNamesCtor([locale], { type: 'currency' }).of(code) || fallback || code;
  } catch { /* fall through */ }
  return fallback || code;
};

const getSymbol = (code: string, locale: string, display: 'symbol' | 'narrowSymbol', fallback?: string): string | undefined => {
  try {
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: display }).formatToParts(0);
    return parts.find(part => part.type === 'currency')?.value || fallback;
  } catch {
    return fallback;
  }
};

const getMinorUnit = (code: string, locale: string, fallback?: number): number | undefined => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits;
  } catch {
    return fallback;
  }
};

export function registerCurrencyExtensions(entries: CurrencyRegistryExtension[]): void {
  entries.forEach(entry => extensionRegistry.set(entry.code.toUpperCase(), { ...entry, code: entry.code.toUpperCase() }));
}

export function getCurrencyRegistry(locale = getLocale()): CurrencyDefinition[] {
  const runtimeEntries = getSupportedCodes().map(code => {
    const dataset = getDatasetEntry(code);
    return {
      code,
      numericCode: dataset?.numeric,
      name: getDisplayName(code, locale, dataset?.name),
      symbol: getSymbol(code, locale, 'symbol', dataset?.symbol),
      narrowSymbol: getSymbol(code, locale, 'narrowSymbol', dataset?.symbol),
      minorUnit: getMinorUnit(code, locale, dataset?.decimals),
      status: dataset?.withdrawn ? 'historical' as const : 'supported' as const,
      source: 'CLDR_RUNTIME' as const,
    };
  });

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
