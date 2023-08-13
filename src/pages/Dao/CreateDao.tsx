import React from "react";
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

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "30vw",
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
  title: {
    textAlign: "center",
  },
  select: {
    width: "100%",
  },
  boxContainer: {
    width: "100%",
    margin: "1rem 0",
  },
  box: {
    width: "5rem",
  },
  daoCategories: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    "& > div": {
      width: "calc(50% - 0.5rem)", // Yarı genişlikteki iki sütunlu düzen
      marginBottom: "1rem",
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
  const classes = useStyles();

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item marginBottom={"1rem"}>
        <Typography variant="h5" className={classes.title}>
          Create Dao
        </Typography>
        <Divider sx={{ marginTop: "0.5rem", background: "white", marginBottom: "2rem" }} />
      </Grid>
      <div className={classes.daoCategories}>
        {categories.map((category) => (
          <DaoCategories key={category.id} label={category.label} index={category.id} icon={category.icon} />
        ))}
      </div>
    </Grid>
  );
};

export default CreateDao;
