import React, { useState } from "react";
import {
  Divider,
  Grid,
  IconButton,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { HighlightOff } from "@mui/icons-material";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "30vw",
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
  title: {
    textAlign: "center",
  },
  subTitle: {
    textAlign: "start",
  },
  input: {
    width: "100%",
    // maxHeight: "44px !important",
    [theme.breakpoints.up("sm")]: {
      // minWidth: "18rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      // minWidth: "12rem !important",
    },
  },
}));

export const Multisignature = () => {
  const [signatures, setSignatures] = useState<string[]>([""]);

  const addInput = () => {
    setSignatures([...signatures, ""]);
  };

  const removeInput = (index: number) => {
    const list = [...signatures];
    list.splice(index, 1);
    setSignatures(list);
  };

  const signatureSetter = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newSignature = [...signatures];
    newSignature[index] = e.target.value;
    setSignatures(newSignature);
  };
  
  console.log(signatures);

  const classes = useStyles();
  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Multisignature</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid item marginTop={"2rem"}>
        <Stack direction={"column"} width={"100%"} spacing={4}>
          {signatures.map((e: any, index) => (
            <Grid container display={"flex"} justifyContent={"space-evenly"}>
              <Grid item>
                <CustomInput
                  key={index}
                  label="Signature"
                  name="signature"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    signatureSetter(e, index)
                  }
                  placeHolder="Signature"
                  type="text"
                  value={signatures[index]}
                  disable={false}
                ></CustomInput>
              </Grid>
              {signatures.length > 1 && (
                <Grid item>
                  <IconButton
                    key={index}
                    onClick={() => {
                      removeInput(index);
                    }}
                  >
                    <HighlightOff />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          ))}
          <Grid
            container
            direction={"column"}
            display={"flex"}
            justifyContent={"center"}
          >
            <Grid item display={"flex"} justifyContent={"center"}>
              <CustomButton
                disable={false}
                label="Add signature"
                onClick={addInput}
                key={"key"}
              ></CustomButton>
            </Grid>
            <Grid
              item
              display={"flex"}
              justifyContent={"center"}
              marginTop={"1rem"}
            >
              <CustomButton
                disable={false}
                label="Confirm signature"
                onClick={() => {
                  console.log(signatures);
                }}
                key={"key"}
              ></CustomButton>
            </Grid>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};
