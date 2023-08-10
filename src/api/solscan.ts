import axios from "axios";
import { ChainInfo, MarketInfo } from "../utils/types";

const access_token = import.meta.env.VITE_API_KEY;

export const networkInfo = async (): Promise<ChainInfo> => {
  const returnValue = await axios.get(
    "https://public-api.solscan.io/chaininfo?cluster=devnet",
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
    "https://api.solscan.io/market?symbol=SOL&cluster=devnet",
    {
      headers: {
        accept: "application/json",
        token: access_token,
      },
    }
  );
  return { priceUsdt : returnValue.data.data.priceUsdt,marketCapRank: returnValue.data.data.marketCapRank, priceChange24h: returnValue.data.data.priceChange24h }
};
