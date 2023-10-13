import { Card, CardContent, Typography, CardActions, Theme, Stack, Chip, Grid, Box, Divider } from "@mui/material";
import { makeStyles } from "@mui/styles";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CustomizedProgressBars from "../CustomProgressBar";

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
}));

const ExecutableProposalCard = () => {
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
            <Typography>BASLIKKKKKKKK</Typography>
            <Stack direction={"row"} spacing={2} justifyContent={"center"} alignItems={"center"}>
              <ThumbUpIcon sx={{ fontSize: "24px" }} color="success"></ThumbUpIcon>
              <Chip label="success" sx={{ height: "24px", fontSize: "12px" }} color="success" />
            </Stack>
          </Stack>
          <Box sx={{ border: "1px solid black", borderRadius: "12px", maxWidth: "140px", justifyContent: "center", alignItems: "center" }}>
            <Typography>12/12/2023</Typography>
          </Box>
          <Divider sx={{ marginTop: "0.5rem", backgroundColor: "gray" }}></Divider>
          <Grid container>
            <Grid item md display={"flex"} direction={"column"} padding={"0.5rem"} justifyContent={"space-between"}>
              <Stack direction={"row"} width={"100%"} justifyContent={"space-between"}>
                <Stack>
                  <Typography>Yes Votes</Typography>
                  <Stack direction={"row"} spacing={1} display={"flex"} alignItems={"baseline"} justifyContent={"start"}>
                    <Typography sx={{ fontSize: "0.8rem" }}>0</Typography>
                    <Typography sx={{ fontSize: "0.7rem" }}>%0</Typography>
                  </Stack>
                </Stack>
                <Stack alignItems={"end"}>
                  <Typography>No Votes</Typography>
                  <Stack direction={"row"} spacing={1} display={"flex"} alignItems={"baseline"} justifyContent={"flex-end"}>
                    <Typography sx={{ fontSize: "0.8rem" }}>0</Typography>
                    <Typography sx={{ fontSize: "0.7rem" }}>%0</Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Grid item width={"100%"}>
                <CustomizedProgressBars></CustomizedProgressBars>
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
                <CustomizedProgressBars></CustomizedProgressBars>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </CardActions>
  );
};

export default ExecutableProposalCard;
