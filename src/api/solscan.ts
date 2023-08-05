import axios from "axios";
import { ChainInfo, MarketInfo } from "../utils/types";

const access_token;

export const networkInfo = async (): Promise<ChainInfo> => {
  const returnValue = await axios.get(
    "https://public-api.solscan.io/chaininfo/",
    {
      headers: {
        accept: "application/json",
        token: access_token,
      },
    }
  );
  return returnValue.data;
};

export const lastBlock = async (): Promise<number> => {
  const data = await axios.get(
    "https://public-api.solscan.io/block/last?limit=10",
    {
      headers: {
        accept: "application/json",
        token: access_token,
      },
    }
  );
  return data.data[0].currentSlot;
};

export const marketInfo = async ():Promise<MarketInfo> => {
  const returnValue = await axios.get(
    "https://public-api.solscan.io/market/token/So11111111111111111111111111111111111111112",
    {
      headers: {
        accept: "application/json",
        token: access_token,
      },
    }
  );
  return { marketCapRank: returnValue.data.marketCapRank, priceChange24h: returnValue.data.priceChange24h, priceUsdt: returnValue.data.priceUsdt};
};
