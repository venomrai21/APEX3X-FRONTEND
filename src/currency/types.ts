export type CurrencyStatus = "active" | "historical" | "fund" | "precious_metal" | "custom";
export type CurrencySource = "ISO4217+CLDR" | "CUSTOM" | "API";

export interface CurrencyDefinition { code:string; name:string; nativeName?:string; symbol?:string; nativeSymbol?:string; numericCode?:string; minorUnit?:number; status:CurrencyStatus; source:CurrencySource; validFrom?:string; validTo?:string; }
export interface MoneyValue { amount:number; currency:string; reportingAmount?:number; reportingCurrency?:string; exchangeRate?:number; exchangeRateTimestamp?:string; }
