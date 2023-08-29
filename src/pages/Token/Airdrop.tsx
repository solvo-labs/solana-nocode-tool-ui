import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { airdrop } from "../../lib/utils";
import { PublicKey } from "@solana/web3.js";
import { CircularProgress, FormControl, Grid } from "@mui/material";
import { CustomInput } from "../../components/Custom/CustomInput";
import { CustomButton } from "../../components/Custom/CustomButton";
import toastr from "toastr";

export const Airdrop = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [key, setKey] = useState<string>(publicKey?.toBase58() || "");
  const [loading, setLoading] = useState<boolean>(false);

  const airdropRequest = async () => {
    setLoading(true);
    airdrop(connection, new PublicKey(key))
      .then(() => {
        toastr.success("1SOL arrived your wallet successfully.");
      })
      .catch((err) => {
        console.log(err);
        toastr.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
          width: "50vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid container display={"flex"} key={"index"} justifyContent={"space-evenly"} marginBottom={"1rem"}>
      <h3 style={{ textAlign: "center" }}>Faucet for 1SOL</h3>
      <FormControl fullWidth>
        <Grid item>
          <CustomInput
            key={"input"}
            label="Public Key"
            name="publicKey"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
            placeholder="Public Key"
            type="text"
            value={key}
            disable={false}
          />
        </Grid>
      </FormControl>
      <Grid container direction={"column"} display={"flex"} justifyContent={"center"}>
        <Grid item display={"flex"} justifyContent={"center"} marginTop={"1rem"}>
          <FormControl fullWidth>
            <CustomButton disable={key === ""} label="FAUCET REQUEST" onClick={airdropRequest} key={"key"}></CustomButton>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
};
