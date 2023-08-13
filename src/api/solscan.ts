import axios from "axios";
import { ChainInfo, MarketInfo } from "../utils/types";

const access_token = import.meta.env.VITE_API_KEY;

export const networkInfo = async (): Promise<ChainInfo> => {
  console.log("here");
  const returnValue = await axios.get("https://public-api.solscan.io/chaininfo/", {
    headers: {
      accept: "application/json",
      token: access_token,
    },
  });

  console.log("1", returnValue.data);
  return returnValue.data;
};

export const lastBlock = async (): Promise<number> => {
  const data = await axios.post("https://api.solscan.io/chaininfo?cluster=devnet", {
    headers: {
      accept: "application/json",
    },
  });

  return data.data[0].currentSlot;
};

export const marketInfo = async (): Promise<MarketInfo> => {
  const returnValue = await axios.get("https://api.solscan.io/market?symbol=SOL&cluster=devnet", {
    headers: {
      accept: "application/json",
      token: access_token,
    },
  });

  return { priceUsdt: returnValue.data.data.priceUsdt, marketCapRank: returnValue.data.data.marketCapRank, priceChange24h: returnValue.data.data.priceChange24h };
};
