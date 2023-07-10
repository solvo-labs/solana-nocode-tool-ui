import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { fetchUserTokens } from "../../lib";
import { CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
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

  useEffect(() => {
    setActionLoader(true);
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);
        console.log(data);

        setAllToken(data);
        setActionLoader(false);
      }
    };
    init();
  }, [connection, publicKey]);

  const listToken = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allToken.map((a: any) => (
      <TableRow className={classes.tableRow}>
        <TableCell>{a.metadata.data.name}</TableCell>
        <TableCell>{a.metadata.data.symbol}</TableCell>
        <TableCell>{a.amount}</TableCell>
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

  if (actionLoader) {
    return (
      <Grid container className={classes.container}>
        <Grid item marginBottom={"3rem"}>
          <Typography variant="h5">List of My Tokens</Typography>
        </Grid>
        <Grid item>
          <TableContainer>
            <Table component={Paper} sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableTitle}>Name</TableCell>
                  <TableCell className={classes.tableTitle}>Symbol</TableCell>
                  <TableCell className={classes.tableTitle}>Amount</TableCell>
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
      <Grid item marginBottom={"3rem"}>
        <Typography variant="h5">List of My Tokens</Typography>
      </Grid>
      <Grid item>
        <TableContainer>
          <Table component={Paper} sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableTitle}>Name</TableCell>
                <TableCell className={classes.tableTitle}>Symbol</TableCell>
                <TableCell className={classes.tableTitle}>Amount</TableCell>
                <TableCell className={classes.tableTitle}>Hex</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{listToken()}</TableBody>
            {/* <TableFooter>
             <TableRow>
             <TablePagination
             rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
             colSpan={3}
             // count={rows.length}
             // rowsPerPage={rowsPerPage}
             page={page}
             SelectProps={{  
               inputProps: {
                 "aria-label": "rows per page",
                },
                native: true,
              }}
              // onPageChange={handleChangePage}
              // onRowsPerPageChange={handleChangeRowsPerPage}
              // ActionsComponent={TablePaginationActions}
              />
              </TableRow>
            </TableFooter> */}
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};
