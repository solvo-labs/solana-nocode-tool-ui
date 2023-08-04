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
  container: {
    [theme.breakpoints.down("sm")]: {
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

const SolSupply = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <Grid container className={classes.container}>
          <Grid item>
            <Stack spacing={0} direction={"column"}>
              <Typography className={classes.title}>SOL Supply</Typography>
              <Typography className={classes.subtitle}>
                554,046,334.8871
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
                    Circulating Supply
                  </Typography>
                  <Typography className={classes.context}>
                    404,652,570.3947 SOL (73.0%)
                  </Typography>
                </Stack>
              </Grid>
              <Grid item>
                <Stack direction={"column"}>
                  <Typography className={classes.context}>
                    Non-circulating Supply
                  </Typography>
                  <Typography className={classes.context}>
                    149,393,763.7893 SOL (27.0%)
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

export default SolSupply;
