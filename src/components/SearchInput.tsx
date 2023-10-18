import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";

type Props = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
};

const SearchInput: React.FC<Props> = ({ onChange, label }) => {
  return (
    <Paper
      component="form"
      sx={{ p: "2px 4px", display: "flex", alignItems: "center", height: "40px", borderRadius: "12px", width: "100%", border: "1px solid", borderColor: "gray", boxShadow: "none" }}
    >
      <SearchIcon sx={{ p: "6px", color: "gray" }} />
      <InputBase sx={{ marginLeft: 1, flex: 1, fontSize: "0.75rem" }} placeholder={label} onChange={onChange} />
    </Paper>
  );
};

export default SearchInput;
