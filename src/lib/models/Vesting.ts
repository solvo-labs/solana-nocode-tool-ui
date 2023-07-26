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
