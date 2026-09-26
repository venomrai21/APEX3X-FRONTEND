import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { getCurrencyRegistry } from '../../currency';
import { Button } from '../apex3x';

export const CurrencySelector: React.FC<{
  value: string;
  onChange: (code: string) => void;
  locale?: string;
  label?: string;
}> = ({ value, onChange, locale, label = 'Business Currency' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const currencies = useMemo(() => getCurrencyRegistry(locale), [locale]);
  const selected = currencies.find(currency => currency.code === value.toUpperCase());
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return currencies;
    return currencies.filter(currency => [currency.code, currency.numericCode, currency.name, currency.symbol, ...(currency.countries || [])].filter(Boolean).some(value => String(value).toLowerCase().includes(term)));
  }, [currencies, query]);

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-[var(--text-secondary)]">{label}</div>
      <div className="relative">
        <Button type="button" variant="secondary" className="w-full justify-between text-left" onClick={() => setOpen(current => !current)} aria-expanded={open} aria-haspopup="listbox">
          <span className="min-w-0 truncate">
            {selected ? <><span className="font-mono font-semibold">{selected.code}</span><span className="ml-2 text-[var(--text-secondary)]">{selected.name}</span><span className="ml-2 text-[var(--text-muted)]">{selected.symbol || ''}</span></> : <span className="text-[var(--text-muted)]">Search and select a currency</span>}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] shadow-2xl">
            <div className="border-b border-[var(--border-subtle)] p-2">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <Search className="h-4 w-4 text-[var(--text-muted)]" />
                <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name, code, numeric code or symbol" className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" aria-label="Search currencies" />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-1" role="listbox" aria-label="All supported currencies">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">All supported ISO / CLDR currencies · {filtered.length}</div>
              {filtered.map(currency => (
                <button key={currency.code} type="button" role="option" aria-selected={currency.code === value.toUpperCase()} onClick={() => { onChange(currency.code); setOpen(false); setQuery(''); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[var(--surface)]">
                  <span className="w-12 shrink-0 font-mono text-xs font-semibold text-[var(--text-primary)]">{currency.code}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-[var(--text-secondary)]">{currency.name}</span>
                  <span className="w-10 shrink-0 text-right text-xs text-[var(--text-muted)]">{currency.symbol || ''}</span>
                  {currency.code === value.toUpperCase() && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--text-primary)]" />}
                </button>
              ))}
              {filtered.length === 0 && <div className="px-3 py-8 text-center text-xs text-[var(--text-muted)]">No supported currency matched your search.</div>}
            </div>
          </div>
        )}
      </div>
      <p className="text-[10px] leading-relaxed text-[var(--text-muted)]">Currency identity is stored by ISO 4217 code. Symbols are presentation only. The registry is generated from the browser's CLDR-backed Intl currency data and can be extended by an authoritative APEX registry later.</p>
    </div>
  );
};
