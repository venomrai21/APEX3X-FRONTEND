export type CurrencyDisplayMode = 'symbol' | 'narrowSymbol' | 'code' | 'name';

export function formatMoney(value: number, currency: string | undefined | null, locale?: string, currencyDisplay: CurrencyDisplayMode = 'symbol'): string {
  const code = String(currency || '').trim().toUpperCase();
  if (!code || !Number.isFinite(value)) return Number.isFinite(value) ? value.toLocaleString(locale) : '—';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay }).format(value);
  } catch {
    return code + ' ' + value.toLocaleString(locale);
  }
}

export function formatCurrencyCode(value: number, currency: string | undefined | null, locale?: string): string {
  return formatMoney(value, currency, locale, 'code');
}
