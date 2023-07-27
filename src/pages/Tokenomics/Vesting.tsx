/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { fetchUserTokens } from "../../lib";
import { TokenData } from "../../utils/types";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Divider, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { vestMulti } from "../../lib/vesting";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { getBN } from "@streamflow/stream";
import { Durations, DurationsType, Recipient, UnlockSchedule, UnlockScheduleType, VestParams, VestParamsData } from "../../lib/models/Vesting";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { CustomInput } from "../../components/CustomInput";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "30vw",
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
  title: {
    textAlign: "center",
  },
  subTitle: {
    textAlign: "start",
  },
  input: {
    width: "100%",
    // maxHeight: "44px !important",
    [theme.breakpoints.up("sm")]: {
      // minWidth: "18rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      // minWidth: "12rem !important",
    },
  },
}));

export const Vesting = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [receipentPubkey] = useState<string>("9U3AaVHiVhncxnQQGRabQCb1wy7SYJStWbLJXhYXPJ1f");
  const [selectedToken, setSelectedToken] = useState<TokenData>();
  const [vestParams, setVestParams] = useState<VestParamsData>({
    startDate: dayjs().add(1, "h"),
    cliff: dayjs().add(3, "day"),
    period: 1,
    selectedDuration: Durations.DAY,
    selectedUnlockSchedule: UnlockSchedule.HOURLY,
  });
  const classes = useStyles();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);

        setTokens(data);
        // console.log(data.filter((dp)=> dp.hex === "BpAC9vBjvhqQAewx5E1RdqZNrNAD2wbTQP7muK5NNpBJ" ));
      }
    };
    init();
  }, [connection, publicKey]);

  const startVesting = async () => {
    if (wallet && selectedToken && receipentPubkey) {
      const amountPer = (vestParams.period * vestParams.selectedDuration) / vestParams.selectedUnlockSchedule;

      const params: VestParams = {
        startDate: vestParams.startDate.unix(),
        // cliff: vestParams.cliff?.unix(),
        period: (vestParams.period * vestParams.selectedDuration) / amountPer,
      };

      const recipients: Recipient[] = [
        {
          recipient: "HQj1c4aNzz9C8PFbSBkGCow33beFAsdiqq6gdrYPqf1L", // Recipient address (base58 string for Solana)
          amount: getBN(100, selectedToken.decimal), // Deposited amount of tokens (using smallest denomination).
          name: "Receipent1", // The stream name or subject.
          cliffAmount: getBN(0, selectedToken.decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
          amountPerPeriod: getBN(100 / amountPer, selectedToken.decimal), // Release rate: how many tokens are unlocked per each period.
        },
        {
          recipient: "FX3qSJpidqPfhK8SbNfpoJaZggB9ZQVQ8ACdeRgKrS9d", // Recipient address (base58 string for Solana)
          amount: getBN(100, selectedToken.decimal), // Deposited amount of tokens (using smallest denomination).
          name: "Receipent2", // The stream name or subject.
          cliffAmount: getBN(0, selectedToken.decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
          amountPerPeriod: getBN(100 / amountPer, selectedToken.decimal), // Release rate: how many tokens are unlocked per each period.
        },
        // ... Other Recipient options
      ];

      vestMulti(wallet as SignerWalletAdapter, selectedToken, params, recipients);
    }
  };

  // const withdrawToken = async () => {
  //   if (wallet) {
  //     const data = await getStreamById("4pGNY8WcgcrsCwniFe1bbnFwhRKKj1ECaY4fSrJf84zB");

  //     console.log(data);

  //     withdraw(wallet as any, "4pGNY8WcgcrsCwniFe1bbnFwhRKKj1ECaY4fSrJf84zB", 100, 9);
  //     // unlock("2cf8zjHfUR68qUVPWWWdf3E34udtH9tDpm4L9vf2FJGx");
  //   }
  // };

  // useEffect(() => {
  //   const init = async () => {
  //     if (publicKey) {
  //       const data = await getVestingMyOwn(publicKey.toBase58());
  //       console.log(data);
  //     }
  //   };

  //   init();
  // }, [publicKey]);

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Vesting</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid item marginTop={"1.2rem"}>
        <Stack direction={"column"} width={"100%"} spacing={4}>
          <FormControl fullWidth>
            <InputLabel id="selectLabel">Select a Token</InputLabel>
            <Select
              value={selectedToken?.hex || ""}
              label=" Token"
              onChange={(e: SelectChangeEvent<string>) => {
                const token = tokens.find((tkn: TokenData) => tkn.hex === e.target.value);
                if (token != undefined) {
                  setSelectedToken(token);
                }
              }}
              className={classes.input}
              id={"custom-select"}
            >
              {tokens.map((tk: TokenData) => {
                return (
                  <MenuItem key={tk.hex} value={tk.hex}>
                    {tk.metadata.name + "(" + tk.metadata.symbol + ")"}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {
                <DateTimePicker
                  value={vestParams.startDate}
                  disablePast
                  label="Start Date"
                  onChange={(value: dayjs.Dayjs | null) => {
                    if (value) {
                      setVestParams({ ...vestParams, startDate: value });
                    }
                  }}
                />
              }
            </LocalizationProvider>
          </FormControl>
          <Grid container>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <CustomInput
                  placeHolder="Duration"
                  label="Duration"
                  id="name"
                  name="name"
                  type="text"
                  value={vestParams.period}
                  onChange={(e: any) => {
                    setVestParams({ ...vestParams, period: e.target.value });
                  }}
                  disable={false}
                ></CustomInput>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <InputLabel id="selectLabel">Durations</InputLabel>
                <Select
                  value={vestParams.selectedDuration.toString()}
                  label="Durations"
                  onChange={(e: SelectChangeEvent<string>) => {
                    setVestParams({ ...vestParams, selectedDuration: Number(e.target.value) });
                  }}
                  className={classes.input}
                  id={"durations"}
                >
                  {Object.keys(Durations).map((tk) => {
                    return (
                      <MenuItem key={tk} value={Durations[tk as keyof DurationsType]}>
                        {tk}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <FormControl fullWidth>
            <InputLabel id="selectLabel">Unlock Schedule</InputLabel>
            <Select
              value={vestParams.selectedUnlockSchedule.toString()}
              label="Unlock Schedule"
              onChange={(e: SelectChangeEvent<string>) => {
                setVestParams({ ...vestParams, selectedUnlockSchedule: Number(e.target.value) });
              }}
              className={classes.input}
              id={"Unlock Schedule"}
            >
              {Object.keys(UnlockSchedule).map((tk) => {
                return (
                  <MenuItem key={tk} value={UnlockSchedule[tk as keyof UnlockScheduleType]}>
                    {tk}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {
                <DateTimePicker
                  defaultValue={vestParams.cliff}
                  disablePast
                  label="Cliff Date"
                  minDate={vestParams.startDate}
                  onChange={(value: dayjs.Dayjs | null) => {
                    if (value) {
                      setVestParams({ ...vestParams, cliff: value });
                    }
                  }}
                />
              }
            </LocalizationProvider>
          </FormControl> */}
        </Stack>
      </Grid>
      <Grid item marginTop={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
        <CustomButton label="Start Vesting" disable={false} onClick={startVesting} />
      </Grid>
    </Grid>
  );
};
