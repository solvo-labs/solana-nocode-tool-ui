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
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  Typography,
} from "@mui/material";
import StakeClass from "../../lib/stakeClass";
import { makeStyles } from "@mui/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CustomInput } from "../../components/CustomInput";
import toastr from "toastr";

const useStyles = makeStyles((theme: Theme) => ({
  cardContainer: {
    justifyContent: "center",
    marginTop: "1rem",
    padding: "1rem !important",
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
    border: "1px solid #2C6495",
    borderRadius: "1rem",
  },
  table: { overflowX: "auto" },
  tableHeader: {
    color: "#2C6495 !important",
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
}));

export const Stake = () => {
  const classes = useStyles();
  const [validators, setValidators] = useState<VoteAccountInfo[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [stakeClassInstance, setStakeClassInstance] = useState<StakeClass>();
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [showStakeModal, setShowStakeModal] = useState<boolean>(false);
  const [selectedValidator, setSelectedValidator] = useState<VoteAccountInfo>();
  const [stakeAmount, setStakeAmount] = useState<number>(0);

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
    try {
      if (publicKey && stakeClassInstance && selectedValidator) {
        const transaction1 = await stakeClassInstance.createStakeAccount(stakeAmount);
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
      }
    } catch {
      toastr.error("Something went wrong.");
    }
  };

  const deactivateStake = async (targetPubkey: PublicKey) => {
    if (stakeClassInstance) {
      try {
        const transaction = stakeClassInstance.deactivateStake(targetPubkey);
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
        toastr.success("Deactive stake completed successfully.");
      } catch {
        toastr.error("Something went wrong.");
      }
    }
  };

  const withdrawStake = async (targetPubkey: PublicKey) => {
    try {
      if (stakeClassInstance) {
        const transaction = await stakeClassInstance.withdrawStake(targetPubkey);
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
        toastr.success("Withdraw stake completed successfully.");
      }
    } catch {
      toastr.error("Something went wrong.");
    }
  };

  if (loading) {
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
    <div
      style={{
        height: "100vh",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "6rem",
      }}
    >
      <Grid container className={classes.tableContainer}>
        <Grid item className={classes.buttonItem}>
          <Button variant="contained" color="primary" size="small" onClick={() => setShowStakeModal(true)}>
            STAKE SOL
          </Button>
        </Grid>
        <Grid item justifyContent={"center"} className={classes.tableItem} sx={{ flexDirection: "column !important" }}>
          {stakes.length !== 0 ? (
            <div>
              <TableContainer component={Paper} className={classes.table}>
                <Table aria-label="proposal table" stickyHeader style={{ minWidth: "800px" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        style={{
                          paddingRight: "8px",
                          borderBottom: "1px solid #2C6495",
                        }}
                      >
                        <Typography noWrap className={classes.tableHeader} variant="subtitle1">
                          Actions
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="left"
                        style={{
                          paddingRight: "8px",
                          borderBottom: "1px solid #2C6495",
                        }}
                      >
                        <Typography className={classes.tableHeader} variant="subtitle1">
                          Voter Address
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="left"
                        style={{
                          paddingRight: "8px",
                          borderBottom: "1px solid #2C6495",
                        }}
                      >
                        <Typography className={classes.tableHeader} variant="subtitle1">
                          Stake Address
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        style={{
                          paddingRight: "8px",
                          borderBottom: "1px solid #2C6495",
                        }}
                      >
                        <Typography className={classes.tableHeader} variant="subtitle1">
                          Stake Amount
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        style={{
                          paddingRight: "8px",
                          borderBottom: "1px solid #2C6495",
                        }}
                      >
                        <Typography className={classes.tableHeader} variant="subtitle1">
                          Rent Exempt
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        style={{
                          paddingRight: "8px",
                          borderBottom: "1px solid #2C6495",
                        }}
                      >
                        <Typography className={classes.tableHeader} noWrap variant="subtitle1">
                          Active Stake
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        style={{
                          paddingRight: "8px",
                          borderBottom: "1px solid #2C6495",
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
                              {stake.state === "inactive" ? "Withdraw" : "Deactivate"}
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
                        <TableCell align="right">{stake.state} </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={stakes.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
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
              width: 400,
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

              <List sx={{ width: "100%", maxWidth: 400, maxHeight: 500, color: "black", margin: 0, padding: 0, cursor: "pointer", overflowY: "auto" }}>
                {selectedValidator && (
                  <div>
                    <span>Validator : {selectedValidator.votePubkey.slice(0, 16)} </span>
                    <Divider sx={{ margin: 1 }} />
                    <span>Activated SOL : {(selectedValidator.activatedStake / LAMPORTS_PER_SOL).toFixed(2)}SOL </span>
                    <Divider sx={{ margin: 1 }} />
                    <span>Commision : {selectedValidator.commission}% </span>
                    <Divider sx={{ margin: 1 }} />
                    <CustomInput
                      placeHolder="Sol Amount"
                      label="Sol Amount"
                      id="amount"
                      name="amount"
                      type="text"
                      value={stakeAmount}
                      onChange={(e: any) => setStakeAmount(e.target.value)}
                      disable={false}
                    ></CustomInput>
                    <Divider sx={{ margin: 1 }} />
                    <div style={{ textAlign: "center" }}>
                      <Button disabled={stakeAmount <= 0} variant="contained" color="primary" size="small" onClick={() => startStake()}>
                        STAKE SOL
                      </Button>
                    </div>
                  </div>
                )}

                {selectedValidator === undefined &&
                  validators.map((vl) => {
                    return (
                      <>
                        <ListItem onClick={() => setSelectedValidator(vl)}>
                          <ListItemAvatar>
                            <Avatar>{vl.votePubkey.slice(0, 2)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={vl.votePubkey.slice(0, 10) + "..." + vl.votePubkey.slice(-3)}
                            secondary={(vl.activatedStake / LAMPORTS_PER_SOL).toFixed(2) + " SOL"}
                          />
                        </ListItem>
                        <Divider />
                      </>
                    );
                  })}
              </List>
            </div>
          </Box>
        </Modal>
      </Grid>
    </div>
  );
};
