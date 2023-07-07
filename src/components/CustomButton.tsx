import { Button, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

const useStyles = makeStyles((theme: Theme) => ({
  button: {},
}));

type Props = {
  label: string;
  disable: boolean;
  onClick: any;
};

export const CustomButton: React.FC<Props> = ({ label, onClick, disable }) => {
  const classes = useStyles();
  return (
    <Button variant="contained" onClick={onClick} disabled={disable}>
      {label}
    </Button>
  );
};
