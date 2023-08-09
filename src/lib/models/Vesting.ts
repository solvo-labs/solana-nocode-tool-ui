import { StreamflowSolana } from "@streamflow/stream";
import { Dayjs } from "dayjs";

export type VestParams = {
  startDate: number;
  period: number;
  cliff?: number;
  automaticWithdrawal: boolean;
};

export type VestParamsData = {
  startDate: Dayjs;
  period: number;
  cliff?: Dayjs;
  cliffAmount?: number;
  selectedDuration: number;
  selectedUnlockSchedule: number;
  automaticWithdraw: boolean;
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

export type UnlockScheduleType = {
  PER_SECOND: number;
  PER_MINUTE: number;
  HOURLY: number;
  DAILY: number;
  WEEKLY: number;
  MONTHLY: number;
  QUARTERLY: number;
  YEARLY: number;
};

export const UnlockSchedule: UnlockScheduleType = {
  PER_SECOND: 1,
  PER_MINUTE: 60,
  HOURLY: 3600,
  DAILY: 86400,
  WEEKLY: 604800,
  MONTHLY: 2592000,
  QUARTERLY: 7776000,
  YEARLY: 31536000,
};

export type RecipientFormInput = {
  amount: number;
  recipientAddress: string;
};
