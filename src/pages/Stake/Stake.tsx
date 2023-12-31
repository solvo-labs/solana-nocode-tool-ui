/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ChangeEvent, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL, PublicKey, Transaction, VoteAccountInfo } from "@solana/web3.js";
import {
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Modal,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import StakeClass from "../../lib/stakeClass";
import { makeStyles } from "@mui/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CustomInput } from "../../components/CustomInput";
import toastr from "toastr";
import { Durations, DurationsType } from "../../lib/models/Vesting";
import { getTimestamp } from "../../lib/utils";
import DoneIcon from "@mui/icons-material/Done";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const useStyles = makeStyles((theme: Theme) => ({
  cardContainer: {
    justifyContent: "center",

    [theme.breakpoints.down("sm")]: {
      padding: "1rem",
    },
  },
  tableContainer: {
    justifyContent: "center",
    padding: "1rem 1rem 2rem 1rem;",
    [theme.breakpoints.down("sm")]: {
      padding: "1rem",
    },
  },
  item: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 !important",
    margin: "0 !important",
    width: "100%",
  },
  card: {
    width: "100%",
    marginBottom: "0.8rem",
    border: "1px solid #2C6495",
    overflow: "auto !important",

    borderRadius: "1rem !important",
  },
  buttonItem: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
    marginBottom: "1rem !important",
  },
  tableItem: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    overflowX: "auto",
    border: "1px solid purple",
    borderRadius: "1rem",
  },
  table: { overflowX: "auto" },
  tableHeader: {
    color: "white !important",
    fontWeight: "bold !important",
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
  pagination: {
    color: "white !important",
    "& .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon": {
      color: "white",
      marginRight: "-10px",
    },
    "& .css-1mf6u8l-MuiSvgIcon-root-MuiSelect-icon": {
      color: "white",
      marginRight: "-10px",
    },
    "& .css-zylse7-MuiButtonBase-root-MuiIconButton-root.Mui-disabled": {
      color: "#f5f5f566",
    },
  },
  paginatonContainer: {
    display: "flex !important",
    justifyContent: "end",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
    backgroundColor: "purple",
  },
}));

