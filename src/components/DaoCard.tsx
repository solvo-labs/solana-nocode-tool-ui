import { Avatar, Card, CardContent, Typography } from "@mui/material";
import React from "react";

interface DaoCardProps {
  image: string;
  name: string;
  characterLimit: number;
}

const DaoCard: React.FC<DaoCardProps> = ({ name, characterLimit }) => {
  const getInitials = (name: string): string => {
    const namesInitials = name.split(" ");
    return namesInitials.length >= 2 ? (" " + namesInitials[0].charAt(0) + namesInitials[1].charAt(0)).toUpperCase() : (" " + name.charAt(0)).toUpperCase();
  };

  return (
    <Card style={{ borderRadius: "15px" }} onClick={() => {}}>
      <CardContent
        style={{
          maxWidth: "150px",
          width: "150px",
          height: "150px",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          textOverflow: "ellipsis",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "column",
          padding: "32px",
          backgroundColor: "white",
          borderRadius: "15px",
          boxShadow: "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
        }}
      >
        <div style={{ paddingBottom: "20px" }}>
          <Avatar style={{ minWidth: "65px", minHeight: "65px", display: "flex", justifyContent: "center", alignItems: "center" }}> {getInitials(name)} </Avatar>
        </div>
        <Typography variant="h5" style={{ textAlign: "center", color: "black", maxWidth: "100%", maxHeight: "100%", wordWrap: "break-word", fontSize: "18px" }}>
          {name.length > characterLimit ? name.slice(0, characterLimit) + "..." : name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DaoCard;
