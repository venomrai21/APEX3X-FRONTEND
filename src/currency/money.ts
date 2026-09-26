import { formatMoney } from './formatter';

export interface MoneyDisplayValue {
  amount: number;
  currency?: string | null;
}

export function formatMoneyValue(value: MoneyDisplayValue, locale?: string): string {
  return formatMoney(value.amount, value.currency, locale);
}
