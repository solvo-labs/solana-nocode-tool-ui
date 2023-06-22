import React from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { AppBar, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography } from "@mui/material";
import { APP_NAME, PAGES_NAME } from "../utils/enum";

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
  },
}));

const TopBar: React.FC = () => {
  const [anchorElForToken, setAnchorElForToken] = React.useState<null | HTMLElement>(null);
  const openForToken = Boolean(anchorElForToken);
  const [anchorElForProfile, setAnchorElForProfile] = React.useState<null | HTMLElement>(null);
  const openForProfile = Boolean(anchorElForProfile);

  const classes = useStyles();
  const navigate = useNavigate();

  const handleClickForToken = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElForToken(event.currentTarget);
  };

  const handleClickForProfile = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElForProfile(event.currentTarget);
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
              <Button onClick={handleClickForToken} onMouseOver={handleClickForToken}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.TOKEN}</Typography>
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorElForToken}
                open={openForToken}
                onClose={() => setAnchorElForToken(null)}
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
                <MenuItem className={classes.menuItem}>
                  <Typography>Token Mint 1</Typography>
                </MenuItem>
                <MenuItem className={classes.menuItem}>
                  <Typography>Token Mint 2</Typography>
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
                      navigator.clipboard.writeText("publicKey");
                    }}
                  >
                    <Typography>publicKey</Typography>
                  </MenuItem>
                </Tooltip>
                <MenuItem className={classes.menuItem}>
                  <Typography>Logout</Typography>
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
