import { Divider, Grid, MenuItem, SelectChangeEvent } from "@mui/material";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { TokenData, TokenWithType } from "../../utils/types";
import Token from "../Token/Token";
import { CustomSelect } from "../Custom/CustomSelect";
import { TOKEN_TYPES } from "../../utils/enum";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { fetchUserTokens } from "../../lib";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tokenFromWallet: {
    margin: "1rem",
  },
}));

type Props = {
  tokenDetailOnChange: (value: TokenWithType) => void;
  tokenDetail: TokenWithType;
};

const TokenDetail: React.FC<Props> = ({ tokenDetailOnChange, tokenDetail }) => {
  const [file, setFile] = useState<any>();
  const [tokenType, setTokenType] = useState<TOKEN_TYPES>(tokenDetail.type);
  const [myTokens, setMyTokens] = useState<Array<TokenData>>([]);

  const classes = useStyles();
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const selectType = (e: any) => {
    setTokenType(e.target.value as TOKEN_TYPES);

    tokenDetailOnChange({
      ...tokenDetail,
      type: e.target.value,
    });
  };

  const selectToken = (e: SelectChangeEvent) => {
    e.preventDefault();

    tokenDetailOnChange({
      type: TOKEN_TYPES.TOKEN_FROM_WALLET,
      amount: 10,
      decimal: 8,
      name: "token",
      symbol: "symbol",
      freezeAuthority: "freeze",
      authority: "authority",
    });
  };

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);

        setMyTokens(data);
      }
    };

    init();
  }, [connection, publicKey]);

  return (
    <div>
      <CustomSelect id={"select-type"} onChange={selectType} value={tokenType}>
        {" "}
        <MenuItem value={TOKEN_TYPES.NEW_TOKEN}>{TOKEN_TYPES.NEW_TOKEN}</MenuItem>
        <MenuItem value={TOKEN_TYPES.TOKEN_FROM_WALLET}>{TOKEN_TYPES.TOKEN_FROM_WALLET}</MenuItem>
      </CustomSelect>
      {tokenType === TOKEN_TYPES.NEW_TOKEN && (
        <Grid container className={classes.container} direction={"column"}>
          <Grid item marginBottom={"2rem"}>
            {/* <Typography variant="h5" className={classes.title}>
            Token Mint
          </Typography> */}
            <Divider sx={{ marginTop: "1rem", background: "white" }} />
          </Grid>
          <Token tokenOnChange={tokenDetailOnChange} token={tokenDetail} fileOnChange={setFile} file={file} isNavigate={false} />
        </Grid>
      )}
      {tokenType === TOKEN_TYPES.TOKEN_FROM_WALLET && (
        <div className={classes.tokenFromWallet}>
          <CustomSelect id="token-from-wallet" onChange={selectToken} value={"address"} label="Choose a token">
            {myTokens.map((token: TokenData) => {
              return (
                <MenuItem key={token.metadata.symbol} value={token.metadata.name}>
                  {token.metadata.name + "(" + token.metadata.symbol + ")"}
                </MenuItem>
              );
            })}
          </CustomSelect>
        </div>
      )}
    </div>
  );
};

export default TokenDetail;
