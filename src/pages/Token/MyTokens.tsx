/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { fetchUserTokens } from "../../lib";
import { CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { Theme } from "@emotion/react";
import { makeStyles } from "@mui/styles";
import { TokenData } from "../../utils/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  container: {
    maxWidth: 700,
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

export const MyTokens = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const classes = useStyles();
  const [allToken, setAllToken] = useState<Array<TokenData>>([]);
  const [actionLoader, setActionLoader] = useState<boolean>(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setActionLoader(true);
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);

        setAllToken(data);
        setActionLoader(false);
      }
    };
    init();
  }, [connection, publicKey]);

  const listToken = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allToken.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((a: any) => (
      <TableRow className={classes.tableRow}>
        <TableCell>{a.metadata.name}</TableCell>
        <TableCell>{a.metadata.symbol}</TableCell>
        <TableCell>{a.supply.value.uiAmount}</TableCell>
        <TableCell>{a.amount / Math.pow(10, a.supply.value.decimals)}</TableCell>
        <TableCell>{a.hex.slice(0, 8) + "..." + a.hex.slice(-5)}</TableCell>
      </TableRow>
    ));
  };

  const loader = () => {
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
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (actionLoader) {
    return (
      <Grid container className={classes.container}>
        <Grid item marginBottom={"1rem"} marginTop={"1rem"}>
          <Typography variant="h5">List of My Tokens</Typography>
        </Grid>
        <Grid item>
          <TableContainer>
            <Table component={Paper} sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableTitle}>Name</TableCell>
                  <TableCell className={classes.tableTitle}>Symbol</TableCell>
                  <TableCell className={classes.tableTitle}>Supply</TableCell>
                  <TableCell className={classes.tableTitle}>Balance</TableCell>
                  <TableCell className={classes.tableTitle}>Hex</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{loader()}</TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container className={classes.container}>
      <Grid item marginBottom={"1rem"} marginTop={"1rem"}>
        <Typography variant="h5">List of My Tokens</Typography>
      </Grid>
      <Grid item>
        <TableContainer>
          <Table component={Paper} sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableTitle}>Name</TableCell>
                <TableCell className={classes.tableTitle}>Symbol</TableCell>
                <TableCell className={classes.tableTitle}>Supply</TableCell>
                <TableCell className={classes.tableTitle}>Balance</TableCell>
                <TableCell className={classes.tableTitle}>Hex</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{listToken()}</TableBody>
            <TableFooter>
              <TableCell colSpan={4} padding={"none"}>
                <TablePagination
                  rowsPerPageOptions={[1, 5, 10]}
                  component="div"
                  colSpan={4}
                  count={allToken.length}
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
    </Grid>
  );
};
