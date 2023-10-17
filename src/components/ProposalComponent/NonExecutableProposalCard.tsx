import { Card, CardContent, Typography, CardActions, Theme, Stack, Chip, Grid, Box, Divider, Modal, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CustomizedProgressBars from "../CustomProgressBar";
import { ProgramAccount, Proposal, ProposalOption, VoteKind } from "@solana/spl-governance";
import moment from "moment";
import { DAO } from "../../lib/dao";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import toastr from "toastr";

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
  selectedButton: {
    backgroundColor: "#1976d2",
    color: "#fff",
  },
}));

type Props = {
  daoInstance: DAO;
  proposal: ProgramAccount<Proposal>;
};

const NonExecutableProposalCard: React.FC<Props> = ({ daoInstance, proposal }) => {
  const [showVoteModal, setShowVoteModal] = useState<boolean>(false);
  const classes = useStyles();
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const executeVote = async () => {
    try {
      const tx = await daoInstance.vote(proposal, VoteKind.Approve, selectedIndexes);

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
              {proposal.account.options.map((opt: ProposalOption, index: number) => {
                const isSelected = selectedIndexes.findIndex((ix) => ix === index);

                return (
                  <Button
                    variant={isSelected > -1 ? "contained" : "outlined"}
                    color="success"
                    onClick={() => {
                      const clonedState = [...selectedIndexes];
                      if (isSelected > -1) {
                        clonedState.splice(isSelected, 1);
                      } else {
                        clonedState.push(index);
                      }

                      setSelectedIndexes(clonedState);
                    }}
                  >
                    <b>{opt.label}</b>
                    {isSelected > -1 && <CheckCircleOutlineIcon sx={{ marginLeft: "1rem" }} />}
                  </Button>
                );
              })}
              <Button variant="contained" onClick={executeVote}>
                Exec
              </Button>
            </Grid>
            <Divider />
          </div>
        </Box>
      </Modal>
    );
  };

  return (
    <CardActions
      onClick={() => {
        setShowVoteModal(true);
      }}
      sx={{ padding: "0" }}
    >
      <Card className={classes.card}>
        <CardContent>
          <Stack direction={"row"} justifyContent={"space-between"} alignContent={"center"} alignItems={"center"}>
            <Typography>{proposal.account.name}</Typography>
            <Stack direction={"row"} spacing={2} justifyContent={"center"} alignItems={"center"}>
              <ThumbUpIcon sx={{ fontSize: "24px" }} color="success"></ThumbUpIcon>
              <Chip label="success" sx={{ height: "24px", fontSize: "12px" }} color="success" />
            </Stack>
          </Stack>
          <Box sx={{ border: "1px solid black", borderRadius: "12px", maxWidth: "140px", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <Typography>{moment.unix(proposal.account.draftAt.toNumber()).format("LLL")}</Typography>
          </Box>
          <Divider sx={{ marginTop: "0.5rem", backgroundColor: "gray" }}></Divider>
          <Stack spacing={2} marginTop={"0.5rem"}>
            <Grid container direction={"row"}>
              <Stack direction={"row"} width={"100%"} justifyContent={"space-between"}>
                <Stack direction={"row"} spacing={1} display={"flex"} alignItems={"baseline"} justifyContent={"flex-end"}>
                  <Typography sx={{ fontSize: "0.8rem" }}>Secenek:1</Typography>
                  <Typography sx={{ fontSize: "0.7rem" }}>0 votes</Typography>
                </Stack>
                <Typography sx={{ fontSize: "0.7rem" }}>%0</Typography>
              </Stack>
              <Grid item width={"100%"}>
                <CustomizedProgressBars value={0}></CustomizedProgressBars>
              </Grid>
            </Grid>
            <Grid container direction={"row"} marginTop={"0.5rem"}>
              <Stack direction={"row"} width={"100%"} justifyContent={"space-between"}>
                <Stack direction={"row"} spacing={1} display={"flex"} alignItems={"baseline"} justifyContent={"flex-end"}>
                  <Typography sx={{ fontSize: "0.8rem" }}>Secenek:1</Typography>
                  <Typography sx={{ fontSize: "0.7rem" }}>0 votes</Typography>
                </Stack>
                <Typography sx={{ fontSize: "0.7rem" }}>%0</Typography>
              </Stack>
              <Grid item width={"100%"}>
                <CustomizedProgressBars value={0}></CustomizedProgressBars>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
      {modal()}
    </CardActions>
  );
};

export default NonExecutableProposalCard;
