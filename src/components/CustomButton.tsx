import { Button } from "@mui/material";
import React from "react";

// const useStyles = makeStyles((theme: Theme) => ({
//   button: {},
// }));

type Props = {
  label: string;
  disable: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
};

export const CustomButton: React.FC<Props> = ({ label, onClick, disable }) => {
  return (
    <Button variant="contained" onClick={onClick} disabled={disable}>
      {label}
    </Button>
  );
};
