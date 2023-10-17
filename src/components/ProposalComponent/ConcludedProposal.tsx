import { Card, CardContent, Typography, CardActions, Theme, Stack, Chip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { getStatusData } from "../../lib/dao/utils";
import { ProgramAccount, Proposal } from "@solana/spl-governance";

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
  title: string;
  proposal: ProgramAccount<Proposal>;
};

const ConcludedProposal: React.FC<Props> = ({ title, proposal }) => {
  const classes = useStyles();
  return (
    <CardActions
      onClick={() => {
        console.log("asdasd");
      }}
      sx={{ padding: "0" }}
    >
      <Card className={classes.card}>
        <CardContent sx={{ padding: "0.75rem", paddingBottom: "0.75rem !important" }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignContent={"center"} alignItems={"center"}>
            <Typography>{title}</Typography>
            <Stack direction={"row"} spacing={2} justifyContent={"center"} alignItems={"center"}>
              {/* <ThumbUpIcon sx={{ fontSize: "24px" }} color="success"></ThumbUpIcon> */}
              <Chip label={getStatusData(proposal.account.state).text} sx={{ height: "24px", fontSize: "12px" }} color={getStatusData(proposal.account.state).color as any} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </CardActions>
  );
};

export default ConcludedProposal;
