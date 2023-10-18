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
    padding: "40px 20px !important",
  },
  title: {
    fontSize: "40px !important",
    fontWeight: "600 !important",
  },
  daoPreview: {
    marginTop: "20px !important",
    width: "100% !important",

    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    padding: "40px 20px !important",
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
    width: "40% !important",
    marginRight: "5px !important",

    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    padding: "40px 20px !important",
  },
  thresholdPreview: {
    width: "40% !important",
    marginLeft: "5px !important",

    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    padding: "40px 20px !important",
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
  communityToken?: string;
  councilToken?: string;
}

const PreviewDao: React.FC<PreviewDaoProps> = ({ typeOfDao, daoName, publicKeys, threshold, minNumberToEditDao, communityThreshold, communityToken, councilToken }) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={8} className={classes.mainItem}>
        <Typography className={classes.mainTitle}>We're almost finished; let's make sure everything appears in order</Typography>
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
        <>
          <Grid item xs={8} className={`${classes.daoPreview}, ${classes.card}`}>
            <Typography>
              DAO Name <br />
              {daoName}
            </Typography>
          </Grid>

          <Grid item xs={8}>
            <Typography>Community Info</Typography>
          </Grid>

          <Grid item xs={8} className={`${classes.daoPreview}, ${classes.card}`}>
            <Typography>
              Community token
              <br />
              {communityToken || "(To be generated)"}
            </Typography>
          </Grid>

          <Grid item xs={8} className={`${classes.previewBottom}`}>
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

          <Grid item xs={8} className={`${classes.daoPreview}, ${classes.card}`}>
            <Typography>
              Council token
              <br />
              {councilToken || "(To be generated)"}
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
        </>
      )}
    </Grid>
  );
};

export default PreviewDao;
