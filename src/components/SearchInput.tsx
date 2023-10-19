import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import React, { useState } from "react";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  searchBar: {
    border: "1px solid gray",
    "&:hover": { color: "black !important" },
  },
  focusSearchBar: {
    border: "1px solid #1793D1",
  },
  icon: {
    paddingLeft: "8px",
    color: "gray",
    width: "24px",
  },
  focusIcon: {
    paddingLeft: "8px",
    color: "#1793D1",
    width: "24px",
  },
  label: {
    width: "100%",
    marginLeft: "1rem",
    fontSize: "1rem",
    color: "gray",
    "&:hover": { color: "black !important" },
  },
  focusLabel: {
    marginLeft: "1rem",
    fontSize: "1rem",
    color: "#1793D1",
  },
}));

type Props = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
};

const SearchInput: React.FC<Props> = ({ onChange, label }) => {
  const [active, setActive] = useState<boolean>(false);
  const classes = useStyles();

  return (
    <Paper
      component="form"
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        height: "40px",
        borderRadius: "12px",
        width: "100%",
        boxShadow: "none",
      }}
      className={active ? classes.focusSearchBar : classes.searchBar}
    >
      <SearchIcon className={active ? classes.focusIcon : classes.icon} />
      <InputBase onFocus={() => setActive(true)} onBlur={() => setActive(false)} className={active ? classes.focusLabel : classes.label} placeholder={label} onChange={onChange} />
    </Paper>
  );
};

export default SearchInput;
