import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  card: {
    margin: "20px !important",
    borderRadius: "16px !important",
    display: "flex !important",
    justifyContent: "center !important",
    alignItems: "center !important",
    maxWidth: 420,
    height: "200px !important",
    cursor: "pointer !important",
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px !important",
    transition: "transform 0.2s !important",
    "&:hover": {
      border: "1px solid #000 !important",
      transform: "scale(1.05) !important",
    },
  },
  cardContent: {
    height: "130px !important",
  },
  cardTitle: {
    fontSize: "20px !important",
    marginBottom: "10px !important",
    fontWeight: "600 !important",
  },
  cardDescription: {
    fontSize: "18px !important",
  },
}));

interface DaoCreateCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const DaoCreateCard: React.FC<DaoCreateCardProps> = ({ title, description, onClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} onClick={onClick}>
      <CardContent className={classes.cardContent}>
        <Typography className={classes.cardTitle} variant="h6">
          {title}
        </Typography>
        <Typography className={classes.cardDescription}>{description}</Typography>
      </CardContent>
    </Card>
  );
};

export default DaoCreateCard;
