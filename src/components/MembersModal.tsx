import { Box, Button, Grid, Modal, Stack, Typography } from "@mui/material";
import React from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MemberCard from "./MemberCard.tsx";
import MemberDetail from "./MemberDetail.tsx";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  height: "60%",
  bgcolor: "background.paper",
  border: "1px solid black",
  borderRadius: "12px",
  boxShadow: 12,
  p: 4,
  color: "black",
};

type Props = {
  handleClose: () => void;
  open: boolean;
  daoName: string;
  members: any[] | undefined;
  selectedMember: any;
  handleSelectMember: () => void;
};

const MembersModal: React.FC<Props> = ({ handleClose, open, daoName, members, handleSelectMember, selectedMember }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Grid item>
          <Typography variant={"subtitle2"}>{daoName}</Typography>
          <Typography variant={"h5"}>Members</Typography>
        </Grid>
        <Grid container marginTop={"1rem"}>
          <Grid item xl={4} lg={4} md={4} xs={12} sm={12}>
            <Grid container display={"flex"} justifyContent={"space-between"}>
              <Stack direction={"row"} spacing={2} display={"flex"} alignItems={"center"}>
                <PeopleAltIcon sx={{ fontSize: "24px", color: "#A56BFA" }}></PeopleAltIcon>
                <Typography variant={"subtitle2"}>{members ? members.length : "0"} members</Typography>
              </Stack>
              <Button component="label" size={"small"} sx={{ fontSize: "12px", color: "black", borderRadius: "12px" }} startIcon={<AddCircleOutlineIcon />}>
                New Member
              </Button>
            </Grid>
            <Stack spacing={2} marginTop={"1rem"}>
              {members &&
                members.map((member, index: number) => (
                  <MemberCard
                    key={index}
                    member={member}
                    // index={index}
                    handleSelectMember={handleSelectMember}
                  ></MemberCard>
                ))}
            </Stack>
          </Grid>
          <Grid item xl={8} lg={8} md={8} xs={12} sm={12} paddingLeft={"2rem"}>
            <MemberDetail selectedMember={selectedMember}></MemberDetail>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default MembersModal;
