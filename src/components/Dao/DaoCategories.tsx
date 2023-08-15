import React from "react";
import { Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import BusinessIcon from "@mui/icons-material/Business";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import ForumIcon from "@mui/icons-material/Forum";
import GavelIcon from "@mui/icons-material/Gavel";
import PixIcon from "@mui/icons-material/Pix";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { Category } from "../../utils/types";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1rem",
    marginTop: "1rem",
    height: "9rem",
    width: "25%",
  },
  label: {
    background: "linear-gradient(to right, #aa66fe, #23ed98)",
    borderRadius: "0.5rem",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    flexDirection: "column",
    width: "100%",
  },
  selectedLabel: {
    background: "#2FD9BB",
    //color: "#aa66fe",
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

type Props = {
  activeStepOnChange: (activeStep: number) => void;
  selectedCategoryOnChange: (selectedCategory: Category) => void;
  selectedCategory: Category;
};

const DaoCategories: React.FC<Props> = ({ activeStepOnChange, selectedCategoryOnChange, selectedCategory }) => {
  const classes = useStyles();

  const handleCategoryClick = (category: Category) => {
    activeStepOnChange(2);
    selectedCategoryOnChange(category);
  };

  return (
    <div className={classes.container}>
      <Grid container spacing={2}>
        {categories.map((category: Category) => (
          <Grid item key={category.id} xs={12} sm={6} md={3} className={classes.box} onClick={() => handleCategoryClick(category)}>
            <Typography className={`${classes.label} ${selectedCategory === category ? classes.selectedLabel : ""}`} variant="h5">
              {category.label}
              {category.icon}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default DaoCategories;
