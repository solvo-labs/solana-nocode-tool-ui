import React from "react";
import {
  Button,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: "16px !important",
    height: "160px",
  },
  content: {
    padding: "1rem !important",
  },
  button: {
    color: "black !important",
    backgroundColor: "#26ea9a99 !important",
  },
  title: {
    fontSize: "1.25rem !important",
    fontWeight: "bold !important",

    [theme.breakpoints.down("xl")]: {
      fontSize: "1rem !important",
    },
  },
  currentBlock: {
    fontSize: "1.25rem !important",
    [theme.breakpoints.down("xl")]: {
      fontSize: "1rem !important",
    },
  },
}));

type Props = {
  lastBlock: number;
};

const CurrentBlock: React.FC<Props> = ({ lastBlock }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <Stack direction={"row"} spacing={2}>
          <Typography className={classes.title} color="text.secondary">
            Current Block
          </Typography>
          <Grid item>
            <Chip size="small" label="Live" color="success" />
            <Chip
              sx={{ marginLeft: "8px" }}
              size="small"
              label="Devnet"
              color="success"
            />
          </Grid>
        </Stack>
        <Stack
          direction={"row"}
          spacing={4}
          marginTop={"1.5rem"}
          alignItems={"center"}
        >
          <Typography className={classes.currentBlock}>{lastBlock}</Typography>
          <Button
            sx={{ maxHeight: "2rem" }}
            size="small"
            variant="contained"
            className={classes.button}
          >
            View
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const CurrentBlockLoading = () => {
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

export default CurrentBlock;
