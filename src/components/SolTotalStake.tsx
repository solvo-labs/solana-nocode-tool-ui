import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: "16px !important",
    height: "200px",
  },
  content: {
    padding: "1rem !important",
  },
  button: {
    color: "black !important",
    backgroundColor: "#26ea9a99 !important",
  },
  network: {
    [theme.breakpoints.down("md")]: {
      justifyContent: "center",
      textAlign: "center",
    },
  },
  context: {
    fontSize: "0.6rem !important",
  },
  title: {
    fontSize: "0.8rem !important",
  },
  subtitle: {
    fontSize: "1rem !important",
  },
}));

const SolTotalStake = () => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <Grid container>
          <Grid item>
            <Stack spacing={0} direction={"column"}>
              <Typography className={classes.title}>
                Total Stake (SOL)
              </Typography>
              <Typography className={classes.subtitle}>
                391,329,715.4882
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        <Grid
          container
          display={"flex"}
          justifyContent={"center"}
          className={classes.network}
        >
          <Grid item display={"flex"}>
            <Stack marginTop={"0.5rem"} direction={"column"} spacing={2}>
              <Grid item>
                <Stack direction={"column"}>
                  <Typography className={classes.context}>
                    Current Stake
                  </Typography>
                  <Typography className={classes.context}>
                    389,994,196.9527 SOL (99.7%)
                  </Typography>
                </Stack>
              </Grid>
              <Grid item>
                <Stack direction={"column"}>
                  <Typography className={classes.context}>
                    Delinquent Stake
                  </Typography>
                  <Typography className={classes.context}>
                    1,312,280.7917 SOL (0.3%)
                  </Typography>
                </Stack>
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SolTotalStake;
