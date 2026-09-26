export interface ExchangeRateQuote {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  asOf: string;
  source: string;
}

export interface ExchangeRateProvider {
  getRate(baseCurrency: string, quoteCurrency: string, asOf?: string): Promise<ExchangeRateQuote>;
}

export interface MoneyValue {
  amount: number;
  currency: string;
}

export interface NormalizedMoneyValue extends MoneyValue {
  reportingAmount: number;
  reportingCurrency: string;
  exchangeRate: number;
  exchangeRateTimestamp: string;
}

export const exchangeRateContract = {
  sourceOfTruth: 'backend',
  frontendRole: 'consume-normalized-quotes',
  preserveOriginalTransactionCurrency: true,
} as const;
