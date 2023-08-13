/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, useRef } from "react";
import { Avatar, Button, Grid, IconButton, Stack, Theme, Tooltip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "@mui/styles";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  container: {
    borderColor: "black !important",
    borderRadius: "16px",
    padding: "1rem",
    justifyContent: "space-between",
    borderStyle: "solid",
    borderWidth: "0.02rem",
    width: "100%",
  },
  input: {
    display: "none",
  },
  button: {
    maxHeight: "30px",
    fontSize: "0.8rem !important",
  },
}));

type Props = {
  file: File | undefined;
  setFile: (image: File | undefined) => void;
};

const ImageUpload: React.FC<Props> = ({ file, setFile }) => {
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearButtonClick = () => {
    setFile(undefined);
    inputRef.current!.value = "";
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];

      setFile(file);
    }
  };
  
  return (
    <Grid container className={classes.container}>
      <Grid item>
        <Stack spacing={1}>
          <Typography variant="body1" color="black">
            Upload your icon (optional)
          </Typography>
          <input className={classes.input} accept="image/*" multiple id="contained-button-file" type="file" onChange={handleFileInputChange}></input>
          <label htmlFor="contained-button-file">
            <Button className={classes.button} variant="contained" color="primary" component="span">
              Select Image
            </Button>
          </label>
        </Stack>
      </Grid>
      <Grid item display={"flex"} justifySelf={"flex-end"}>
        <Grid container display={"flex"} alignItems={"center"}>
          <Grid item>
            <Tooltip title="Clear image">
              <IconButton onClick={handleClearButtonClick}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          {file && <Avatar alt="Remy Sharp" src={URL.createObjectURL(file)} sx={{ width: 72, height: 72 }}></Avatar>}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ImageUpload;
