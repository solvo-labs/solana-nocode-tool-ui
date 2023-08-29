import React from "react";
import { makeStyles } from "@mui/styles";
import { TextField, Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  // input: {
  //   width: "100%",
  //   // maxHeight: "44px !important",
  //   [theme.breakpoints.up("sm")]: {
  //     // maxWidth: "24rem !important",
  //   },
  //   [theme.breakpoints.down("sm")]: {
  //     // maxWidth: "12rem !important",
  //   },
  //   borderColor: "white !important",

  // },
  input: {
    width: "400px",
    maxHeight: "44px",
    color: "#767D86",
    boxShadow: "none",
    fontSize: "1rem",
    fontFamily: "Raleway",
    fontWeight: "500",
    marginTop: "1rem !important",
    [theme.breakpoints.down("sm")]: {
      minWidth: "300px",
    },
  },
}));

type Props = {
  placeholder: string;
  label: string;
  id?: string;
  name: string;
  type: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> | undefined;
  disable?: boolean;
  required?: boolean;
};

export const CustomInput: React.FC<Props> = ({ placeholder, label, id, name, type, value, onChange, disable = false, required = true }) => {
  const classes = useStyles();

  return (
    <TextField
      sx={{
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: "1rem",
          border: "1px solid black",
          "&:hover": {
            borderColor: "black",
          },
        },
        "& .css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input": {
          height: "11px",
          background: "transparent",
        },
        label: {
          color: "black",
        },
        "& .css-14s5rfu-MuiFormLabel-root-MuiInputLabel-root": {
          ";-webkit-transform": "translate(14px, 12px) scale(1)",
        },
      }}
      className={classes.input}
      placeholder={placeholder}
      id={id}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      type={type}
      disabled={disable}
    />
  );
};
