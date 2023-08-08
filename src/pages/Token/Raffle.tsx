/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useEffect, useState } from "react";
import { getLotteryAddress, getMasterAddress, getProgram, getTicketAddress } from "../../lib/raffles/program";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";

import { BN, Idl, Program } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { error } from "toastr";
import toastr from "toastr";
import { makeStyles } from "@mui/styles";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
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
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { CustomInput } from "../../components/CustomInput";

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

export const Raffle = () => {
  const classes = useStyles();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [program, setProgram] = useState<Program<Idl>>();
  const [masterAddress, setMasterAddress] = useState<PublicKey>();
  const [lastRaffleId, setLastRaffleId] = useState<number>(0);
  const [newTicketPrice, setNewTicketPrice] = useState<number>(0);
  const [activeLotteries, setActiveLotteries] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [showRaffleModal, setShowRaffleModal] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      if (wallet && publicKey) {
        const programInfo = getProgram(connection, wallet);
        setProgram(programInfo);

        const masterAddressInfo = getMasterAddress();
        setMasterAddress(masterAddressInfo);

        const master = await programInfo.account.master.fetch(masterAddressInfo);
        const lastId = master.lastId as number;
        setLastRaffleId(lastId);

        const lotteryAddressPromises: any = [];

        for (let index = 1; index <= lastId; index++) {
          lotteryAddressPromises.push(getLotteryAddress(index));
        }

        const lotteryAddresses = await Promise.all(lotteryAddressPromises);

        const lotteryInfoPromises = lotteryAddresses.map((la) => programInfo.account.lottery.fetch(la));

        const lotteryInfos = await Promise.all(lotteryInfoPromises);

        const activeLotteriesInfo = lotteryInfos.filter((li: any) => li.claimed === false && li.ticketPrice.toString() > 0);

        setActiveLotteries(activeLotteriesInfo);

        setLoading(false);
      }
    };

    init();
    const interval = setInterval(() => init(), 10000);

    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey, wallet]);

  const create = async () => {
    const lotteryAddress = getLotteryAddress(lastRaffleId + 1);

    if (program && publicKey) {
      const tx = await program.methods
        .createLottery(new BN(newTicketPrice * LAMPORTS_PER_SOL))
        .accounts({
          lottery: lotteryAddress,
          master: masterAddress,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toastr.success(tx, "New raffle created Successfullx txid : ");
      setShowRaffleModal(false);
      setNewTicketPrice(0);
    }
  };

  const buyTicket = async (lotteryId: number) => {
    try {
      if (program && publicKey) {
        const lotteryAddress = getLotteryAddress(lotteryId);
        const lottery = await program.account.lottery.fetch(lotteryAddress);

        const tx = await program.methods
          .buyTicket(lotteryId)
          .accounts({
            lottery: lotteryAddress,
            ticket: getTicketAddress(lotteryAddress, (lottery.lastTicketId as number) + 1),
            buyer: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        toastr.success(tx, "Bought new ticket Successfullx txid : ");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const pickWinner = async (lotteryId: number) => {
    try {
      if (program) {
        const lotteryAddress = getLotteryAddress(lotteryId);

        const tx = await program.methods
          .pickWinner(lotteryId)
          .accounts({
            lottery: lotteryAddress,
            authority: publicKey || "",
          })
          .rpc();

        toastr.success(tx, "Winner Selected Successfullx txid : ");
      }
    } catch (err) {
      console.log(error);
    }
  };

  const claim = async (lotteryId: number) => {
    try {
      if (program && publicKey) {
        const lotteryAddress = getLotteryAddress(lotteryId);
        const lottery = await program.account.lottery.fetch(lotteryAddress);
        const winnerId: number = lottery.winnerId as number;

        const userTickets = await program.account.ticket.all([
          {
            memcmp: {
              bytes: bs58.encode(new BN(lotteryId).toArrayLike(Buffer, "le", 4)),
              offset: 12,
            },
          },
          { memcmp: { bytes: publicKey.toBase58(), offset: 16 } },
        ]);

        const userTicketIds: number[] = [];

        userTickets.forEach((ut: any) => {
          userTicketIds.push(ut.account.id);
        });

        if (userTicketIds.includes(winnerId)) {
          const tx = await program.methods
            .claimPrize(lotteryId, lottery.winnerId as number)
            .accounts({
              lottery: lotteryAddress,
              ticket: getTicketAddress(lotteryAddress, lottery.winnerId as number),
              authority: publicKey || "",
              systemProgram: SystemProgram.programId,
            })
            .rpc();
          toastr.success(tx, "Claim completed  Successfullx txid : ");
        } else {
          toastr.warning("You'r not winner, You cant claim");
        }
      }
    } catch (err) {
      console.log(error);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
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
      }}
    >
      <Grid container className={classes.tableContainer}>
        <h2 style={{ margin: 0 }}>Active Raffles</h2>
        <Grid item className={classes.buttonItem}>
          <Button variant="contained" color="primary" size="small" onClick={() => setShowRaffleModal(true)}>
            CREATE A NEW RAFFLE
          </Button>
        </Grid>
        <Grid item justifyContent={"center"} className={classes.tableItem} sx={{ flexDirection: "column !important" }}>
          {activeLotteries.length !== 0 ? (
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
                        align="right"
                        style={{
                          paddingRight: "8px",
                          borderBottom: "1px solid #2C6495",
                        }}
                      >
                        <Typography className={classes.tableHeader} noWrap variant="subtitle1">
                          Raffle No #
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
                          Ticket Count
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
                          Ticket Price
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
                          Prize
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
                          Authority
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeLotteries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((lottery: any, index: number) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                            {lottery.winnerId === null && (
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={() => {
                                  buyTicket(lottery.id);
                                }}
                              >
                                Buy Ticket
                              </Button>
                            )}

                            {lottery.authority.toBase58() === publicKey?.toBase58() && lottery.winnerId === null && (
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={() => {
                                  pickWinner(lottery.id);
                                }}
                              >
                                Pick Winner
                              </Button>
                            )}

                            {lottery.winnerId !== null && (
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={() => {
                                  claim(lottery.id);
                                }}
                              >
                                Check && Claim
                              </Button>
                            )}
                          </div>
                        </TableCell>

                        <TableCell align="right">{lottery.id}</TableCell>
                        <TableCell align="right">{lottery.lastTicketId}</TableCell>
                        <TableCell align="right">{lottery.ticketPrice / LAMPORTS_PER_SOL} SOL</TableCell>
                        <TableCell align="right">{(lottery.ticketPrice * lottery.lastTicketId) / LAMPORTS_PER_SOL} SOL</TableCell>
                        <TableCell align="right">{lottery.authority.toBase58()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={activeLotteries.length}
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
      </Grid>
      <Modal
        className={classes.modal}
        open={showRaffleModal}
        onClose={() => {
          setShowRaffleModal(false);
          setNewTicketPrice(0);
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
            <Typography id="modal-modal-title" variant="h6" component="h2" color={"black"} align="center" marginBottom={"1rem"}>
              Create A New Raffle
            </Typography>
            <div>
              <CustomInput
                placeHolder="Ticket Price"
                label="Ticket Price"
                id="amnewTicketPriceunt"
                name="newTicketPrice"
                type="text"
                value={newTicketPrice}
                onChange={(e: any) => setNewTicketPrice(e.target.value)}
                disable={false}
              ></CustomInput>
              <Divider sx={{ margin: 1 }} />
              <div style={{ textAlign: "center" }}>
                <Button disabled={newTicketPrice <= 0} variant="contained" color="primary" size="small" onClick={() => create()}>
                  Create Raffle
                </Button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
