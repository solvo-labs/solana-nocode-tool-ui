/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import { getVestingMyIncoming, getVestingMyOwn, unlock, withdraw } from "../../lib/vesting";
import { Stream } from "@streamflow/stream/dist/solana";
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Tab,
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
import { makeStyles } from "@mui/styles";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DoneIcon from "@mui/icons-material/Done";
import { getTimestamp } from "../../lib/utils";
import PendingIcon from "@mui/icons-material/Pending";
import { PublicKey } from "@solana/web3.js";
import { getMetadataPDA } from "../../lib/tokenRegister";
import { UnlockSchedule, UnlockScheduleType } from "../../lib/models/Vesting";
import { CustomButton } from "../../components/CustomButton";
import { TabContext, TabList, TabPanel } from "@mui/lab";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  container: {
    minWidth: 1200,
    maxWidth: 1200,
    justifyContent: "center",
  },
  titleContainer: {
    minWidth: "30vw",
    textAlign: "center",
  },
  tableTitle: {
    backgroundColor: "purple",
    color: "white !important",
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: "whitesmoke",
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  },
  paginatonContainer: {
    display: "flex !important",
    justifyContent: "end",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
    backgroundColor: "purple",
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
    "& .makeStyles-pagination-18 .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon": {},
  },
}));

const timestampToDate = (timestamp: number) => {
  const dateFormat = new Date(timestamp * 1000);
  const dayFormat = dateFormat.getDate().toString();
  const monthFormat = (dateFormat.getMonth() + 1).toString();
  const hourFormat = dateFormat.getHours().toString();
  const minutesFormat = dateFormat.getMinutes().toString();

  const formatter = (value: string): string => {
    value.length < 2 ? (value = 0 + "" + value) : value;
    return value;
  };
  const date = formatter(dayFormat) + "/" + formatter(monthFormat) + "/" + dateFormat.getFullYear() + " " + formatter(hourFormat) + ":" + formatter(minutesFormat);
  return timestamp == 0 ? "-" : date;
};

