import { Grid, Theme, Typography } from "@mui/material";
import { ProgramAccount, TokenOwnerRecord } from "@solana/spl-governance";
import React from "react";
import { makeStyles } from "@mui/styles";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  main: {
    border: "1px solid",
    borderRadius: "1rem",
    padding: "1rem",
  },
}));

type Props = {
  selectedMember: ProgramAccount<TokenOwnerRecord>;
};

const MemberDetail: React.FC<Props> = ({ selectedMember }) => {
  const classes = useStyles();
  return (
    <Grid className={classes.main}>
      <Typography variant={"h5"} marginBottom={"0.5rem"}>
        Member Details
      </Typography>
      <Typography>
        <b>Pubkey :</b> {selectedMember.account.governingTokenOwner.toBase58()}
      </Typography>
      <Typography>
        <b>Council Votes :</b> {selectedMember.account.governingTokenDepositAmount.toNumber()}
      </Typography>
      <Typography>
        <b>Proposal Count :</b> {selectedMember.account.outstandingProposalCount}
      </Typography>
    </Grid>
  );
};

export default MemberDetail;
