import { StreamflowSolana } from "@streamflow/stream";
import { Dayjs } from "dayjs";

export type VestParams = {
  startDate: number;
  period: number;
  cliff?: number;
};

export type VestParamsData = {
  startDate: Dayjs;
  period: number;
  cliff?: Dayjs;
};

export type Recipient = {
  recipient: string;
  amount: StreamflowSolana.BN;
  name: string;
  cliffAmount: StreamflowSolana.BN;
  amountPerPeriod: StreamflowSolana.BN;
};

export type DurationsType = {
  HOUR: number;
  DAY: number;
  WEEK: number;
  MONTH: number;
  QUARTER: number;
  YEAR: number;
};

export const Durations: DurationsType = {
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
  QUARTER: 7776000,
  YEAR: 31536000,
};