export const VestingList = () => {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [vestingList, setVestingList] = useState<[string, Stream][]>([]);
  const [outgoingvestingList, setOutgoingVestingList] = useState<[string, Stream][]>([]);
  const classes = useStyles();
  const { connection } = useConnection();
  const [activeTab, setActiveTab] = useState<string>("1");
  const wallet = useAnchorWallet();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await getVestingMyIncoming(publicKey.toBase58());
        const outgoingData = await getVestingMyOwn(publicKey.toBase58());

        const sortedData = data?.sort((a, b) => a[1].createdAt - b[1].createdAt);
        const sortedOutgoingData = outgoingData?.sort((a, b) => a[1].createdAt - b[1].createdAt);

        if (sortedData) {
          const decimalPromises: any[] = [];
          const metadataPromises: any[] = [];
          sortedData.forEach((dt) => {
            decimalPromises.push(connection.getTokenSupply(new PublicKey(dt[1].mint)));
            metadataPromises.push(getMetadataPDA(new PublicKey(dt[1].mint), connection));
          });

          const decimalsData = await Promise.all(decimalPromises);
          const metadata = await Promise.all(metadataPromises);

          const finalData = sortedData.map((st: any, index: number) => {
            return { ...st, decimal: decimalsData[index].value.decimals, metadata: metadata[index] };
          });

          setVestingList(finalData || []);
        }

        if (sortedOutgoingData) {
          const decimalPromises: any[] = [];
          const metadataPromises: any[] = [];
          sortedOutgoingData.forEach((dt) => {
            decimalPromises.push(connection.getTokenSupply(new PublicKey(dt[1].mint)));
            metadataPromises.push(getMetadataPDA(new PublicKey(dt[1].mint), connection));
          });

          const decimalsData = await Promise.all(decimalPromises);
          const metadata = await Promise.all(metadataPromises);

          const finalData = sortedOutgoingData.map((st: any, index: number) => {
            return { ...st, decimal: decimalsData[index].value.decimals, metadata: metadata[index] };
          });

          setOutgoingVestingList(finalData || []);
        }
      }

      setLoading(false);
    };

    init();
    const interval = setInterval(() => {
      init();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey]);

  const withdrawToken = async (id: string, decimal: number) => {
    if (wallet) {
      const unlockedData = await unlock(id, decimal);

      console.log(id);

      console.log(unlockedData);

      withdraw(wallet as any, id, 5, decimal);
      // unlock("2cf8zjHfUR68qUVPWWWdf3E34udtH9tDpm4L9vf2FJGx");
    }
  };

  const getStatusIcon = (startDate: number, endDate: number) => {
    const timestamp = getTimestamp();

    if (endDate <= timestamp) {
      return (
        <Tooltip title="Process is completed">
          {
            <span>
              <DoneIcon color="success" sx={{ zIndex: "-10px" }} />
            </span>
          }
        </Tooltip>
      );
    } else if (timestamp >= startDate && timestamp <= endDate) {
      return (
        <Tooltip title="Vesting is processing">
          {
            <span>
              <AutorenewIcon color="success" sx={{ zIndex: "-10px" }} />
            </span>
          }
        </Tooltip>
      );
    }

    return (
      <Tooltip title="Process is waiting">
        {
          <span>
            <PendingIcon color="warning" sx={{ zIndex: "-10px" }} />
          </span>
        }
      </Tooltip>
    );
  };

  const listVesting = (list: any, isOutgoing = false) => {
    return list?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((e: any, index: number) => (
      <TableRow className={classes.tableRow} key={index}>
        <TableCell>{e[1].name}</TableCell>
        <TableCell align="center">{getStatusIcon(e[1].start, e[1].end)}</TableCell>
        <TableCell>{timestampToDate(e[1].start)}</TableCell>
        <TableCell>{timestampToDate(e[1].end)}</TableCell>
        <TableCell>{timestampToDate(e[1].lastWithdrawnAt)}</TableCell>
        <TableCell>{e.metadata.name}</TableCell>
        <TableCell align="center">{Object.keys(UnlockSchedule).find((key) => UnlockSchedule[key as keyof UnlockScheduleType] === e[1].period)}</TableCell>
        <TableCell align="center">{e[1].withdrawnAmount.toNumber() / Math.pow(10, e.decimal)}</TableCell>
        <TableCell align="center">{e[1].depositedAmount.toNumber() / Math.pow(10, e.decimal)}</TableCell>
        <TableCell>{timestampToDate(e[1].cliff)}</TableCell>
        <TableCell align="center">{e[1].cliffAmount.toNumber() / Math.pow(10, e[1].cliffAmount.length)}</TableCell>
        <TableCell align="center">{e[1].automaticWithdrawal ? "YES" : "NO"}</TableCell>
        {!isOutgoing && (
          <TableCell align="center">
            {!e[1].automaticWithdrawal && e[1].withdrawnAmount.toNumber() !== e[1].depositedAmount.toNumber() && getTimestamp() >= e[1].start && getTimestamp() <= e[1].end && (
              <CustomButton
                onClick={() => {
                  withdrawToken(e[0], e.decimal);
                }}
                label={"Claim"}
                disable={false}
              />
            )}
          </TableCell>
        )}
      </TableRow>
    ));
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
    <>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", width: "100%", display: "flex", justifyContent: "center" }}>
          <TabList
            onChange={(_event: React.SyntheticEvent, newValue: string) => {
              setActiveTab(newValue);
            }}
          >
            <Tab label="My Incoming Vesting's" value="1" />
            <Tab label="My Outgoing Vesting's" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          {vestingList && (
            <Grid container direction={"row"} className={classes.container}>
              <Grid item className={classes.titleContainer}>
                <Typography variant="h5">My Incoming Vesting's</Typography>
                <Divider sx={{ marginTop: "1rem", background: "white" }} />
              </Grid>
              <Grid container marginTop={"2rem"}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" className={classes.tableTitle}>
                          Name
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Status
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Start
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          End
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Last Withdrawn At
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Mint
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Period
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Withdrawn Amount
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Deposited Amount
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Cliff
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Cliff Amount
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Automatic Withdrawal
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Claim
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>{listVesting(vestingList)}</TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid container className={classes.paginatonContainer} sx={{}}>
                <TablePagination
                  className={classes.pagination}
                  rowsPerPageOptions={[1, 5, 10]}
                  component="div"
                  colSpan={4}
                  count={vestingList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Grid>
            </Grid>
          )}
        </TabPanel>
        <TabPanel value="2">
          {outgoingvestingList && (
            <Grid container direction={"row"} className={classes.container}>
              <Grid item className={classes.titleContainer}>
                <Typography variant="h5">My Outgoing Vesting's</Typography>
                <Divider sx={{ marginTop: "1rem", background: "white" }} />
              </Grid>
              <Grid container marginTop={"2rem"}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" className={classes.tableTitle}>
                          Name
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Status
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Start
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          End
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Last Withdrawn At
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Mint
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Period
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Withdrawn Amount
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Deposited Amount
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Cliff
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Cliff Amount
                        </TableCell>
                        <TableCell align="center" className={classes.tableTitle}>
                          Automatic Withdrawal
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>{listVesting(outgoingvestingList, true)}</TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid container className={classes.paginatonContainer} sx={{}}>
                <TablePagination
                  className={classes.pagination}
                  rowsPerPageOptions={[1, 5, 10]}
                  component="div"
                  colSpan={4}
                  count={outgoingvestingList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </TabContext>
    </>
  );
};
