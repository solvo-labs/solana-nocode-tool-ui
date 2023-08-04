import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontSize: "28px !important",
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
  }
}));

const SolPrice = () => {
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
              <Chip size="small" label="#10" />
            </Grid>
            {/* <Grid container>
              <Stack direction={"column"}>
                <Grid container direction={"row"}>
                  <Typography className={classes.title} color="text.secondary">
                    Solana
                  </Typography>
                </Grid>
              </Stack>
            </Grid> */}
          </Stack>
          <Grid container paddingLeft={"80px"}>
            <Typography className={classes.priceText}>$23.00</Typography>
            <Typography
              variant="button"
              sx={{ color: "green", paddingLeft: "10px" }}
            >
              {" "}
              ^ %0.5{" "}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SolPrice;
