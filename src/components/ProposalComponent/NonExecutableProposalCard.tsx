import { Card, CardContent, Typography, CardActions, Theme, Stack, Chip, Grid, Box, Divider } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CustomizedProgressBars from "../CustomProgressBar";
import { ProgramAccount, Proposal } from "@solana/spl-governance";
import moment from "moment";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  card: {
    border: "1px solid gray",
    borderRadius: "16px !important",
    // height: "260px",
    width: "100%",
    "&:hover": {
      backgroundColor: "whitesmoke !important",
    },
  },
}));

type Props = {
  proposal: ProgramAccount<Proposal>;
};
const NonExecutableProposalCard: React.FC<Props> = ({ proposal }) => {
  const classes = useStyles();
  return (
    <CardActions
      onClick={() => {
        console.log("asdasd");
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
    </CardActions>
  );
};

export default NonExecutableProposalCard;
