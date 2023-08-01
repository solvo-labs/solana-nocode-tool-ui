/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { fetchUserTokens } from "../../lib";
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
  Typography,
} from "@mui/material";
import { Theme } from "@emotion/react";
import { makeStyles } from "@mui/styles";
import { TokenData } from "../../utils/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  container: {
    minWidth: 1000,
    maxWidth: 1000,
    justifyContent: "center",
  },
  tableTitle: {
    backgroundColor: "purple",
    color: "white !important",
  },
  titleContainer: {
    minWidth: "30vw",
    textAlign: "center",
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
      marginRight: "-10px"
    },
    "& .css-1mf6u8l-MuiSvgIcon-root-MuiSelect-icon": {
      color: "white",
      marginRight: "-10px"
    },
    "& .css-zylse7-MuiButtonBase-root-MuiIconButton-root.Mui-disabled":{
      color: "#f5f5f566"
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

    const interval = setInterval(() => {
      init();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey]);

  const listToken = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allToken
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((a: any, index: number) => (
        <TableRow className={classes.tableRow} key={index}>
          <TableCell>{a.metadata.name}</TableCell>
          <TableCell>{a.metadata.symbol}</TableCell>
          <TableCell>{a.supply.value.uiAmount}</TableCell>
          <TableCell>
            {a.amount / Math.pow(10, a.supply.value.decimals)}
          </TableCell>
          <TableCell>{a.hex.slice(0, 14) + "..." + a.hex.slice(-5)}</TableCell>
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

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (actionLoader) {
    return (
      <Grid container direction={"row"} className={classes.container}>
        <Grid item className={classes.titleContainer}>
          <Typography variant="h5">List of My Tokens</Typography>
          <Divider sx={{ marginTop: "1rem", background: "white" }} />
        </Grid>
        <Grid container marginTop={"2rem"}>
          <TableContainer>
            <Table component={Paper}>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableTitle}>Name</TableCell>
                  <TableCell className={classes.tableTitle}>Symbol</TableCell>
                  <TableCell className={classes.tableTitle}>Supply</TableCell>
                  <TableCell className={classes.tableTitle}>Balance</TableCell>
                  <TableCell className={classes.tableTitle}>Hex</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableCell colSpan={8}>{loader()}</TableCell>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container direction={"row"} className={classes.container}>
      <Grid item className={classes.titleContainer}>
        <Typography variant="h5">List of My Tokens</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid container marginTop={"2rem"}>
        <TableContainer>
          <Table component={Paper}>
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
          </Table>
        </TableContainer>
      </Grid>
      <Grid container className={classes.paginatonContainer}>
        <TableFooter>
          <TableCell colSpan={8} padding={"none"} sx={{ border: "none" }}>
            <TablePagination
              className={classes.pagination}
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
      </Grid>
    </Grid>
  );
};
