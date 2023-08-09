/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, CardContent, CircularProgress, Divider, Grid, IconButton, Stack, TextField, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useMemo, useState } from "react";
import { Section, TokenData } from "../../utils/types";
import { fetchUserTokens } from "../../lib";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import TokenSelector from "../../components/TokenSelector";
// import VestingForm from "../../components/VestingForm";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { CustomInput } from "../../components/CustomInput";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: "1rem",
    minWidth: "80vw",
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      minWidth: "90vw",
      marginTop: "3rem",
    },
  },
  selectorContainer: {
    minWidth: "30vw !important",
    maxWidth: "30vw !important",
    textAlign: "center",
    [theme.breakpoints.down("lg")]: {
      minWidth: "40vw !important",
    },
    [theme.breakpoints.down("md")]: {
      minWidth: "60vw !important",
    },
  },
  titleContainer: {},
  input: {
    width: "100%",
  },
  itemContainer: {
    marginTop: "2rem !important",
  },
  cardContainer: {
    justifyContent: "center",
    minWidth: "60vw !important",
    maxWidth: "60vw !important",
    [theme.breakpoints.down("md")]: {
      minWidth: "90vw !important",
    },
  },
  cardContent: {
    display: "flex",
    justifyContent: "center",
    paddingBottom: "16px !important",
  },
}));

export const Tokenomics = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const classes = useStyles();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData>();
  // const [availableBalance, setAvailableBalance] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);

  const [sections, setSections] = useState<Section[]>([
    {
      name: "",
      amount: 0,
      percent: 0,
    },
  ]);

  const addInput = () => {
    setSections([...sections, { name: "", amount: 0, percent: 0 }]);
  };

  const removeInput = (index: number) => {
    const list = [...sections];
    list.splice(index, 1);
    setSections(list);
  };

  const limits = useMemo(() => {
    if (selectedToken) {
      const totalBalance = selectedToken.amount / Math.pow(10, selectedToken.decimal);

      let availableBalance = totalBalance - sections.reduce((acc, cur) => acc + cur.amount, 0);

      const availablePercent = (availableBalance / totalBalance) * 100;

      if (availableBalance < 0) {
        availableBalance = 0;
      }

      return { availableBalance, availablePercent };
    }
  }, [sections, selectedToken]);

  const sectionSetter = (e: React.ChangeEvent<HTMLInputElement>, index: number, key: keyof Section) => {
    const newSection = [...sections];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    if (selectedToken) {
      let targetValue: any;

      switch (key) {
        case "amount":
          targetValue = +e.target.value;

          // eslint-disable-next-line no-case-declarations
          const newPercent: number = +((targetValue / (selectedToken?.amount / Math.pow(10, selectedToken?.decimal))) * 100).toFixed(2);
          newSection[index] = {
            ...newSection[index],
            [key]: targetValue,
            percent: newPercent,
          };
          break;
        case "percent":
          targetValue = +e.target.value;

          // eslint-disable-next-line no-case-declarations
          const newAmount: number = (selectedToken?.amount / Math.pow(10, selectedToken?.decimal) / 100) * targetValue;
          newSection[index] = {
            ...newSection[index],
            amount: newAmount,
            [key]: targetValue,
          };
          break;
        case "name":
          targetValue = e.target.value;
          newSection[index] = { ...newSection[index], [key]: targetValue };
          break;
        default:
          break;
      }
    }

    setSections(newSection);
  };

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);
        setTokens(data);
        setLoading(false);
      }
    };
    init();
  }, [connection, publicKey]);

  const disable = useMemo(() => {
    const lenghtControl = sections.every((e: any) => e.name.length > 0);
    const disable = !(selectedToken != undefined && lenghtControl);
    return disable;
  }, [sections, selectedToken]);

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
    <Stack spacing={4} display={"flex"} alignItems={"center"}>
      <Grid container className={classes.container}>
        <Grid item>
          <Stack spacing={4}>
            <Grid item className={classes.selectorContainer}>
              <Typography variant="h5">Tokenomics</Typography>
              <Divider sx={{ marginTop: "1rem", background: "white" }} />
            </Grid>
            <Grid item>
              <TokenSelector selectedToken={selectedToken} setSelectedToken={(data) => setSelectedToken(data)} tokens={tokens}></TokenSelector>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
      <Grid container className={classes.cardContainer}>
        <Grid item width={"100%"}>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <Stack direction={"row"} justifyContent={"center"} width={"100%"} spacing={4}>
              {selectedToken ? (
                <>
                  <Typography>Selected: {selectedToken?.metadata.name}</Typography>
                  <Divider orientation="vertical" />
                  {limits?.availableBalance ? (
                    <Typography>
                      Available balance: {limits.availableBalance} (%
                      {limits.availablePercent.toFixed(2)})
                    </Typography>
                  ) : (
                    <Typography>Available balance: {limits?.availableBalance} </Typography>
                  )}
                  <Divider orientation="vertical" />
                  <Typography>
                    Total Balance:
                    {selectedToken?.amount / Math.pow(10, selectedToken.decimal)}
                  </Typography>
                </>
              ) : (
                "Not selected any Token"
              )}
            </Stack>
          </CardContent>
          {selectedToken && (
            <Stack direction={"column"} justifyContent={"space-around"} spacing={2}>
              {sections.map((e: any, index: number) => (
                <Stack direction={"row"} spacing={2} key={index}>
                  <Grid item display={"flex"} alignContent={"center"}>
                    {index > sections.length - 2 ? (
                      <IconButton onClick={addInput} disabled={disable}>
                        <AddIcon></AddIcon>
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => removeInput(index)}>
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Grid>
                  <CustomInput
                    label="Section Name"
                    name="sectionName"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => sectionSetter(e, index, "name")}
                    placeHolder="Section Name"
                    type="text"
                    value={sections[index].name}
                  ></CustomInput>
                  <TextField
                    label="%"
                    placeholder="percent"
                    value={sections[index].percent}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => sectionSetter(e, index, "percent")}
                    type="text"
                  ></TextField>
                  <TextField
                    label="Amount"
                    placeholder="Amount"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => sectionSetter(e, index, "amount")}
                    type="text"
                    value={sections[index].amount}
                  ></TextField>
                  <Grid item display={"flex"} alignContent={"center"}>
                    <Button variant="contained" onClick={() => {}}>
                      Vesting
                    </Button>
                  </Grid>
                </Stack>
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
};
