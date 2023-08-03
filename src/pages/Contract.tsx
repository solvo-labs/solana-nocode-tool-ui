/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnchorProvider, Program, Idl } from "@project-serum/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { getIdl } from "../lib/contract";
import toastr from "toastr";
import { Box, CircularProgress, Divider, FormControl, Grid, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../components/CustomInput";
import { CustomButton } from "../components/CustomButton";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "50vw",
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    position: "relative", // Modal içeriği için göreceli konumlandırma
  },
}));

export const ContractPage = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [program, setProgram] = useState<Program>();
  const [programId, setProgramId] = useState<string>("3MYQ4iEZC2XcRmB7U2XuasWxQPGKmorGBiuwBqJcHBni");
  const [provider, setProvider] = useState<AnchorProvider>();
  const [actionModal, setActionModal] = useState<{ show: boolean; readAction?: { address: string; account: string; data?: any } }>({ show: false });
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

  const exec = async () => {
    try {
      if (program) {
        if (actionModal.readAction) {
          const accounts = program.account;

          const currentAccount = accounts[actionModal.readAction.account.toLowerCase()];

          let data;
          if (actionModal.readAction.address) {
            data = await currentAccount.fetch(actionModal.readAction.address);
          } else {
            data = await currentAccount.all();
          }

          setActionModal({ ...actionModal, readAction: { ...actionModal.readAction, data } });
        }
      }
    } catch {
      toastr.error("Something went wrong please check your inputs");
    }
  };

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
    <Grid container className={classes.container} direction={"column"}>
      <h3 style={{ textAlign: "center" }}>Contract Iteration</h3>

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
                          <CustomButton
                            label={"Run"}
                            disable={false}
                            onClick={() => {
                              setActionModal({ show: true });
                            }}
                          />
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
                        <TableCell align="right">
                          <CustomButton
                            label={"Fetch"}
                            disable={false}
                            onClick={() => {
                              setActionModal({ show: true, readAction: { account: row.name, address: "" } });
                            }}
                          />
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
      <Modal
        className={classes.modal}
        open={actionModal.show}
        onClose={() => {
          setActionModal({ show: false });
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            borderRadius: "8px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 1,
          }}
        >
          <div className={classes.modalContent}>
            <Typography id="modal-modal-title" variant="h6" component="h2" color={"black"} align="center" marginBottom={"1rem"}>
              Run Your Contract Functions
            </Typography>
            <div>
              {actionModal.readAction && (
                <CustomInput
                  placeHolder="Address"
                  label="Address (optional)"
                  required={false}
                  id="address"
                  name="address"
                  type="text"
                  value={actionModal.readAction.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setActionModal({ ...actionModal, ...(actionModal.readAction ? { readAction: { ...actionModal.readAction, address: e.target.value } } : {}) })
                  }
                  disable={false}
                />
              )}

              <Divider sx={{ margin: 1 }} />
              {actionModal.readAction && actionModal.readAction.data && (
                <TableContainer>
                  <Table aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Public Key</TableCell>
                        {Object.keys(actionModal.readAction.data[0].account).map((key) => (
                          <TableCell>{key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {actionModal.readAction.data.map((row: any) => (
                        <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell component="th" scope="row">
                            {row.publicKey.toBase58()}
                          </TableCell>
                          {Object.values(JSON.parse(JSON.stringify(row.account))).map((value: any) => (
                            <TableCell>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <div style={{ textAlign: "center" }}>
                <CustomButton label="Run" onClick={exec} disable={false} />
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </Grid>
  );
};
