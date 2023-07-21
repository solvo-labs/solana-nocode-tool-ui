import { ChangeEvent, useEffect, useState } from "react";
import { getLotteryAddress, getMasterAddress, getProgram, getTicketAddress } from "../../lib/raffles/program";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";

import { BN, Idl, Program } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { error } from "toastr";
import toastr from "toastr";
import { makeStyles } from "@mui/styles";
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
import { CustomInput } from "../../components/CustomInput";
import { withdrawStake, deactivateStake } from "../../lib/stake";

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
  const [newTicketPrice, setNewTicketPrice] = useState<number>(0.1);
  const [activeLotteries, setActiveLotteries] = useState<any>([]);
  // const [selectedLotteryId, setSelectedLotteryId] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        const programInfo = getProgram(connection, wallet);
        setProgram(programInfo);

        const masterAddressInfo = await getMasterAddress();
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

        const activeLotteriesInfo = lotteryInfos.filter((li: any) => li.claimed === false);
        console.log(activeLotteriesInfo);
        setActiveLotteries(activeLotteriesInfo);

        setLoading(false);

        // const lotteryHistory = lotteryInfos.filter((li: any) => li.claimed);

        // const lotteryAddress = await getLotteryAddress(master.lastId as any);

        // const lottery = await program.account.lottery.fetch(lotteryAddress);

        // const totalPrize = getTotalPrize(lottery as any);

        // console.log(lottery);
        // console.log(totalPrize);

        // const userTickets = await program.account.ticket.all([
        //   {
        //     memcmp: {
        //       bytes: bs58.encode(new BN(lottery.lastId as any).toArrayLike(Buffer, "le", 4)),
        //       offset: 12,
        //     },
        //   },
        //   { memcmp: { bytes: wallet.publicKey.toBase58(), offset: 16 } },
        // ]);
      }
    };

    init();
  }, [connection, wallet]);

  const create = async () => {
    const lotteryAddress = await getLotteryAddress(lastRaffleId + 1);

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
    }
  };

  const buyTicket = async (lotteryId: number) => {
    try {
      if (program && publicKey) {
        const lotteryAddress = await getLotteryAddress(lotteryId);
        const lottery = await program.account.lottery.fetch(lotteryAddress);

        const tx = await program.methods
          .buyTicket(lotteryId)
          .accounts({
            lottery: lotteryAddress,
            ticket: await getTicketAddress(lotteryAddress, (lottery.lastTicketId as number) + 1),
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

  const pickWinner = async () => {
    try {
      const lotteryId = 52;
      const program = getProgram(connection, wallet!);
      const lotteryAddress = await getLotteryAddress(lotteryId);
      const lottery = await program.account.lottery.fetch(lotteryAddress);

      const txHash = await program.methods
        .pickWinner(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          authority: publicKey || "",
        })
        .rpc();

      console.log(txHash);
    } catch (err) {
      console.log(error);
    }
  };

  const claim = async () => {
    try {
      const lotteryId = 52;
      const program = getProgram(connection, wallet!);
      const lotteryAddress = await getLotteryAddress(lotteryId);
      const lottery = await program.account.lottery.fetch(lotteryAddress);
      console.log(lottery);

      const txHash = await program.methods
        .claimPrize(lotteryId, lottery.winnerId as number)
        .accounts({
          lottery: lotteryAddress,
          ticket: await getTicketAddress(lotteryAddress, lottery.winnerId as number),
          authority: publicKey || "",
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(txHash);
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

  console.log(activeLotteries);

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
        <h2 style={{ margin: 0 }}>Active Raffles</h2>
        <Grid item className={classes.buttonItem}>
          <Button variant="contained" color="primary" size="small" onClick={create}>
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
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              onClick={() => {
                                buyTicket(lottery.id);
                              }}
                            >
                              Button
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell align="right">{lottery.id}</TableCell>
                        <TableCell align="right">{lottery.lastTicketId}</TableCell>
                        <TableCell align="right">{lottery.ticketPrice / LAMPORTS_PER_SOL} SOL</TableCell>
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
    </div>
  );
};
