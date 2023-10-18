import { Box, Typography } from "@mui/material";
import React from "react";

type Props = {
  member: any;
  // index: number;
  handleSelectMember: (index: number) => void;
};

const MemberCard: React.FC<Props> = ({ member, handleSelectMember }) => {
  return (
    <Box
      sx={{ border: "1px solid gray", borderRadius: "12px", height: "70px", "&:hover": { bgcolor: "#F5F5F5", border: "1px solid black" } }}
      onClick={() => handleSelectMember(member)}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"start"}
    >
      <Typography marginLeft={"1rem"}>{member.account.governingTokenOwner.toBase58().slice(0, 5) + "..." + member.account.governingTokenOwner.toBase58().slice(-5)}</Typography>
    </Box>
  );
};
export default MemberCard;
