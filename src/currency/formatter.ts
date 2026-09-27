import { getCurrency } from "./registry";

export const DEFAULT_DISPLAY_CURRENCY = "USD";

export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined,
  locale = typeof navigator !== "undefined" ? navigator.language : "en-US",
) {
  if (amount == null || !Number.isFinite(amount)) return "—";
  const code = String(currency || "").toUpperCase();
  const normalizedLocale = locale.replace(/@.*$/, "");
  if (!code) return "Currency not set";
  try {
    const d = getCurrency(code);
    const digits = d?.minorUnit;
    return new Intl.NumberFormat(normalizedLocale, {
      style: "currency",
      currency: code,
      ...(typeof digits === "number"
        ? { minimumFractionDigits: digits, maximumFractionDigits: digits }
        : {}),
    }).format(amount);
  } catch {
    return code + " " + new Intl.NumberFormat(normalizedLocale).format(amount);
  }
}

export function formatMoneyWithCode(
  amount: number | null | undefined,
  currency: string | null | undefined,
  locale?: string,
) {
  const code = String(currency || "").toUpperCase();
  if (!code) return "Currency not set";
  const formatted = formatMoney(amount, code, locale);
  return formatted === "—" ? formatted : formatted + " · " + code;
}

export function formatDisplayMoney(
  amount: number | null | undefined,
  currency?: string | null,
  locale?: string,
) {
  return formatMoney(amount, currency || DEFAULT_DISPLAY_CURRENCY, locale);
}
