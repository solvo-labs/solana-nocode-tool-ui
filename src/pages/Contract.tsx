import { AnchorProvider, Program, Idl } from "@project-serum/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { getIdl } from "../lib/contract";
import toastr from "toastr";
import { CircularProgress, Divider, FormControl, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../components/CustomInput";
import { CustomButton } from "../components/CustomButton";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "30vw",
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
}));

export const ContractPage = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [program, setProgram] = useState<Program>();
  const [programId, setProgramId] = useState<string>("3MYQ4iEZC2XcRmB7U2XuasWxQPGKmorGBiuwBqJcHBni");
  const [provider, setProvider] = useState<AnchorProvider>();
  const classes = useStyles();

  useEffect(() => {
    if (wallet) {
      const providerInstance = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });

      setProvider(providerInstance);
    }
  }, [connection, wallet]);

  const fetchProgram = async () => {
    try {
      const PROGRAM_ID = new PublicKey(programId);
      setLoading(true);

      const IDL: Idl = await getIdl(connection, PROGRAM_ID);

      const programInfo = new Program(IDL as Idl, PROGRAM_ID, provider);

      setProgram(programInfo);
      setLoading(false);
    } catch {
      toastr.warning("Please check your contract id");
      setProgram(undefined);
      setLoading(false);
    }
  };

  console.log(program?.idl);

  if (loading) {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <Grid container className={classes.container} direction={"column"}>
        <h3 style={{ textAlign: "center" }}>Contract Iteration</h3>
      </Grid>
      {program ? (
        <Grid item textAlign={"center"}>
          <h3 style={{ margin: 0 }}>{program?.idl.name + " Contract Details" + (" v (" + program?.idl.version + ")")}</h3>
          <Divider sx={{ marginTop: 1, background: "white" }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <h4>Functions</h4>
              <Divider />
              <TableContainer>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Function</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {program.idl.instructions.map((row) => (
                      <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell>
                          <CustomButton label={"Run"} disable={false} onClick={() => {}} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={6}>
              <h4>Accounts</h4>
              <Divider />
              <TableContainer>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Account</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {program.idl.accounts!.map((row) => (
                      <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell>
                          <CustomButton label={"Run"} disable={false} onClick={() => {}} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
          <Grid container direction={"column"} display={"flex"} justifyContent={"center"}>
            <Grid item display={"flex"} justifyContent={"center"} marginTop={"1rem"}>
              <FormControl fullWidth>
                <CustomButton disable={programId === ""} label="Clean & Fetch New Contract" onClick={() => setProgram(undefined)} key={"key"}></CustomButton>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid container display={"flex"} key={"index"} justifyContent={"space-evenly"} marginBottom={"1rem"}>
          <FormControl fullWidth>
            <Grid item>
              <CustomInput
                key={"input"}
                label="Program Id"
                name="programId"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramId(e.target.value)}
                placeHolder="Program Id"
                type="text"
                value={programId}
                disable={false}
              />
            </Grid>
          </FormControl>
          <Grid container direction={"column"} display={"flex"} justifyContent={"center"}>
            <Grid item display={"flex"} justifyContent={"center"} marginTop={"1rem"}>
              <FormControl fullWidth>
                <CustomButton disable={programId === ""} label="Fetch Program" onClick={fetchProgram} key={"key"}></CustomButton>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};
