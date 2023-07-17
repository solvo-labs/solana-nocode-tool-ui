export type Token = {
  name: string;
  symbol: string;
  amount: number;
  decimal: number;
};

export type TokenData = {
  hex: string;
  amount: number;
  metadata: {
    name: string;
    symbol: string;
  };
}