import React from "react";
import { Stack } from "@mui/material";
import { CustomInput } from "./CustomInput";
import { RegisterToken } from "../lib/tokenRegister";

type Props = {
    inputs: RegisterToken;
    inputOnChange: (newInputs: RegisterToken) => void;
}

const RegisterTokenForm: React.FC<Props> = ({inputs, inputOnChange}) => {
  return (
    <Stack direction={"column"} spacing={2}>
      <CustomInput
        placeHolder="Name"
        label="Name"
        id="name"
        name="name"
        type="text"
        value={inputs.name}
        onChange={(e: any) =>
          inputOnChange({...inputs, name: e.target.value})
        }
        disable={false}
      ></CustomInput>
      <CustomInput
        placeHolder="Symbol"
        label="Symbol"
        id="symbol"
        name="symbol"
        type="text"
        value={inputs.symbol}
        onChange={(e: any) =>
         inputOnChange({...inputs, symbol: e.target.value})
        }
        disable={false}
      ></CustomInput>
    </Stack>
  );
};

export default RegisterTokenForm;
