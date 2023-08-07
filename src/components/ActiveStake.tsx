import React from "react";
import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { makeStyles } from "@mui/styles";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  card: {
    borderRadius: "16px !important",
    height: "260px",
  },
  detailButton: {
    "& .css-nixcjy-MuiSvgIcon-root": {
      fontSize: "1rem !important",
      padding: "0rem !important",
    },
  },
  title: {
    fontSize: "1rem !important",
    display: "flex !important",
    alignItems: "center !important",
    fontWeight: "bold !important",
  },
}));

type Props = {
  stakes: any;
  navigate: () => void;
};

const ActiveStake: React.FC<Props> = ({ stakes, navigate }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid
          container
          direction={"column"}
          paddingX={"1rem"}
          paddingTop={"0.5rem"}
        >
          <Grid item marginBottom={"0.5rem"}>
            <Typography className={classes.title} color="text.secondary">
              My Stake's
            </Typography>
          </Grid>
          <Grid item>
            <TableContainer sx={{ maxHeight: "180px" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Active Stake</TableCell>
                    <TableCell align="left">Stake Amount</TableCell>
                    <TableCell align="left">Status</TableCell>
                    <TableCell align="left"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stakes.map((e: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell align="left">
                        {e.account.data.parsed.info.stake.delegation.stake /
                          LAMPORTS_PER_SOL}{" "}
                        SOL
                      </TableCell>
                      <TableCell align="left">
                        {e.account.lamports / LAMPORTS_PER_SOL} SOL
                      </TableCell>
                      <TableCell align="left">{e.state}</TableCell>
                      <TableCell>
                        <Tooltip title="detail">
                          <IconButton
                            className={classes.detailButton}
                            sx={{ padding: "0rem" }}
                            onClick={navigate}
                          >
                            <ArrowForwardIosIcon
                              sx={{ fontSize: "0.75rem", margin: "0rem" }}
                            ></ArrowForwardIosIcon>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const StakesLoading = () => {
  return (
    <Card
      sx={{
        borderRadius: "16px !important",
        height: "260px",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    </Card>
  );
};

export default ActiveStake;
