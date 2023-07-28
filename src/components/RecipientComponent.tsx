/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Grid, Stack } from "@mui/material";
import { CustomInput } from "./CustomInput";
import { RecipientFormInput } from "../lib/models/Vesting";

type Props = {
  inputs: RecipientFormInput;
  inputOnChange: (newInputs: RecipientFormInput) => void;
};

const RecipientComponent: React.FC<Props> = ({ inputs, inputOnChange }) => {
  return (
    <Grid container marginY={"2rem"}>
      <Stack width={"100%"} spacing={4}>
        <CustomInput
          label="Name"
          name="name"
          onChange={(e: any) => inputOnChange({ ...inputs, name: e.target.value })}
          placeHolder={"Name"}
          type="text"
          value={inputs.name}
          disable={false}
          id=""
        ></CustomInput>
        <CustomInput
          label="Recipient Address"
          name="recipientAddress"
          onChange={(e: any) => inputOnChange({ ...inputs, recipientAddress: e.target.value })}
          placeHolder={"Recipient Address"}
          type="text"
          value={inputs.recipientAddress}
          disable={false}
          id=""
        ></CustomInput>
        <CustomInput
          label="Amount"
          name="amount"
          onChange={(e: any) => inputOnChange({ ...inputs, amount: e.target.value })}
          placeHolder={"Amount"}
          type="text"
          value={inputs.amount}
          disable={false}
          id=""
        ></CustomInput>
        <CustomInput
          label="Cliff Amount (Optional)"
          name="cliffAmount"
          onChange={(e: any) => inputOnChange({ ...inputs, recipientAddress: e.target.value })}
          placeHolder={"Cliff Amount"}
          type="text"
          value={inputs.cliffAmount}
          disable={false}
          required={false}
          id=""
        ></CustomInput>
      </Stack>
    </Grid>
  );
};

export default RecipientComponent;
