import { RpcResponseAndContext, TokenAmount } from "@solana/web3.js";

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

export type Dao = {
  account : {
    accountType: number,
        authority?: string,
        communityMint: string,
      config: {
        communityMintMaxVoteWeightSource: {
            type: number,
            value: number,
        },
          councilMint: string,
          // minCommunityTokensToCreateGovernance: number,
          // reserved: number,
          useCommunityVoterWeightAddin: boolean,
          useMaxCommunityVoterWeightAddin: boolean,
        },
      name: string,
      votingProposalCount: number,
  },
  owner: string,
  pubkey: string,
}
