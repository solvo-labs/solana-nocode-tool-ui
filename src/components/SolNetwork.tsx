import React from "react";
import {
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ChainInfo } from "../utils/types";

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
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
      textAlign: "center",
    },
  },
  context: {
    fontSize: "0.8rem !important",
  },
  title: {
    fontSize: "0.8rem !important",
  },
  subtitle: {
    fontSize: "1rem !important",
  },
}));

type Props = {
  data: ChainInfo | undefined;
};

const SolNetwork: React.FC<Props> = ({ data }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <Grid container className={classes.network}>
          <Grid item>
            <Stack spacing={1} direction={"column"}>
              <Typography className={classes.title}>
                Network(Transaction)
              </Typography>
              <Typography className={classes.subtitle}>
                {data?.transactionCount}
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
            <Stack marginTop={"1rem"} direction={"row"} spacing={2}>
              <Grid item>
                <Stack direction={"column"}>
                  <Typography className={classes.context}>
                    Block Height
                  </Typography>
                  <Typography className={classes.context}>
                    {data?.blockHeight}
                  </Typography>
                </Stack>
              </Grid>
              <Divider orientation="vertical"></Divider>
              <Grid item>
                <Stack direction={"column"}>
                  <Typography className={classes.context}>
                    Slot Height
                  </Typography>
                  <Typography className={classes.context}>
                    {data?.absoluteSlot}
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

export default SolNetwork;
