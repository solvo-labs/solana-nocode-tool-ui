import React, { useState } from "react";
import { Grid, Theme } from "@mui/material";
import ImageUpload from "../ImageUpload";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../CustomInput";
import { Dao } from "../../utils/types";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export const DaoInfo: React.FC = () => {
  const [file, setFile] = useState<any>();
  const [dao, setDao] = useState<Dao>({ name: "", description: "", image: "" });

  const classes = useStyles();

  return (
    <Grid container className={classes.container} direction={"column"}>
      <ImageUpload file={file} setFile={(data) => setFile(data)} />
      <CustomInput
        placeholder="DAO Name"
        label="DAO Name"
        id="name"
        name="name"
        type="text"
        value={dao.name}
        onChange={(e: any) => setDao({ ...dao, name: e.target.value })}
        disable={false}
      />
      <CustomInput
        placeholder="DAO Description"
        label="DAO Description"
        id="description"
        name="description"
        type="text"
        value={dao.description}
        onChange={(e: any) => setDao({ ...dao, description: e.target.value })}
        disable={false}
      />
    </Grid>
  );
};
