import React from "react";
import { Select } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  select: {
    fontFamily: "Raleway",
    width: "100%",
    height: "44px",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#AA66FE",
    boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
    backgroundColor: "#EF87FE !important",
    padding: "10px",
  },
}));

type Props = {
  id: string;
  onChange: any;
  value?: any;
  label?: string;
  children: any;
};

export const CustomSelect: React.FC<Props> = ({ onChange, value, children, id, label }) => {
  const classes = useStyles();

  return (
    <Select
      inputProps={{
        className: classes.select,
      }}
      sx={{
        "& .css-jedpe8-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select": {
          height: "27px",
          borderRadius: "1rem",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "1px solid #EF87FE",
          borderRadius: "1rem",
        },
      }}
      onChange={onChange}
      value={value}
      variant="outlined"
      size="small"
      fullWidth
      id={id}
      label={label}
    >
      {children}
    </Select>
  );
};
