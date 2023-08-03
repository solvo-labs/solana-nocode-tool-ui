import React from "react";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { CustomButton } from "./CustomButton";

const CurrentBlock = () => {
  return (
    <Card sx={{ borderRadius: "12px" }}>
      <CardContent>
        <Stack direction={"row"} spacing={4}>
          <Typography>Current Block</Typography>
          <Chip size="small" label="Live" color="success" />
        </Stack>
        <Stack direction={"row"} spacing={4}>
          <Typography variant="h5">200,000,000</Typography>
          <CustomButton
            disable={false}
            label="View"
            onClick={() => {}}
          ></CustomButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CurrentBlock;
