/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { AppBar, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography } from "@mui/material";
import { APP_NAME, PAGES_NAME } from "../utils/enum";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    background: "linear-gradient(to right, #AA66FE, #23ED98)",
    padding: "1rem",
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  appName: {
    mr: 2,
    display: "flex",
    flexGrow: 1,
    fontWeight: "700 !important",
    letterSpacing: ".3rem !important",
    color: "#FFFFFF",
    "&:hover": {
      color: "#2FD9BB",
    },
  },
  menuTitle: {
    my: 2,
    color: "#FFFFFF !important",
    display: "block",
    fontWeight: "500 !important",
    borderBottom: "1px solid #2FD9BB !important",
    marginRight: "0.5rem !important",
  },
  menuItem: {
    "&:hover": {
      color: "#2FD9BB !important",
    },
    justifyContent: "center !important",
  },
}));

const TopBar: React.FC = () => {
  const [anchorElForProfile, setAnchorElForProfile] = React.useState<null | HTMLElement>(null);
  const openForProfile = Boolean(anchorElForProfile);

  // const [anchorElStake, setAnchorElStake] = useState<null | HTMLElement>(null);
  // const openForStake = Boolean(anchorElStake);
  // const [anchorElRaffle, setAnchorElRaffle] = useState<null | HTMLElement>(null);
  // const openForRaffle = Boolean(anchorElRaffle);
  const [anchorElVesting, setAnchorElVesting] = useState<null | HTMLElement>(null);
  const openForVesting = Boolean(anchorElVesting);
  const [anchorElToken, setAnchorElToken] = useState<null | HTMLElement>(null);
  const openForToken = Boolean(anchorElToken);

  const classes = useStyles();
  const navigate = useNavigate();
  const { publicKey } = useWallet();

  const handleClick = (event: React.MouseEvent<HTMLElement>, setState: any) => {
    setState(event.currentTarget);
  };

  const handleClickForProfile = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElForProfile(event.currentTarget);
  };

  const tokenMint = () => {
    navigate("/token-create");
    setAnchorElToken(null);
  };

  const myTokens = () => {
    navigate("/my-tokens");
    setAnchorElToken(null);
  };

  const transfer = () => {
    navigate("/token-transfer");
    setAnchorElToken(null);
  };

  const mintAndBurn = () => {
    navigate("/burn-mint-token");
    setAnchorElToken(null);
  };

  const airdrop = () => {
    navigate("/airdrop");
    setAnchorElToken(null);
  };

  const freezeAccount = () => {
    navigate("/freeze-account");
    setAnchorElToken(null);
  };
  const closeAccount = () => {
    navigate("/close-account");
    setAnchorElToken(null);
  };
  const multisingature = () => {
    navigate("/multisignature");
    setAnchorElToken(null);
  };
  const vesting = () => {
    navigate("/tokenomics");
    setAnchorElVesting(null);
  };
  const vestinList = () => {
    navigate("/vesting-list");
    setAnchorElVesting(null);
  };

  return (
    <div>
      <AppBar className={classes.appBar}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography variant="h5" noWrap component="a" href="" className={classes.appName} onClick={() => navigate("/")}>
              {APP_NAME.SOLANA}
            </Typography>
            <Box sx={{ flexGrow: 1, display: "flex" }}>
              <Button onClick={(e: any) => handleClick(e, setAnchorElToken)} onMouseOver={(e: any) => handleClick(e, setAnchorElToken)}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.TOKEN}</Typography>
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorElToken}
                open={openForToken}
                onClose={() => setAnchorElToken(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                sx={{
                  "& .MuiPaper-root": {
                    background: "#000000",
                    color: "#FFFFFF",
                    border: "1px solid #AA66FE",
                  },
                }}
              >
                <MenuItem className={classes.menuItem} onClick={myTokens}>
                  <Typography>My Tokens</Typography>
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={tokenMint}>
                  <Typography>Token Mint</Typography>
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={transfer}>
                  <Typography>Transfer</Typography>
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={mintAndBurn}>
                  <Typography>Mint & Burn</Typography>
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={freezeAccount}>
                  <Typography>Freeze Account</Typography>
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={closeAccount}>
                  <Typography>Close Account</Typography>
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={multisingature}>
                  <Typography>Multisignature</Typography>
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={airdrop}>
                  <Typography>Faucet</Typography>
                </MenuItem>
              </Menu>
              <Button onClick={(e: any) => handleClick(e, setAnchorElVesting)} onMouseOver={(e: any) => handleClick(e, setAnchorElVesting)}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.VESTING}</Typography>
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorElVesting}
                open={openForVesting}
                onClose={() => setAnchorElVesting(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                sx={{
                  "& .MuiPaper-root": {
                    background: "#000000",
                    color: "#FFFFFF",
                    border: "1px solid #AA66FE",
                  },
                }}
              >
                <MenuItem className={classes.menuItem} onClick={vesting}>
                  <Typography>Create Tokenomics</Typography>
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={vestinList}>
                  <Typography>Manage Tokenomics</Typography>
                </MenuItem>
              </Menu>
              <Button onClick={() => navigate("/stake")}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.STAKE}</Typography>
              </Button>
              <Button onClick={() => navigate("/raffle")}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.RAFFLE}</Typography>
              </Button>

              <Button onClick={() => navigate("/contract")}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.DYNAMIC_CONTRACT}</Typography>
              </Button>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Profile">
                <IconButton onClick={handleClickForProfile} onMouseOver={handleClickForProfile} sx={{ p: 0 }}>
                  <Avatar alt="alt" src="" />
                </IconButton>
              </Tooltip>
              <Menu
                id="profile-menu"
                aria-labelledby="profile-menu"
                anchorEl={anchorElForProfile}
                open={openForProfile}
                onClose={() => setAnchorElForProfile(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                sx={{
                  "& .MuiPaper-root": {
                    background: "#000000",
                    color: "#FFFFFF",
                    border: "1px solid #AA66FE",
                  },
                }}
              >
                <Tooltip title="Copy Key">
                  <MenuItem
                    className={classes.menuItem}
                    onClick={(event: React.MouseEvent) => {
                      event.stopPropagation();
                      navigator.clipboard.writeText(publicKey ? publicKey.toBase58() : "There is nothing!");
                    }}
                  >
                    <Typography>{publicKey?.toBase58().slice(0, 10) + "..." + publicKey?.toBase58().slice(-6)}</Typography>
                  </MenuItem>
                </Tooltip>
                <MenuItem className={classes.menuItem}>
                  <WalletDisconnectButton
                    onClick={() => {
                      navigate("/login");
                    }}
                  />
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
};

export default TopBar;
