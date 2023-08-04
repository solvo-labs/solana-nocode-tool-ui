import React from "react";
import {
  Button,
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
  card: {
    borderRadius: "16px !important",
    height: "200px",
  },
  content: {
    padding: "1rem !important",
  },
  button: {
    color: "black !important",
    backgroundColor: "#26ea9a99 !important"
  }
}));

const CurrentBlock = () => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <Stack direction={"row"} spacing={2}>
          <Typography>Current Block</Typography>
          <Grid item>
            <Chip size="small" label="Live" color="success" />
            <Chip sx={{marginLeft:"8px"}} size="small" label="Devnet" color="success" />
          </Grid>
        </Stack>
        <Stack direction={"row"} spacing={4} marginTop={"1.5rem"}>
          <Typography variant="h4">200,000,000</Typography>
          <Button variant="contained" className={classes.button}>
            View
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CurrentBlock;
