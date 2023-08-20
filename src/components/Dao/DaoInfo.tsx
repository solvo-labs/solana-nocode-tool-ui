import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import ImageUpload from "../ImageUpload";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../CustomInput";
import { Dao } from "../../utils/types";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

type Props = {
  daoOnChange: (value: Dao) => void;
  dao: Dao;
  disableButtonOnChange: (value: boolean) => void;
};

export const DaoInfo: React.FC<Props> = ({ daoOnChange, dao, disableButtonOnChange }) => {
  const [file, setFile] = useState<any>();

  const classes = useStyles();

  useEffect(() => {
    disableButtonOnChange(!(dao.name && dao.description));
  }, [dao.description, dao.name, disableButtonOnChange]);

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
        onChange={(e: any) => daoOnChange({ ...dao, name: e.target.value })}
        disable={false}
      />
      <CustomInput
        placeholder="DAO Description"
        label="DAO Description"
        id="description"
        name="description"
        type="text"
        value={dao.description}
        onChange={(e: any) => daoOnChange({ ...dao, description: e.target.value })}
        disable={false}
      />
    </Grid>
  );
};
