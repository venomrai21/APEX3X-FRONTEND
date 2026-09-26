export type CurrencyStatus = 'supported' | 'historical' | 'fund' | 'precious_metal' | 'custom';
export type CurrencySource = 'CLDR_RUNTIME' | 'APEX_REGISTRY' | 'CUSTOM';

export interface CurrencyDefinition {
  code: string;
  numericCode?: string;
  name: string;
  symbol?: string;
  narrowSymbol?: string;
  minorUnit?: number;
  status: CurrencyStatus;
  source: CurrencySource;
  countries?: string[];
  validFrom?: string;
  validTo?: string;
}

export interface CurrencyRegistryExtension extends CurrencyDefinition {}
