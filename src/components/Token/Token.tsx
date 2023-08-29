import React from "react";
import { Grid, Stack } from "@mui/material";
import ImageUpload from "../ImageUpload";
import { CustomInput } from "../Custom/CustomInput";
import { TokenWithType } from "../../utils/types";

type Props = {
  tokenOnChange: (value: TokenWithType) => void;
  token: TokenWithType;
  fileOnChange: (value: any) => void;
  file: any;
};

const Token: React.FC<Props> = ({ tokenOnChange, token, fileOnChange, file }) => {
  return (
    <Grid item justifyContent={"center"} marginBottom={"2rem"}>
      <Stack direction={"column"} spacing={2} alignItems={"center"}>
        <ImageUpload file={file} setFile={(data) => fileOnChange(data)} />
        <CustomInput
          placeholder="Name"
          label="Name"
          id="name"
          name="name"
          type="text"
          value={token.name}
          onChange={(e: any) => tokenOnChange({ ...token, name: e.target.value })}
          disable={false}
        ></CustomInput>
        <CustomInput
          placeholder="Symbol"
          label="Symbol"
          id="symbol"
          name="symbol"
          type="text"
          value={token.symbol}
          onChange={(e: any) => tokenOnChange({ ...token, symbol: e.target.value })}
          disable={false}
        ></CustomInput>
        <CustomInput
          placeholder="Amount"
          label="Amount"
          id="amount"
          name="amount"
          type="text"
          value={token.amount}
          onChange={(e: any) => tokenOnChange({ ...token, amount: e.target.value })}
          disable={false}
        ></CustomInput>
        <CustomInput
          placeholder="Decimal"
          label="Decimal"
          id="decimal"
          name="decimal"
          type="text"
          value={token.decimal}
          onChange={(e: any) => tokenOnChange({ ...token, decimal: e.target.value })}
          disable={false}
        />
        <CustomInput
          placeholder="Authority"
          label="Authority"
          id="authority"
          name="authority"
          type="text"
          value={token.authority || ""}
          onChange={(e: any) => tokenOnChange({ ...token, authority: e.target.value })}
          disable={false}
        />
        <CustomInput
          placeholder="Freeze Authority"
          label="Freeze Authority"
          id="freezeAuthority"
          name="freezeAuthority"
          type="text"
          value={token.freezeAuthority || ""}
          onChange={(e: any) => tokenOnChange({ ...token, freezeAuthority: e.target.value })}
          disable={false}
        />
      </Stack>
    </Grid>
  );
};

export default Token;
