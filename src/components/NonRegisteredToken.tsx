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
import { makeStyles } from "@mui/styles";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";

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
  tableContainer: {
    maxHeight: "180px",
  },
}));

type Props = {
  tokens: any;
};

const RegisterToken: React.FC<Props> = ({ tokens }) => {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid
          container
          direction={"column"}
          paddingX={"1rem"}
          // paddingTop={"0.5rem"}
        >
          <Grid item marginBottom={"0.25rem"}>
            <Typography className={classes.title} color="text.secondary">
              Non registered tokens
            </Typography>
          </Grid>
          <Grid item>
            <TableContainer className={classes.tableContainer}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Hex</TableCell>
                    <TableCell align="left">Supply</TableCell>
                    <TableCell align="left">Balance</TableCell>
                    <TableCell align="left"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tokens.map((e: any, index: number) => (
                    <TableRow
                      key={index}
                      onClick={() => navigate(`/token/${e.hex}`)}
                    >
                      <TableCell align="left">
                        {e.hex.slice(0, 10) + "..."}
                      </TableCell>
                      <TableCell align="left">
                        {e.supply.value.uiAmount}
                      </TableCell>
                      <TableCell align="left">
                        {e.amount / Math.pow(10, e.supply.value.decimals)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="register">
                          <IconButton
                            className={classes.detailButton}
                            sx={{ padding: "0rem" }}
                            // onClick={navigate}
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

export default RegisterToken;
