import React from "react";
import { Category, Dao, TokenWithType } from "../../utils/types";
import { Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Title from "../Title";

const useStyles = makeStyles(() => ({
  reviewContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "1rem",
  },
}));

type Props = {
  category: Category;
  dao: Dao;
  token: TokenWithType;
};

const Review: React.FC<Props> = ({ category, dao, token }) => {
  const classes = useStyles();

  return (
    <Grid container className={classes.reviewContainer} direction={"column"}>
      <Grid container direction={"row"}>
        <Grid container direction={"column"} xs={6}>
          <Title label="DAO" />
          <Typography variant="body1">
            <div>
              <b>Category: </b>
              {category.label}
            </div>
          </Typography>
          <Typography variant="body1">
            <div>
              <b>Name: </b>
              {dao.name}
            </div>
          </Typography>
          <Typography variant="body1">
            <div>
              <b>Description: </b>
              {dao.description}
            </div>
          </Typography>
          {/* <Grid container className={classes.buttonContainer}>
          <Grid item justifyContent={"flex-end"}>
            <img id="dao-image" alt="alt" width={200} height={100} src={daoInfo.image || "/images/logo.jpeg"}></img>
          </Grid>
        </Grid> */}
        </Grid>
        <Grid container direction={"column"} xs={6}>
          <Title label="Token" />
          <Typography variant="body1">
            <div>
              <b>Name: </b>
              {token.name}
            </div>
          </Typography>
          <Typography variant="body1">
            <div>
              <b>Symbol: </b>
              {token.symbol}
            </div>
          </Typography>
          <Typography variant="body1">
            <div>
              <b>Amount: </b>
              {token.amount}
            </div>
          </Typography>
          <Typography variant="body1">
            <div>
              <b>Decimal: </b>
              {token.decimal}
            </div>
          </Typography>
          <Typography variant="body1">
            <div>
              <b>Freeze Authority: </b>
              {token.freezeAuthority}
            </div>
          </Typography>
          <Typography variant="body1">
            <div>
              <b>Authority: </b>
              {token.authority}
            </div>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Review;
