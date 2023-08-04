import React from "react";
import {
  Card,
  CardContent,
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
// import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { makeStyles } from "@mui/styles";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { getTimestamp } from "../lib/utils";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DoneIcon from "@mui/icons-material/Done";
import PendingIcon from "@mui/icons-material/Pending";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: "16px !important",
    // height: "200px",
  },
  detailButton: {
    "& .css-nixcjy-MuiSvgIcon-root": {
      fontSize: "1rem !important",
      padding: "0rem !important",
    },
  },
}));

type Props = {
  vestings: any;
  navigate: () => void;
};

const ActiveVesting: React.FC<Props> = ({ vestings, navigate }) => {
  const classes = useStyles();

  const getStatusIcon = (startDate: number, endDate: number) => {
    const timestamp = getTimestamp();

    if (endDate <= timestamp) {
      return (
        <Tooltip title="Process is completed">
          {
            <span>
              <DoneIcon color="success" sx={{ zIndex: "-10px" }} />
            </span>
          }
        </Tooltip>
      );
    } else if (timestamp >= startDate && timestamp <= endDate) {
      return (
        <Tooltip title="Vesting is processing">
          {
            <span>
              <AutorenewIcon color="success" sx={{ zIndex: "-10px" }} />
            </span>
          }
        </Tooltip>
      );
    }

    return (
      <Tooltip title="Process is waiting">
        {
          <span>
            <PendingIcon color="warning" sx={{ zIndex: "-10px" }} />
          </span>
        }
      </Tooltip>
    );
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container direction={"column"} padding={"0.75rem"}>
          <Grid item marginBottom={"1rem"}>
            <Typography>My Vesting's</Typography>
          </Grid>
          <Grid item>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="left">Status</TableCell>
                    <TableCell align="left">Deposited Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vestings.map((e: any, index: number) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell align="left">{e[1].name}</TableCell>
                      <TableCell align="left">{getStatusIcon(e[1].start, e[1].end)}</TableCell>
                      <TableCell align="left">{e[1].depositedAmount.toNumber() / 10000000}</TableCell>
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

export default ActiveVesting;
