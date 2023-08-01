import {  RpcResponseAndContext, TokenAmount } from "@solana/web3.js";

export type Token = {
  name: string;
  symbol: string;
  amount: number;
  decimal: number;
  freezeAuthority?: string;
  authority?: string;
};

export type TokenData = {
  hex: string;
  amount: number;
  metadata: {
    name: string;
    symbol: string;
  };
  decimal: number;
  supply: RpcResponseAndContext<TokenAmount>;
  owner: string;
};
