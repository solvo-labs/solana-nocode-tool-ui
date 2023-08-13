import React from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Theme,
} from "@mui/material";
import { TokenData } from "../utils/types";
import { makeStyles } from "@mui/styles";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  input: {
    width: "100%",
  },
}));

type Props = {
  tokens: TokenData[];
  selectedToken: TokenData | undefined;
  setSelectedToken: (param: TokenData) => void;
};

const TokenSelector: React.FC<Props> = ({
  tokens,
  selectedToken,
  setSelectedToken,
}) => {
  const classes = useStyles();
  return (
    <FormControl fullWidth>
      <InputLabel id="selectLabel">Select a Token</InputLabel>
      <Select
        value={selectedToken?.hex || ""}
        label=" Token"
        onChange={(e: SelectChangeEvent<string>) => {
          const token = tokens.find(
            (tkn: TokenData) => tkn.hex === e.target.value
          );
          if (token != undefined) {
            setSelectedToken(token);
          }
        }}
        className={classes.input}
        id={"custom-select"}
      >
        {tokens.map((tk: TokenData) => {
          return (
            <MenuItem key={tk.hex} value={tk.hex}>
              {tk.metadata.name + "(" + tk.metadata.symbol + ")"}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default TokenSelector;
