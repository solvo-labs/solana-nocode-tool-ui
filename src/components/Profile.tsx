import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
// import { PublicKey } from "@solana/web3.js";
import ContentCopy from "@mui/icons-material/ContentCopy";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  title: {
    fontSize: "1.25rem !important",
    display: "flex !important",
    alignItems: "center !important",
    fontWeight: "bold !important",
  },
  card: {
    borderRadius: "16px !important",
    height: "200px",
  },
  copyButton: {
    "& .css-nixcjy-MuiSvgIcon-root": {
      fontSize: "1rem !important",
      padding: "0rem !important",
    },
  },
  content: {
    padding: "1rem !important",
  },
}));

type Props = {
  publicKey: string;
  balance: number;
  walletConnection: string;
  open: boolean | undefined;
  handleTooltipClose: () => void;
  handleTooltipOpen: () => void;
};

const Profile: React.FC<Props> = ({ publicKey, balance, walletConnection, open, handleTooltipClose, handleTooltipOpen }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <Grid container>
          <Stack direction={"row"} spacing={2}>
            <Avatar
              alt="profile"
              src="https://images.squarespace-cdn.com/content/v1/61fdd76184e5316408afe9aa/53035d70-aa98-4975-8bd6-25b1deb198c8/f05a61be-d906-4ad8-a68d-88f7c257574d.png"
              sx={{ width: 64, height: 64 }}
            ></Avatar>
            <Typography className={classes.title} color="text.secondary">
              Wallet
            </Typography>
            <Grid item alignItems={"center"} display={"flex"}>
              <Chip
                size="small"
                sx={{ fontSize: "12px" }}
                color="success"
                label={walletConnection}
              ></Chip>
            </Grid>
          </Stack>
          <Grid container marginTop={"1rem"} direction={"column"}>
            <Stack direction={"row"} spacing={2}>
              <Typography sx={{ fontSize: "0.7rem" }}>
                {publicKey.slice(0, 20)}
              </Typography>
              <Tooltip
                id="hex"
                PopperProps={{
                  disablePortal: true,
                }}
                open={open}
                title="Copied"
                onClose={handleTooltipClose}
                leaveDelay={1000}
                placement="bottom"
              >
                <IconButton
                  className={classes.copyButton}
                  sx={{ padding: "0rem" }}
                  onClick={handleTooltipOpen}
                >
                  <ContentCopy
                    sx={{ fontSize: "1rem", margin: "0rem" }}
                  ></ContentCopy>
                </IconButton>
              </Tooltip>
            </Stack>
            <Grid item marginTop={"0.5rem"}>
              <Typography sx={{ mb: 1.5 }} color="text">
                Balance: {balance} SOL
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Profile;
