import React from "react";
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
  const [anchorElForSolana, setAnchorElForSolana] = React.useState<null | HTMLElement>(null);
  const openForSolana = Boolean(anchorElForSolana);
  const [anchorElForProfile, setAnchorElForProfile] = React.useState<null | HTMLElement>(null);
  const openForProfile = Boolean(anchorElForProfile);

  const classes = useStyles();
  const navigate = useNavigate();
  const { publicKey } = useWallet();

  const handleClickForSolana = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElForSolana(event.currentTarget);
  };

  const handleClickForProfile = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElForProfile(event.currentTarget);
  };

  const tokenMint = () => {
    navigate("/token");
    setAnchorElForSolana(null);
  };

  const myTokens = () => {
    navigate("/my-tokens");
    setAnchorElForSolana(null);
  };

  const transfer = () => {
    navigate("/token-transfer");
    setAnchorElForSolana(null);
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
              <Button>
                <Typography className={classes.menuTitle}>{PAGES_NAME.STAKING}</Typography>
              </Button>
              <Button>
                <Typography className={classes.menuTitle}>{PAGES_NAME.DAO}</Typography>
              </Button>
              <Button>
                <Typography className={classes.menuTitle}>{PAGES_NAME.NFT}</Typography>
              </Button>
              <Button onClick={handleClickForSolana} onMouseOver={handleClickForSolana}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.TOKEN}</Typography>
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorElForSolana}
                open={openForSolana}
                onClose={() => setAnchorElForSolana(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                sx={{
                  "& .MuiPaper-root": { background: "#000000", color: "#FFFFFF", border: "1px solid #AA66FE" },
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
              </Menu>
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
                  "& .MuiPaper-root": { background: "#000000", color: "#FFFFFF", border: "1px solid #AA66FE" },
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
