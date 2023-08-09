/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";

import { RecipientModal } from "../../utils/types";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Box,
  Button,
  CircularProgress,
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
import { useNavigate, useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";

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
  const wallet = useAnchorWallet();
  const [vestParams, setVestParams] = useState<VestParamsData>({
    startDate: dayjs().add(1, "h"),
    cliff: dayjs().add(3, "day"),
    cliffAmount: 0,
    period: 1,
    selectedDuration: Durations.DAY,
    selectedUnlockSchedule: UnlockSchedule.HOURLY,
    automaticWithdraw: true,
  });

  const [activateCliff, setActivateCliff] = useState<boolean>(false);
  const [recipientModal, setRecipientModal] = useState<RecipientModal>({ show: false, activeTab: "1" });
  const [recipients, setRecipients] = useState<RecipientFormInput[]>([]);
  const [recipient, setRecipient] = useState<RecipientFormInput>(recipientDefaultState);
  const [loading, setLoading] = useState<boolean>(true);
  const { connection } = useConnection();
  const [decimal, setDecimal] = useState<number>(0);

  const navigate = useNavigate();

  const classes = useStyles();

  const queryParams = useParams<{ tokenid: string; name: string; amount: string }>();

  useEffect(() => {
    const init = async () => {
      if (queryParams.tokenid) {
        const data = await connection.getTokenSupply(new PublicKey(queryParams.tokenid));
        setDecimal(data.value.decimals);

        setLoading(false);
      }
    };
    init();
    const interval = setInterval(() => {
      init();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [connection, queryParams.tokenid]);

  const startVesting = async () => {
    setLoading(true);
    try {
      if (wallet && recipients.length > 0 && queryParams) {
        const amountPer = (vestParams.period * vestParams.selectedDuration) / vestParams.selectedUnlockSchedule;

        const params: VestParams = {
          startDate: vestParams.startDate.unix(),
          cliff: activateCliff ? vestParams.cliff?.unix() : 0,
          period: (vestParams.period * vestParams.selectedDuration) / amountPer,
          automaticWithdrawal: vestParams.automaticWithdraw,
        };

        const recipientList: Recipient[] = recipients.map((data: RecipientFormInput) => {
          return {
            recipient: data.recipientAddress, // Recipient address (base58 string for Solana)
            amount: getBN(data.amount, decimal), // Deposited amount of tokens (using smallest denomination).
            name: queryParams.name || "", // The stream name or subject.
            cliffAmount: getBN(vestParams.cliffAmount || 0, decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
            amountPerPeriod: getBN(data.amount / amountPer, decimal), // Release rate: how many tokens are unlocked per each period.
          };
        });

        const data = await vestMulti(wallet as SignerWalletAdapter, queryParams.tokenid || "", params, recipientList);

        toastr.success("Contract Deployed Successfully");

        data?.txs.forEach((tx) => {
          window.open("https://explorer.solana.com/tx/" + tx + "?cluster=devnet", "_blank");
        });

        navigate("/tokenomics");
        setLoading(false);
      }
    } catch {
      toastr.error("Something went wrong");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
          width: "50vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Vesting</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid item marginTop={"1.2rem"}>
        <Stack direction={"column"} width={"100%"} spacing={4}>
          <span>Token Total Balance : {queryParams.amount}</span>
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

          <FormControlLabel
            control={
              <Switch
                value={vestParams.automaticWithdraw}
                checked={vestParams.automaticWithdraw}
                onChange={() => {
                  console.log("here");
                  setVestParams({ ...vestParams, automaticWithdraw: !vestParams.automaticWithdraw });
                }}
              ></Switch>
            }
            label="Automatic Withdraw"
          />

          <FormControlLabel control={<Switch value={activateCliff} onChange={() => setActivateCliff(!activateCliff)} />} label="Activate Cliff" />

          {activateCliff && (
            <>
              <FormControl fullWidth>
                <CustomInput
                  label="Cliff Amount (Optional)"
                  name="cliffAmount"
                  onChange={(e: any) => setVestParams({ ...vestParams, cliffAmount: e.target.value })}
                  placeHolder={"Cliff Amount"}
                  type="text"
                  value={vestParams.cliffAmount || 0}
                  disable={false}
                  required={false}
                  id=""
                />
              </FormControl>
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
            </>
          )}
        </Stack>
      </Grid>
      <Grid item marginTop={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
        <CustomButton label="Add Recipient" disable={false} onClick={() => setRecipientModal({ ...recipientModal, show: true })} />
      </Grid>
      <Grid item marginTop={2} marginBottom={5} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
        <CustomButton label="Create Vesting Contract" disable={vestParams.period <= 0 || recipients.length <= 0} onClick={startVesting} />
      </Grid>

      <Modal
        className={classes.modal}
        open={recipientModal.show}
        onClose={() => {
          setRecipientModal({ ...recipientModal, show: false });
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
                    disable={recipient.amount <= 0 || recipient.recipientAddress === ""}
                    onClick={() => {
                      const totalShare = recipients.reduce((acc, cur) => acc + Number(cur.amount), 0);

                      if (totalShare + Number(recipient.amount) > Number(queryParams.amount)) {
                        toastr.error("Please check your input because total balance is exceed");
                      } else {
                        const lastRecipients = [...recipients, recipient];

                        setRecipients(lastRecipients);
                        setRecipient(recipientDefaultState);
                        toastr.success("Recipient added succesfully.");
                      }
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
                              <ListItemText style={{ color: "black" }} id={labelId} primary={"Address : " + value.recipientAddress + ", Amount : " + value.amount} />
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
