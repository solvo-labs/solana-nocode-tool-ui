import { Card, CardContent, Typography, CardActions, Theme, Stack, Chip, Grid, Box, Divider, Modal, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CustomizedProgressBars from "../CustomProgressBar";
import React, { useEffect, useState } from "react";
import { Governance, ProgramAccount, Proposal, VoteKind } from "@solana/spl-governance";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumDownAltIcon from "@mui/icons-material/ThumbDown";

import { DAO } from "../../lib/dao";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import toastr from "toastr";
import { fullFormatTimestamp, getTimestamp } from "../../lib/utils";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    border: "1px solid gray",
    borderRadius: "16px !important",
    // height: "260px",
    width: "100%",
    "&:hover": {
      backgroundColor: "whitesmoke !important",
    },
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    position: "relative", // Modal içeriği için göreceli konumlandırma
  },
}));

type Props = {
  daoInstance: DAO;
  proposal: ProgramAccount<Proposal>;
  config: Governance;
};

const ExecutableProposalCard: React.FC<Props> = ({ daoInstance, proposal, config }) => {
  const classes = useStyles();
  const [showVoteModal, setShowVoteModal] = useState<boolean>(false);
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getTimestamp();
      const proposalStartTime = proposal.account.draftAt.toNumber();
      const proposalEndTime = proposalStartTime + config.config.baseVotingTime;

      const remainingTimestamp = proposalEndTime - now;

      if (remainingTimestamp <= 0) setRemainingTime(0);

      setRemainingTime(remainingTimestamp);
    }, 6000);

    return () => {
      clearInterval(interval);
    };
  }, [config.config.baseVotingTime, proposal.account.draftAt]);

  const executeVote = async (isYes = false) => {
    const vote = isYes ? VoteKind.Approve : VoteKind.Deny;

    try {
      const tx = await daoInstance.vote(proposal, vote);

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(tx, connection, { minContextSlot, signers: [] });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    } catch (error: any) {
      toastr.error(error);
    }
  };

  const modal = () => {
    return (
      <Modal
        className={classes.modal}
        open={showVoteModal}
        onClose={() => {
          setShowVoteModal(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            borderRadius: "8px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 1,
          }}
        >
          <div className={classes.modalContent}>
            <Typography id="modal-modal-title" variant="h6" component="h2" color={"black"} align="center" marginBottom={"1rem"}>
              {proposal.account.name}
            </Typography>
            <Typography id="modal-modal-title" variant="subtitle1" component="h2" color={"black"} align="center">
              {proposal.account.descriptionLink}
            </Typography>
            <Divider sx={{ marginBottom: "1rem", marginTop: "0.5rem", background: "black" }} />
            <Grid gap={2} style={{ display: "flex", flexDirection: "column" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => {
                  executeVote(true);
                }}
              >
                <b>YES</b> &nbsp; <ThumbUpAltIcon />
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  executeVote();
                }}
              >
                <b>NO</b> &nbsp; <ThumDownAltIcon />
              </Button>
            </Grid>
            <Divider />
          </div>
        </Box>
      </Modal>
    );
  };

  return (
    <CardActions sx={{ padding: "0" }}>
      <Card
        className={classes.card}
        onClick={() => {
          setShowVoteModal(true);
        }}
        sx={{ cursor: "pointer" }}
      >
        <CardContent sx={{ padding: "0.75rem", paddingBottom: "0.75rem !important" }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignContent={"center"} alignItems={"center"}>
            <Typography>{proposal.account.name}</Typography>
            <Stack direction={"row"} spacing={2} justifyContent={"center"} alignItems={"center"}>
              <ThumbUpIcon sx={{ fontSize: "24px" }} color="success"></ThumbUpIcon>
              <Chip label="success" sx={{ height: "24px", fontSize: "12px" }} color="success" />
            </Stack>
          </Stack>
          <Box sx={{ border: "1px solid black", borderRadius: "12px", maxWidth: "140px", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <Typography>{fullFormatTimestamp(remainingTime)}</Typography>
          </Box>
          <Divider sx={{ marginTop: "0.5rem", backgroundColor: "gray" }}></Divider>
          <Grid container>
            <Grid item md display={"flex"} direction={"column"} padding={"0.5rem"} justifyContent={"space-between"}>
              <Stack direction={"row"} width={"100%"} justifyContent={"space-between"}>
                <Stack>
                  <Typography>Yes Votes</Typography>
                  <Stack direction={"row"} spacing={1} display={"flex"} alignItems={"baseline"} justifyContent={"start"}>
                    <Typography sx={{ fontSize: "0.8rem" }}>{proposal.account.getYesVoteCount().toNumber()}</Typography>
                    <Typography sx={{ fontSize: "0.7rem" }}>
                      %
                      {proposal.account.getYesVoteCount().toNumber() + proposal.account.getNoVoteCount().toNumber() > 0 && proposal.account.getYesVoteCount().toNumber() > 0
                        ? 100 / (proposal.account.getYesVoteCount().toNumber() / proposal.account.getYesVoteCount().toNumber() + proposal.account.getNoVoteCount().toNumber())
                        : 0}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack alignItems={"end"}>
                  <Typography>No Votes</Typography>
                  <Stack direction={"row"} spacing={1} display={"flex"} alignItems={"baseline"} justifyContent={"flex-end"}>
                    <Typography sx={{ fontSize: "0.8rem" }}>{proposal.account.getNoVoteCount().toNumber()}</Typography>
                    <Typography sx={{ fontSize: "0.7rem" }}>
                      %
                      {proposal.account.getYesVoteCount().toNumber() + proposal.account.getNoVoteCount().toNumber() > 0 && proposal.account.getNoVoteCount().toNumber() > 0
                        ? 100 / (proposal.account.getNoVoteCount().toNumber() / proposal.account.getYesVoteCount().toNumber() + proposal.account.getNoVoteCount().toNumber())
                        : 0}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Grid item width={"100%"}>
                <CustomizedProgressBars
                  value={
                    proposal.account.getYesVoteCount().toNumber() + proposal.account.getNoVoteCount().toNumber() > 0
                      ? 100 / (proposal.account.getYesVoteCount().toNumber() / proposal.account.getYesVoteCount().toNumber() + proposal.account.getNoVoteCount().toNumber())
                      : 0
                  }
                ></CustomizedProgressBars>
              </Grid>
            </Grid>
            <Grid item xs={0.25} display={"flex"} justifyContent={"center"} flexWrap={"wrap"} alignContent={"center"}>
              <Divider sx={{ backgroundColor: "gray", height: "60px" }} orientation="vertical" variant="middle" flexItem />
            </Grid>
            <Grid item md display={"flex"} direction={"column"} padding={"0.5rem"} justifyContent={"space-between"}>
              <Stack>
                <Typography>Approval Quorum</Typography>
                <Typography sx={{ fontSize: "0.7rem" }}>2 Yes votes required</Typography>
              </Stack>
              <Grid item width={"100%"}>
                <CustomizedProgressBars value={0}></CustomizedProgressBars>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {modal()}
    </CardActions>
  );
};

export default ExecutableProposalCard;
