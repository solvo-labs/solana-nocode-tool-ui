import React from "react";
import { Checkbox, Grid, TextField, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import remove from "../assets/remove.png";

const useStyles = makeStyles(() => ({
  gridContainer: {
    justifyContent: "center !important",
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
  addCouncil: {
    display: "flex !important",
    justifyContent: "flex-start !important",
    alignItems: "center !important",
    margin: "16px 0 !important",
  },
  createCouncil: {
    color: "#000 !important",
    fontSize: "18px !important",
    display: "flex !important",
    justifyContent: "flex-start !important",
    alignItems: "center !important",
    marginTop: "16px !important",
  },
  percentageSection: {
    // marginTop: "20px !important",
    backgroundColor: "#3d3d3d !important",
    width: "100% !important",
    borderRadius: "16px !important",
  },
  percentageSectionText: {
    padding: "20px !important",
  },
  percentageSectionNumber: {
    color: "#43DAA5 !important",
    fontWeight: "600 !important",
  },
  input: {
    width: "100% !important",
    marginTop: "16px !important",
  },
  memberSide: {
    display: "flex !important",
    justifyContent: "flex-start !important",
    alignItems: "center !important",
    margin: "16px 0 !important",
  },
  members: {
    display: "flex !important",
    justifyContent: "center !important",
    alignItems: "center !important",
    background: "linear-gradient(90deg, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%) !important",
    padding: "15px !important",
    textAlign: "center",
    borderRadius: "50% !important",
    width: "20px !important",
    height: "20px !important",
    marginRight: "10px !important",
  },
  memberHashs: {
    display: "flex !important",
    justifyContent: "space-between !important",
    alignItems: "center !important",
    width: "100% !important",
  },
  removeIcon: {
    width: "20px !important",
    marginLeft: "10px !important",
    cursor: "pointer !important",
  },
  title: {
    fontSize: "40px !important",
    fontWeight: "600 !important",
    textAlign: "center",
  },
  description: {
    fontSize: "18px !important",
    fontWeight: "600 !important",
    margin: "15px 0 10px 0 !important",
  },
  note: {
    color: "#000 !important",
    fontSize: "18px !important",
  },
}));

interface CommunityDaoCouncilProps {
  daoCouncilToken: boolean;
  handleDaoCouncilToken: () => void;
  councilMembers: string[];
  removeCouncilMembers: (e: any) => void;
  handleCouncilMembers: (e: any) => void;
  onBlurHandleCouncilMembers: (e: any) => void;
}

const CommunityDaoCouncil: React.FC<CommunityDaoCouncilProps> = ({
  daoCouncilToken,
  handleDaoCouncilToken,
  councilMembers,
  removeCouncilMembers,
  handleCouncilMembers,
  onBlurHandleCouncilMembers,
}) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={8} className={classes.gridItem}>
        <Typography className={classes.title}>Add a council to your DAO.</Typography>
      </Grid>

      <Grid item xs={8} className={`${classes.gridItem}, ${classes.card}`}>
        <div className={classes.percentageSection}>
          <Typography className={classes.percentageSectionText}>
            About Councils <br /> <br />
            Council members can supervise and moderate DAO activities. It’s recommended to always create the council for DAOs in their incubation stage to prevent governance
            attacks or accidental losses of assets managed by the DAO.
          </Typography>
        </div>

        <div className={classes.addCouncil}>
          <Typography className={classes.note}>Do you want to add a council?</Typography>
          <Checkbox checked={true} />
        </div>

        <Typography>A council is required to govern the DAO until the community token is distributed to members.</Typography>

        {!daoCouncilToken && (
          <>
            <Typography className={classes.description}>What is the address of the community token you would like to use?</Typography>
            <Typography>If your token is listed with Solana, you'll see a preview below.</Typography>

            <TextField className={classes.input} id="dao-name" label="e.g. TyLwwQt5..." variant="standard" onChange={() => console.log("tıklandı")} />
          </>
        )}

        <div className={classes.createCouncil}>
          <Typography>Create a token for your DAO's council?</Typography>
          <Checkbox checked={daoCouncilToken} onChange={handleDaoCouncilToken} />
        </div>
      </Grid>

      <Grid item xs={8} className={classes.gridItem}>
        <Typography className={classes.title}>Next, invite members with their Solana Wallet Address.</Typography>
      </Grid>

      {daoCouncilToken && (
        <Grid item xs={8} className={`${classes.gridItem}, ${classes.card}`}>
          <Typography className={classes.description}>Invite members {councilMembers.length}</Typography>
          <Typography>Add Solana wallet addressses, separated by a comma or line-break.</Typography>

          {councilMembers.map((councilMember, index) => (
            <div key={index} className={classes.memberSide}>
              <div className={classes.members}>
                <Typography>{index === 0 ? "Me:" : `${index + 1}:`}</Typography>
              </div>
              <div className={classes.memberHashs}>
                {councilMember} {index !== 0 ? <img onClick={() => removeCouncilMembers(index)} className={classes.removeIcon} src={remove} alt="remove icon" /> : <></>}
              </div>
            </div>
          ))}

          <TextField
            className={classes.input}
            id="dao-members"
            label="e.g. Council Members"
            variant="standard"
            onKeyDown={handleCouncilMembers}
            onBlur={onBlurHandleCouncilMembers}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default CommunityDaoCouncil;
