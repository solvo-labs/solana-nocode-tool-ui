/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Divider, FormControl, Grid, IconButton, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { HighlightOff } from "@mui/icons-material";
import { createMultiSig } from "../../lib/multisig";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useNavigate } from "react-router-dom";
import toastr from "toastr";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "30vw",
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
  title: {
    textAlign: "center",
  },
  subTitle: {
    textAlign: "start",
  },
  input: {
    width: "100%",
    // maxHeight: "44px !important",
    [theme.breakpoints.up("sm")]: {
      // minWidth: "18rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      // minWidth: "12rem !important",
    },
  },
}));

export const Multisignature = () => {
  const classes = useStyles();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [signatures, setSignatures] = useState<string[]>([publicKey?.toBase58() || ""]);
  const [threshold, setThreshold] = useState<number>(1);
  const navigate = useNavigate();

  const addInput = () => {
    setSignatures([...signatures, ""]);
  };

  const removeInput = (index: number) => {
    const list = [...signatures];
    list.splice(index, 1);
    setSignatures(list);
  };

  const signatureSetter = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newSignature = [...signatures];
    newSignature[index] = e.target.value;
    setSignatures(newSignature);
  };

  const disable = useMemo(() => {
    const lastSignature = signatures[signatures.length - 1];
    const lenghtControl = signatures.every((e: string) => e.length > 31 && e.length < 45);
    const disable = !(lastSignature != "" && lenghtControl);
    return disable;
  }, [signatures]);

  const signatureTransaction = async () => {
    if (publicKey) {
      const signatureKeys = signatures.map((key: string) => new PublicKey(key));
      const { transaction, newAccount } = await createMultiSig(connection, publicKey, threshold, signatureKeys);

      const {
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();
      try {
        const signatureTransaction = new Transaction();
        signatureTransaction.add(transaction);

        const signatureSignature = await sendTransaction(transaction, connection, { signers: [newAccount] });

        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: signatureSignature,
        });

        toastr.success("Multisignature created successfully.");
        navigate("/");
      } catch (error: any) {
        toastr.error(error);
      }
    }
  };

  // useEffect(() => {
  //   const init = async () => {
  //     // if (publicKey) {
  //     //   const account = await fetchAllMultisignatureAddress(
  //     //     connection,
  //     //     publicKey
  //     //   );
  //     //   const activeAccounts = await Promise.all(account);
  //     //   account.forEach((account, index) => {
  //     //     // const parse = account.account?.data;
  //     //     // console.log(parse);
  //     //   });
  //     // }
  //   };

  //   init();
  // }, []);

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Multisignature</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid item marginTop={"2rem"}>
        <Stack direction={"column"} width={"100%"} spacing={4}>
          {signatures.map((_e: string, index) => (
            <Grid container display={"flex"} key={index} justifyContent={"space-evenly"}>
              <FormControl fullWidth>
                <Grid item>
                  <CustomInput
                    key={index}
                    label="Signature"
                    name="signature"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => signatureSetter(e, index)}
                    placeHolder="Signature"
                    type="text"
                    value={signatures[index]}
                    disable={false}
                  ></CustomInput>
                </Grid>
              </FormControl>
              {signatures.length > 1 && (
                <Grid item>
                  <IconButton
                    key={index}
                    onClick={() => {
                      removeInput(index);
                    }}
                  >
                    <HighlightOff />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          ))}

          <Grid container>
            <Grid item xs={4} sx={{ minHeight: "1.4375em", display: "flex", justifyContent: "center" }}>
              <span style={{ fontSize: "1.3rem", alignItems: "center", display: "flex" }}>{signatures.length} OF</span>
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <Grid item>
                  <CustomInput
                    label="Threshold"
                    name="threshold"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreshold(Number(e.target.value))}
                    placeHolder="Threshold"
                    type="text"
                    value={threshold}
                    disable={false}
                  ></CustomInput>
                </Grid>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container direction={"column"} display={"flex"} justifyContent={"center"}>
            <Grid item display={"flex"} justifyContent={"center"}>
              <FormControl fullWidth>
                <CustomButton disable={disable} label="Add signature" onClick={addInput} key={"key"}></CustomButton>
              </FormControl>
            </Grid>

            <Grid item display={"flex"} justifyContent={"center"} marginTop={"1rem"}>
              <FormControl fullWidth>
                <CustomButton disable={disable} label="Confirm signature" onClick={signatureTransaction} key={"key"}></CustomButton>
              </FormControl>
            </Grid>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};
