import { RpcResponseAndContext, TokenAmount } from "@solana/web3.js";
import { TOKEN_TYPES } from "./enum";

export type TokenDetail = {
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
    isRegistered: boolean;
    uri?: string;
  };
  decimal: number;
  supply: RpcResponseAndContext<TokenAmount>;
  owner: string;
};

export type ToolTips = {
  hexToolTip?: boolean;
  ownerToolTip?: boolean;
  walletToolTop?: boolean;
};

export type ChainInfo = {
  absoluteSlot: number;
  blockHeight: number;
  currentEpoch: number;
  transactionCount: number;
};

export type MarketInfo = {
  marketCapRank: number;
  priceChange24h: number;
  priceUsdt: number;
};

export type RecipientModal = {
  show: boolean;
  activeTab: string;
};

export type Section = {
  name: string;
  amount: number;
  percent: number;
  isOldSection: boolean;
};

export type Category = { id: number; label: string; icon: any };

export type Dao = {
  name: string;
  description: string;
};

export type TokenWithType = TokenDetail & {
  type: TOKEN_TYPES;
};
