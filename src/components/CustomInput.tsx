import React from "react";
import { makeStyles } from "@mui/styles";
import { TextField, Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    width: "100%",
    // maxHeight: "44px !important",
    [theme.breakpoints.up("sm")]: {
      // maxWidth: "24rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      // maxWidth: "12rem !important",
    },
  },
}));

type Props = {
  placeHolder: string;
  label: string;
  id: string;
  name: string;
  type: string;
  value: string | number;
  onChange: any;
  disable: boolean;
};

export const CustomInput: React.FC<Props> = ({
  placeHolder,
  label,
  id,
  name,
  type,
  value,
  onChange,
  disable
}) => {
  const classes = useStyles();

  return (
    <TextField
      className={classes.input}
      placeholder={placeHolder}
      id={id}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      required
      type={type}
      disabled={disable}
    ></TextField>
  );
};