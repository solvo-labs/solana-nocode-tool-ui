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
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((_theme: Theme) => ({
  container: {
    minWidth: 1500,
    maxWidth: 1500,
    justifyContent: "center",
  },
  tableTitle: {
    backgroundColor: "purple",
    color: "white !important",
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: "gray",
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  },
}));

const timestampToDate = (timestamp: number) => {
  const dateFormat = new Date(timestamp * 1000);
  const date =
    dateFormat.getDate() +
    "/" +
    (dateFormat.getMonth() + 1) +
    "/" +
    dateFormat.getFullYear();
  return date;
};

export const VestingList = () => {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [vestingList, setVestingList] = useState<
    [string, Stream][] | undefined
  >([]);
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
        const keyim = "CMiHYdJFr1sGYhT1y1Svy4KyhASweq4yoTGtEFVZi5cP";
        const data = await getVestingMyOwn(keyim);
        const sortedData = data?.sort((a, b) => a[1].createdAt - b[1].createdAt);
        setVestingList(sortedData);
        setLoading(false);
      }
    };

    init();
  }, [publicKey]);

  const listVesting = () => {
    return vestingList?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((e: any) => (
      // console.log(e[1].period)

      <TableRow className={classes.tableRow}>
        <TableCell>{e[1].name}</TableCell>
        <TableCell>{timestampToDate(e[1].start)}</TableCell>
        <TableCell>{timestampToDate(e[1].end)}</TableCell>
        <TableCell>{timestampToDate(e[1].lastWithdrawnAt)}</TableCell>
        <TableCell>{e[1].mint.slice(0, 8)}</TableCell>
        <TableCell>{e[1].period}</TableCell>
        <TableCell>{e[1].withdrawnAmount.toNumber() / 10000000}</TableCell>
        <TableCell>{e[1].depositedAmount.toNumber() / 10000000}</TableCell>
        <TableCell>{timestampToDate(e[1].cliff)}</TableCell>
        <TableCell>{e[1].cliffAmount.toNumber() / Math.pow(10, e[1].cliffAmount.length)}</TableCell>
        <TableCell>{e[1].period}</TableCell>
        <TableCell>{String(e[1].transferableBySender)}</TableCell>
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

  return (vestingList && 
    (<Grid container direction={"row"} className={classes.container}>
      <Grid item>
        <Typography variant="h5">Vesting List</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid container marginTop={"2rem"}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableTitle}>name</TableCell>
                <TableCell className={classes.tableTitle}>Start</TableCell>
                <TableCell className={classes.tableTitle}>End</TableCell>
                <TableCell className={classes.tableTitle}>lastWith</TableCell>
                <TableCell className={classes.tableTitle}>mint</TableCell>
                <TableCell className={classes.tableTitle}>period</TableCell>
                <TableCell className={classes.tableTitle}>withdrawn</TableCell>
                <TableCell className={classes.tableTitle}>deposited</TableCell>
                <TableCell className={classes.tableTitle}>cliff</TableCell>
                <TableCell className={classes.tableTitle}>
                  cliff amount
                </TableCell>
                <TableCell className={classes.tableTitle}>period</TableCell>
                <TableCell className={classes.tableTitle}>automatic</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{listVesting()}</TableBody>
            <TableFooter>
              <TableCell colSpan={12} padding={"none"}>
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
          </Table>
        </TableContainer>
      </Grid>
    </Grid>)
  );
};
