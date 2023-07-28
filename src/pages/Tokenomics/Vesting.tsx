/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { fetchUserTokens } from "../../lib";
import { TokenData } from "../../utils/types";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  Tab,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { vestMulti } from "../../lib/vesting";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { getBN } from "@streamflow/stream";
import { Durations, DurationsType, Recipient, RecipientFormInput, UnlockSchedule, UnlockScheduleType, VestParams, VestParamsData } from "../../lib/models/Vesting";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { CustomInput } from "../../components/CustomInput";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import RecipientComponent from "../../components/RecipientComponent";
import toastr from "toastr";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

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
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    position: "relative", // Modal içeriği için göreceli konumlandırma
  },
  backButton: {
    top: theme.spacing(1),
    left: theme.spacing(1),
    color: "black",
    cursor: "pointer",
  },
}));

const recipientDefaultState = { name: "", amount: 0, cliffAmount: 0, recipientAddress: "" };

export const Vesting = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [selectedToken, setSelectedToken] = useState<TokenData>();
  const [vestParams, setVestParams] = useState<VestParamsData>({
    startDate: dayjs().add(1, "h"),
    cliff: dayjs().add(3, "day"),
    period: 1,
    selectedDuration: Durations.DAY,
    selectedUnlockSchedule: UnlockSchedule.HOURLY,
  });

  const [activateCliff, setActivateCliff] = useState<boolean>(false);
  const [recipientModal, setRecipientModal] = useState<{ show: boolean; activeTab?: string }>({ show: false, activeTab: "1" });
  const [recipients, setRecipients] = useState<RecipientFormInput[]>([]);
  const [recipient, setRecipient] = useState<RecipientFormInput>(recipientDefaultState);
  const navigate = useNavigate();

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
    if (wallet && selectedToken && recipients.length > 0) {
      const amountPer = (vestParams.period * vestParams.selectedDuration) / vestParams.selectedUnlockSchedule;

      const params: VestParams = {
        startDate: vestParams.startDate.unix(),
        cliff: activateCliff ? vestParams.cliff?.unix() : 0,
        period: (vestParams.period * vestParams.selectedDuration) / amountPer,
      };

      // {
      //   recipient: "HQj1c4aNzz9C8PFbSBkGCow33beFAsdiqq6gdrYPqf1L", // Recipient address (base58 string for Solana)
      //   amount: getBN(100, selectedToken.decimal), // Deposited amount of tokens (using smallest denomination).
      //   name: "Receipent1", // The stream name or subject.
      //   cliffAmount: getBN(20, selectedToken.decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
      //   amountPerPeriod: getBN(100 / amountPer, selectedToken.decimal), // Release rate: how many tokens are unlocked per each period.
      // },
      // {
      //   recipient: "FX3qSJpidqPfhK8SbNfpoJaZggB9ZQVQ8ACdeRgKrS9d", // Recipient address (base58 string for Solana)
      //   amount: getBN(100, selectedToken.decimal), // Deposited amount of tokens (using smallest denomination).
      //   name: "Receipent2", // The stream name or subject.
      //   cliffAmount: getBN(20, selectedToken.decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
      //   amountPerPeriod: getBN(100 / amountPer, selectedToken.decimal), // Release rate: how many tokens are unlocked per each period.
      // },

      const recipientList: Recipient[] = recipients.map((data) => {
        return {
          recipient: data.recipientAddress, // Recipient address (base58 string for Solana)
          amount: getBN(data.amount, selectedToken.decimal), // Deposited amount of tokens (using smallest denomination).
          name: data.name, // The stream name or subject.
          cliffAmount: getBN(data.cliffAmount, selectedToken.decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
          amountPerPeriod: getBN(data.amount / amountPer, selectedToken.decimal), // Release rate: how many tokens are unlocked per each period.
        };
      });

      const data = await vestMulti(wallet as SignerWalletAdapter, selectedToken, params, recipientList);

      toastr.success("Contract Deployed Successfully");

      console.log(data);

      data?.txs.forEach((tx) => {
        window.open("https://explorer.solana.com/tx/" + tx + "?cluster=devnet", "_blank");
      });

      navigate("/vesting-list");
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

          <FormControlLabel control={<Switch value={true} defaultChecked></Switch>} label="Automatic Withdraw" />

          <FormControlLabel control={<Switch value={activateCliff} onChange={() => setActivateCliff(!activateCliff)} />} label="Activate Cliff" />

          {activateCliff && (
            <FormControl fullWidth>
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
            </FormControl>
          )}
        </Stack>
      </Grid>
      <Grid item marginTop={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
        <CustomButton label="Add Recipient" disable={false} onClick={() => setRecipientModal({ show: true })} />
      </Grid>
      <Grid item marginTop={2} marginBottom={5} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
        <CustomButton label="Create Vesting Contract" disable={selectedToken === undefined || vestParams.period <= 0 || recipients.length <= 0} onClick={startVesting} />
      </Grid>

      <Modal
        className={classes.modal}
        open={recipientModal.show}
        onClose={() => {
          setRecipientModal({ show: false });
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            borderRadius: "8px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 1,
          }}
        >
          <div className={classes.modalContent}>
            <Typography id="modal-modal-title" variant="h6" component="h2" color={"black"} align="center" marginBottom={"1rem"}>
              Manage The Recipient's
            </Typography>
            <Divider />
            <TabContext value={recipientModal?.activeTab || "1"}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={(_event: React.SyntheticEvent, newValue: string) => {
                    setRecipientModal({ ...recipientModal, activeTab: newValue });
                  }}
                >
                  <Tab label="Add New Recipient" value="1" />
                  <Tab label="Recipient List" value="2" />
                </TabList>
              </Box>
              <TabPanel value="1">
                <RecipientComponent
                  inputs={recipient}
                  inputOnChange={(data) => {
                    setRecipient(data);
                  }}
                />
                <Grid item marginTop={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
                  <CustomButton
                    label="Save Recipient"
                    disable={recipient.amount <= 0 || recipient.name === "" || recipient.recipientAddress === ""}
                    onClick={() => {
                      const lastRecipients = [...recipients, recipient];

                      setRecipients(lastRecipients);
                      setRecipient(recipientDefaultState);
                      toastr.success("Recipient added succesfully.");
                    }}
                  />
                </Grid>
              </TabPanel>
              <TabPanel value="2">
                {recipients.length > 0 ? (
                  <List dense sx={{ width: "100%", maxWidth: 800 }}>
                    {recipients.map((value, index) => {
                      const labelId = `checkbox-list-secondary-label-${value}`;
                      return (
                        <>
                          <ListItem
                            key={index}
                            secondaryAction={
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={() => {
                                  const clonedState = [...recipients];
                                  clonedState.splice(index, 1);

                                  setRecipients(clonedState);
                                }}
                              >
                                <DeleteIcon />
                              </Button>
                            }
                            disablePadding
                          >
                            <ListItemButton>
                              <ListItemText
                                style={{ color: "black" }}
                                id={labelId}
                                primary={
                                  "Name : " +
                                  value.name +
                                  ", Address : " +
                                  value.recipientAddress +
                                  ", Amount : " +
                                  value.amount +
                                  (value.cliffAmount > 0 ? ",Cliff Amount : " + value.cliffAmount : "")
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                          <Divider sx={{ marginTop: "0.5rem", marginBottom: "0.5rem", background: "black" }} />
                        </>
                      );
                    })}
                  </List>
                ) : (
                  <span style={{ color: "black" }}>There are no recipients</span>
                )}
              </TabPanel>
            </TabContext>
          </div>
        </Box>
      </Modal>
    </Grid>
  );
};
