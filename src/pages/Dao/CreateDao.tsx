import React, { useState } from "react";
import { Divider, Grid, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import BusinessIcon from "@mui/icons-material/Business";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import ForumIcon from "@mui/icons-material/Forum";
import GavelIcon from "@mui/icons-material/Gavel";
import PixIcon from "@mui/icons-material/Pix";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DaoCategories from "../../components/DaoCategories";
import { Category } from "../../utils/types";
import { Steps } from "../../components/DaoStep/Steps";
import { DAO_STEPS } from "../../utils/enum";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: "2rem",
    [theme.breakpoints.up("sm")]: {
      minWidth: "30vw",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
  top: {
    position: "fixed",
    top: 100,
    left: 0,
    width: "100%",
    padding: "1rem 0rem 0.5rem 0rem",
    background: "linear-gradient(to left, #aa66fe, #23ed98)",
  },
  title: {
    textAlign: "center",
  },
  daoCategories: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "7rem",
    overflow: "auto",
    "& > div": {
      width: "48%",
      marginBottom: "1rem",
      marginTop: "1rem",
    },
  },
}));

const categories: Category[] = [
  {
    id: 1,
    label: "Company",
    icon: <BusinessIcon style={{ color: "white", marginRight: "1rem" }} fontSize="large" />,
  },
  {
    id: 2,
    label: "Governance",
    icon: <AssuredWorkloadIcon style={{ color: "white", marginRight: "1rem" }} fontSize="large" />,
  },
  {
    id: 3,
    label: "Community",
    icon: <ForumIcon style={{ color: "white", marginRight: "1rem" }} fontSize="large" />,
  },
  {
    id: 4,
    label: "Election",
    icon: <GavelIcon style={{ color: "white", marginRight: "1rem" }} fontSize="large" />,
  },
  {
    id: 5,
    label: "Venture Capital",
    icon: <PixIcon style={{ color: "white", marginRight: "1rem" }} fontSize="large" />,
  },
  {
    id: 6,
    label: "Game-Fi",
    icon: <SportsEsportsIcon style={{ color: "white", marginRight: "1rem" }} fontSize="large" />,
  },
  {
    id: 7,
    label: "Start-Up",
    icon: <RocketLaunchIcon style={{ color: "white", marginRight: "1rem" }} fontSize="large" />,
  },
];

const CreateDao: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const classes = useStyles();

  return (
    <Grid container className={classes.container} direction="column">
      <div className={classes.top}>
        <Typography variant="h5" className={classes.title}>
          Create Dao
        </Typography>
        <Divider sx={{ background: "white" }} />
        <Steps activeStep={activeStep} allSteps={Object.values(DAO_STEPS)} />
      </div>
      <div className={classes.daoCategories}>
        {categories.map((category) => (
          <DaoCategories key={category.id} label={category.label} index={category.id} icon={category.icon} />
        ))}
      </div>
    </Grid>
  );
};

export default CreateDao;
