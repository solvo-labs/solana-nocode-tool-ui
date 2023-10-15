import React from "react";
import { Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  gridContainer: {
    display: "flex !important",
    justifyContent: "center !important",
    alignItems: "center !important",
    padding: "16px !important",
  },
  gridItem: {
    padding: "16px !important",
  },
  card: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    paddingRight: "20px !important",
    paddingLeft: "20px !important",
    paddingTop: "40px !important",
    paddingBottom: "40px !important",
  },
  title: {
    fontSize: "40px !important",
    fontWeight: "600 !important",
  },
  daoPreview: {
    marginTop: "20px !important",
    width: "100% !important",
    borderRadius: "16px !important",
    padding: "20px !important",
    backgroundColor: "#3d3d3d !important",
  },
  previewBottom: {
    display: "flex !important",
    justifyContent: "space-between !important",
    alignItems: "center !important",
    marginTop: "20px !important",
    width: "100% !important",
    borderRadius: "16px !important",
    padding: "0 !important",
  },
  memberPreview: {
    backgroundColor: "#3d3d3d !important",
    borderRadius: "16px !important",
    padding: "20px !important",
    width: "50% !important",
    marginRight: "5px !important",
  },
  thresholdPreview: {
    backgroundColor: "#3d3d3d !important",
    borderRadius: "16px !important",
    padding: "20px !important",
    width: "50% !important",
    marginLeft: "5px !important",
  },
  mainItem: {
    padding: "32px !important",
  },
  mainTitle: {
    fontSize: "40px !important",
    fontWeight: "600 !important",
    textAlign: "center",
  },
}));

interface PreviewDaoProps {
  typeOfDao: string;
  daoName: string;
  publicKeys: string[];
  threshold: number;
  minNumberToEditDao: number;
  communityThreshold: number;
}

const PreviewDao: React.FC<PreviewDaoProps> = ({ typeOfDao, daoName, publicKeys, threshold, minNumberToEditDao, communityThreshold }) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={8} className={classes.mainItem}>
        <Typography className={classes.mainTitle}>Next, determine the DAO’s community token.</Typography>
      </Grid>

      {typeOfDao === "multisign" && (
        <>
          <Grid item xs={8} className={classes.daoPreview}>
            <Typography>
              DAO Name <br />
              {daoName}
            </Typography>
          </Grid>

          <Grid item xs={8} className={classes.previewBottom}>
            <div className={classes.memberPreview}>
              <Typography>
                Invited members <br />
                {publicKeys.length}
              </Typography>
            </div>
            <div className={classes.thresholdPreview}>
              <Typography>
                Approval threshold <br />
                {threshold}
              </Typography>
            </div>
          </Grid>
        </>
      )}

      {typeOfDao === "community" && (
        <Grid container spacing={2} className={`${classes.gridContainer}, ${classes.card}`}>
          <Grid item xs={8} className={classes.daoPreview}>
            <Typography>
              DAO Name <br />
              {daoName}
            </Typography>
          </Grid>

          <Grid item xs={8}>
            Community Info
          </Grid>

          <Grid item xs={8} className={classes.daoPreview}>
            <Typography>
              Community token
              <br />
              (To be generated)
            </Typography>
          </Grid>

          <Grid item xs={8} className={classes.previewBottom}>
            <div className={classes.memberPreview}>
              <Typography>
                Approval threshold <br /> <br />
                {communityThreshold}
              </Typography>
            </div>
            <div className={classes.thresholdPreview}>
              <Typography>
                Min. number of tokens needed to manage DAO <br />
                {minNumberToEditDao}
              </Typography>
            </div>
          </Grid>

          <Grid item xs={8}>
            Council info
          </Grid>

          <Grid item xs={8} className={classes.daoPreview}>
            <Typography>
              Council token
              <br />
              (To be generated)
            </Typography>
          </Grid>

          <Grid item xs={8} className={classes.previewBottom}>
            <div className={classes.memberPreview}>
              <Typography>
                Approval threshold <br />
                {threshold}
              </Typography>
            </div>
            <div className={classes.thresholdPreview}>
              <Typography>
                Council Members <br />
                {publicKeys.length}
              </Typography>
            </div>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default PreviewDao;