export const Stake = () => {
  const classes = useStyles();
  const [validators, setValidators] = useState<VoteAccountInfo[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [stakeClassInstance, setStakeClassInstance] = useState<StakeClass>();
  const [loading, setLoading] = useState<boolean>(true);
  const [stakeLoading, setStakeLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [showStakeModal, setShowStakeModal] = useState<boolean>(false);
  const [selectedValidator, setSelectedValidator] = useState<VoteAccountInfo>();
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [timeParams, setTimeParams] = useState<{ period: number; selectedDuration: number; epoch: 0 }>({
    period: 0,
    selectedDuration: Durations.DAY,
    epoch: 0,
  });

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const clearmModalState = () => {
    setShowStakeModal(false);
    setSelectedValidator(undefined);
    setStakeAmount(0);
  };

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const stakeClass = new StakeClass(connection, publicKey);
        setStakeClassInstance(stakeClass);

        const validatorsData = await stakeClass.getValidators();

        setValidators(validatorsData);

        const allStakes = await stakeClass.fetchAllStakes();

        setStakes(allStakes);
        setLoading(false);
      }
    };

    init();
    const interval = setInterval(() => init(), 10000);

    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey]);

  const startStake = async () => {
    setStakeLoading(false);
    try {
      if (publicKey && stakeClassInstance && selectedValidator) {
        let currentTime = 0;

        if (timeParams.period > 0) {
          currentTime = getTimestamp() + timeParams.period * timeParams.selectedDuration;
        }

        const transaction1 = await stakeClassInstance.createStakeAccount(stakeAmount, currentTime, timeParams.epoch);
        const transaction2 = stakeClassInstance.delegateStake(selectedValidator);

        if (transaction2) {
          const transaction = new Transaction();

          transaction.add(transaction1);
          transaction.add(transaction2);

          const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight },
          } = await connection.getLatestBlockhashAndContext();

          if (stakeClassInstance.stakeAccount) {
            const signature = await sendTransaction(transaction, connection, { minContextSlot, signers: [stakeClassInstance.stakeAccount] });
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
            toastr.success("Delegation completed successfully.");
            clearmModalState();
          }
        }
        setStakeLoading(true);
      }
    } catch {
      setStakeLoading(true);
      toastr.error("Something went wrong.");
    }
  };

  const deactivateStake = async (targetPubkey: PublicKey) => {
    setStakeLoading(false);
    if (stakeClassInstance) {
      try {
        const transaction = stakeClassInstance.deactivateStake(targetPubkey);
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
        setStakeLoading(true);
        toastr.success("Deactive stake completed successfully.");
      } catch {
        setStakeLoading(true);
        toastr.error("Something went wrong.");
      }
    }
  };

  const withdrawStake = async (targetPubkey: PublicKey) => {
    setStakeLoading(false);
    try {
      if (stakeClassInstance) {
        const transaction = await stakeClassInstance.withdrawStake(targetPubkey);
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
        setStakeLoading(true);
        toastr.success("Withdraw stake completed successfully.");
      }
    } catch {
      setStakeLoading(true);
      toastr.error("Something went wrong.");
    }
  };

  const statusIcon = (status: string) => {
    return status == "active" ? (
      <Tooltip title={status}>
        <DoneIcon sx={{ color: "green" }}></DoneIcon>
      </Tooltip>
    ) : status == "activating" ? (
      <Tooltip title={status}>
        <AccessTimeIcon sx={{ color: "orange" }}></AccessTimeIcon>
      </Tooltip>
    ) : (
      <Tooltip title={status}>
        <DoNotDisturbIcon sx={{ color: "red" }}></DoNotDisturbIcon>
      </Tooltip>
    );
  };

  if (loading || !stakeLoading) {
    return (
      <div
        style={{
          height: "4rem",
          width: "100%",
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
    <Grid container className={classes.tableContainer}>
      <h2 style={{ margin: 0 }}>Active Stake's</h2>
      <Grid item className={classes.buttonItem}>
        <Button variant="contained" color="primary" size="small" onClick={() => setShowStakeModal(true)}>
          STAKE SOL
        </Button>
      </Grid>
      <Grid item justifyContent={"center"} className={classes.tableItem} sx={{ flexDirection: "column !important" }}>
        {stakes.length !== 0 ? (
          <div>
            <TableContainer component={Paper}>
              <Table stickyHeader style={{ minWidth: "800px" }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      style={{
                        paddingRight: "8px",
                        backgroundColor: "purple",
                      }}
                    >
                      <Typography className={classes.tableHeader} noWrap variant="subtitle1">
                        Actions
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        paddingRight: "8px",
                        backgroundColor: "purple",
                      }}
                    >
                      <Typography className={classes.tableHeader} variant="subtitle1">
                        Voter Address
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        paddingRight: "8px",
                        backgroundColor: "purple",
                      }}
                    >
                      <Typography className={classes.tableHeader} variant="subtitle1">
                        Stake Address
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        paddingRight: "8px",
                        backgroundColor: "purple",
                      }}
                    >
                      <Typography className={classes.tableHeader} variant="subtitle1">
                        Stake Amount
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        paddingRight: "8px",
                        backgroundColor: "purple",
                      }}
                    >
                      <Typography className={classes.tableHeader} variant="subtitle1">
                        Rent Exempt
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        paddingRight: "8px",
                        backgroundColor: "purple",
                      }}
                    >
                      <Typography className={classes.tableHeader} noWrap variant="subtitle1">
                        Active Stake
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        paddingRight: "8px",
                        backgroundColor: "purple",
                      }}
                    >
                      <Typography className={classes.tableHeader} noWrap variant="subtitle1">
                        Status
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stakes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((stake: any, index: number) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={() => {
                              stake.state === "inactive" ? withdrawStake(stake.pubkey) : deactivateStake(stake.pubkey);
                            }}
                          >
                            {stake.state === "inactive" ? "Withdraw" : "UNSTAKE"}
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell
                        align="right"
                        style={{ cursor: "pointer" }}
                        onClick={() => window.open("https://explorer.solana.com/address/" + stake.account.data.parsed.info.stake.delegation.voter + "?cluster=devnet", "_blank")}
                      >
                        {stake.account.data.parsed.info.stake.delegation.voter.slice(0, 6) + "..." + stake.account.data.parsed.info.stake.delegation.voter.slice(-3)}
                      </TableCell>
                      <TableCell
                        align="right"
                        style={{ cursor: "pointer" }}
                        onClick={() => window.open("https://explorer.solana.com/address/" + stake.pubkey.toBase58() + "?cluster=devnet", "_blank")}
                      >
                        {stake.pubkey.toBase58().slice(0, 12) + "..." + stake.pubkey.toBase58().slice(-3)}
                      </TableCell>
                      <TableCell align="right">{stake.account.lamports / LAMPORTS_PER_SOL} SOL</TableCell>
                      <TableCell align="right">{stake.account.data.parsed.info.meta.rentExemptReserve / LAMPORTS_PER_SOL} SOL</TableCell>
                      <TableCell align="right">{stake.account.data.parsed.info.stake.delegation.stake / LAMPORTS_PER_SOL} SOL</TableCell>
                      <TableCell align="right">{statusIcon(stake.state)}</TableCell>
                      {/* <TableCell align="right">{stake.state}</TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Grid container className={classes.paginatonContainer}>
              <TablePagination
                className={classes.pagination}
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={stakes.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Grid>
          </div>
        ) : (
          <Grid
            item
            md={12}
            style={{
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <Card
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "5rem 2.5rem",
                margin: "2rem",
                boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              <Typography
                style={{
                  color: "#1689c5",
                  fontSize: "30px",
                  fontWeight: "bold",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                There are no stakes
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      <Modal
        className={classes.modal}
        open={showStakeModal}
        onClose={() => {
          clearmModalState();
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
            <Typography id="modal-modal-title" variant="h6" component="h2" color={"black"} align="center">
              Stake SOL
            </Typography>
            {selectedValidator && (
              <ArrowBackIcon
                className={classes.backButton}
                onClick={() => {
                  setSelectedValidator(undefined);
                  setStakeAmount(0);
                }}
              />
            )}

            <List sx={{ width: "100%", maxWidth: 800, maxHeight: 600, color: "black", margin: 0, padding: 0, cursor: "pointer", overflowY: "auto" }} key={"list"}>
              {selectedValidator && (
                <Stack key={"stakeModal"} spacing={2} padding={"1rem"}>
                  <span key={"validator"}>Validator : {selectedValidator.votePubkey} </span>
                  <Divider sx={{ margin: 1 }} key={"divider1"} />
                  <span key={"activeSol"}>Activated SOL : {(selectedValidator.activatedStake / LAMPORTS_PER_SOL).toFixed(2)}SOL </span>
                  <Divider sx={{ margin: 1 }} key={"divider2"} />
                  <span key={"commision"}>Commision : {selectedValidator.commission}% </span>
                  <Divider sx={{ margin: 1 }} key={"divider3"} />
                  <Stack spacing={4}>
                    <Grid container gap={2}>
                      <Grid item xs={4}>
                        <FormControl fullWidth>
                          <CustomInput
                            placeHolder="Time Period"
                            label="Time Period"
                            id="period"
                            name="period"
                            type="text"
                            value={timeParams.period}
                            onChange={(e: any) => {
                              setTimeParams({ ...timeParams, period: e.target.value });
                            }}
                            disable={false}
                          ></CustomInput>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="selectLabel">Period</InputLabel>
                          <Select
                            value={timeParams.selectedDuration.toString()}
                            label="Period"
                            onChange={(e: SelectChangeEvent<string>) => {
                              setTimeParams({ ...timeParams, selectedDuration: Number(e.target.value) });
                            }}
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
                    <CustomInput
                      placeHolder="Epoch (Optional)"
                      label="Epoch (Optional)"
                      id="epoch"
                      name="epoch"
                      type="text"
                      value={timeParams.epoch}
                      onChange={(e: any) => setTimeParams({ ...timeParams, epoch: e.target.value })}
                      disable={false}
                      required={false}
                      key={"epoch"}
                    />
                    <CustomInput
                      placeHolder="Sol Amount"
                      label="Sol Amount"
                      id="amount"
                      name="amount"
                      type="text"
                      value={stakeAmount}
                      onChange={(e: any) => setStakeAmount(e.target.value)}
                      disable={false}
                      key={"solAmount"}
                    />
                  </Stack>
                  <Grid item style={{ textAlign: "center" }} marginTop={"2rem !important"} key={"buttonDiv"}>
                    <Button disabled={stakeAmount <= 0} variant="contained" color="primary" size="small" onClick={() => startStake()} key={"stakeButton"}>
                      STAKE SOL
                    </Button>
                  </Grid>
                </Stack>
              )}

              {selectedValidator === undefined &&
                validators.map((vl, index: number) => {
                  return (
                    <div key={index}>
                      <ListItem onClick={() => setSelectedValidator(vl)} key={index}>
                        <ListItemAvatar key={"listItemAvatar" + index}>
                          <Avatar key={index}>{vl.votePubkey.slice(0, 2)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText key={index} primary={vl.votePubkey} secondary={"Balance : " + (vl.activatedStake / LAMPORTS_PER_SOL).toFixed(0) + " SOL"} />
                      </ListItem>
                    </div>
                  );
                })}
            </List>
          </div>
        </Box>
      </Modal>
    </Grid>
  );
};
