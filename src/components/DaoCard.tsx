import { Card, CardContent, Typography } from "@mui/material";
import React from "react";

interface DaoCardProps {
  image: string;
  name: string;
  characterLimit: number;
}

const DaoCard: React.FC<DaoCardProps> = ({ image, name, characterLimit }) => {
  return (
    <Card style={{ borderRadius: "15px" }}>
      <CardContent
        style={{
          maxWidth: "150px",
          width: "150px",
          height: "150px",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          textOverflow: "ellipsis",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "32px",
          backgroundColor: "white",
          borderRadius: "15px",
          boxShadow: "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
        }}
      >
        <img style={{ paddingBottom: "20px" }} width={40} height={40} src={image} alt="" />
        <Typography variant="h5" style={{ textAlign: "center", color: "black", maxWidth: "100%", maxHeight: "100%", wordWrap: "break-word", fontSize: "18px" }}>
          {name.length > characterLimit ? name.slice(0, characterLimit) + "..." : name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DaoCard;
