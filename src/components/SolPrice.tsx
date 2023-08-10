import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { MarketInfo } from "../utils/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontSize: "1.25rem !important",
    display: "flex !important",
    alignItems: "center !important",
    fontWeight: "bold !important",
  },
  card: {
    borderRadius: "16px !important",
    height: "160px",
  },
  content: {
    padding: "1rem !important",
  },
  priceText: {
    fontSize: "2rem !important",
    [theme.breakpoints.down("lg")]: {
      fontSize: "1.5rem !important",
    },
  },
  priceChangePositive: {
    color: "green !important",
    paddingLeft: "10px",
  },
  priceChangeNegative: {
    color: "red !important",
    paddingLeft: "10px",
  },
}));

type Props = {
  data: MarketInfo | undefined;
};

const SolPrice: React.FC<Props> = ({ data }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <Grid container>
          <Stack direction={"row"} spacing={2}>
            <Avatar
              alt="sol"
              src="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
              sx={{ width: 64, height: 64 }}
            />
            <Typography className={classes.title} color="text.secondary">
              Solana
            </Typography>
            <Grid item paddingTop={"4px"}>
              <Chip size="small" label={"#" + data?.marketCapRank} />
            </Grid>
          </Stack>
          <Grid container paddingLeft={"80px"}>
            <Typography className={classes.priceText}>
              ${data?.priceUsdt}
            </Typography>
            <Typography
              variant="button"
              sx={{ color: "green", paddingLeft: "10px" }}
              className={
                data?.marketCapRank != undefined && data?.marketCapRank < 0
                  ? classes.priceChangePositive
                  : classes.priceChangeNegative
              }
            >
              % {data?.priceChange24h.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const SolPriceLoading = () => {
  return (
    <Card
    sx={{
      borderRadius: "16px !important",
      height: "160px",
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

export default SolPrice;
