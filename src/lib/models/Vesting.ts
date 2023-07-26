import { StreamflowSolana } from "@streamflow/stream";

export type VestParams = {
  startDate: number;
  period: number;
  cliff?: number;
};

export type Recipient = {
  recipient: string;
  amount: StreamflowSolana.BN;
  name: string;
  cliffAmount: StreamflowSolana.BN;
  amountPerPeriod: StreamflowSolana.BN;
};
