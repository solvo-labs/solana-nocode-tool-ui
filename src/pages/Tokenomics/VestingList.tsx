/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import { getVestingMyOwn } from "../../lib/vesting";
import { Stream } from "@streamflow/stream/dist/solana";
import {
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
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
  paginaton: {
    display: "flex !important",
    justifyContent: "end",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
    backgroundColor: "purple",
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
  const [vestingList, setVestingList] = useState<[string, Stream][] | undefined>([]);
  const classes = useStyles();

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
        const data = await getVestingMyOwn(publicKey.toBase58());
        const sortedData = data?.sort((a, b) => a[1].createdAt - b[1].createdAt);
        setVestingList(sortedData);
        setLoading(false);
      }
    };

    init();
  }, [publicKey]);

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

  const listVesting = () => {
    return vestingList?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((e: any, index: number) => (
      <TableRow className={classes.tableRow} key={index}>
        <TableCell>{e[1].name}</TableCell>
        <TableCell align="center">{getStatusIcon(e[1].start, e[1].end)}</TableCell>
        <TableCell>{timestampToDate(e[1].start)}</TableCell>
        <TableCell>{timestampToDate(e[1].end)}</TableCell>
        <TableCell>{timestampToDate(e[1].lastWithdrawnAt)}</TableCell>
        <TableCell>{e[1].mint.slice(0, 8)}</TableCell>
        <TableCell align="center">{e[1].period}</TableCell>
        <TableCell align="center">{e[1].withdrawnAmount.toNumber() / 10000000}</TableCell>
        <TableCell align="center">{e[1].depositedAmount.toNumber() / 10000000}</TableCell>
        <TableCell>{timestampToDate(e[1].cliff)}</TableCell>
        <TableCell align="center">{e[1].cliffAmount.toNumber() / Math.pow(10, e[1].cliffAmount.length)}</TableCell>
        <TableCell align="center">{String(e[1].automaticWithdrawal)}</TableCell>
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
    vestingList && (
      <Grid container direction={"row"} className={classes.container}>
        <Grid item className={classes.titleContainer}>
          <Typography variant="h5">Vesting List</Typography>
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
              <TableBody>{listVesting()}</TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid container className={classes.paginaton} sx={{}}>
          <TableFooter>
            <TableCell colSpan={8} padding={"none"} sx={{ border: "none" }}>
              <TablePagination
                rowsPerPageOptions={[1, 5, 10]}
                component="div"
                colSpan={4}
                count={vestingList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableCell>
          </TableFooter>
        </Grid>
      </Grid>
    )
  );
};
