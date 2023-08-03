import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

const SolPrice = () => {
  return (
    <Card sx={{ borderRadius: "12px" }}>
      <CardContent>
        <Stack direction={"row"} spacing={4}>
          <Avatar
            alt="Remy Sharp"
            src="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
            sx={{ width: 64, height: 64 }}
          />
          <Grid container>
            <Stack direction={"column"}>
              <Grid container direction={"row"}>
                <Typography
                  height={64}
                  variant="h6"
                  color="text.secondary"
                  display={"flex"}
                  alignItems={"center"}
                  sx={{ fontWeight: "bold" }}
                >
                  Solana
                </Typography>
                <Grid item paddingTop={"4px"} paddingLeft={"8px"}>
                  <Chip size="small" label="#10" />
                </Grid>
              </Grid>
              <Grid container direction={"row"}>
                <Typography variant="h4">$23.00</Typography>
                <Typography
                  variant="button"
                  sx={{ color: "green", paddingLeft: "10px" }}
                >
                  {" "}
                  ^ %0.5{" "}
                </Typography>
              </Grid>
            </Stack>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SolPrice;
