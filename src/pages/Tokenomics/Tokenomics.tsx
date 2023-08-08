/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
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
  const [availableBalance, setAvailableBalance] = useState<number>();

  const [sections, setSections] = useState<Section[]>([
    {
      name: "",
      amount: 0,
    },
  ]);

  const addInput = () => {
    setSections([...sections, { name: "", amount: 0 }]);
  };

  const removeInput = (index: number) => {
    const list = [...sections];
    list.splice(index, 1);
    setSections(list);
  };

  const sectionSetter = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    key: keyof Section
  ) => {
    const newSection = [...sections];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let targetValue: any;
    key === "amount"
      ? (targetValue = +e.target.value)
      : (targetValue = e.target.value);
    newSection[index] = { ...newSection[index], [key]: targetValue };
    setSections(newSection);
  };

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);
        setTokens(data);
      }
    };
    init();
  }, [connection, publicKey]);

  const disable = useMemo(() => {
    const lenghtControl = sections.every((e: any) => e.name.length > 0);
    const disable = !(selectedToken != undefined && lenghtControl);
    return disable;
  }, [sections, selectedToken]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const balanceManager = useMemo(() => {
    if (selectedToken) {
      const totalBalance =
        selectedToken.amount / Math.pow(10, selectedToken.decimal);
      const availableBalance =
        totalBalance - sections.reduce((acc, cur) => acc + cur.amount, 0);
      setAvailableBalance(availableBalance);
    }
  }, [sections, selectedToken]);

  console.log(sections);

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
              <TokenSelector
                selectedToken={selectedToken}
                setSelectedToken={(data) => setSelectedToken(data)}
                tokens={tokens}
              ></TokenSelector>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
      <Grid container className={classes.cardContainer}>
        <Grid item width={"100%"}>
          <Card>
            <CardContent className={classes.cardContent}>
              <Card sx={{ bgcolor: "whitesmoke", width: "100%" }}>
                <CardContent sx={{ display: "flex", justifyContent: "center" }}>
                  <Stack
                    direction={"row"}
                    justifyContent={"center"}
                    width={"100%"}
                    spacing={4}
                  >
                    {selectedToken ? (
                      <>
                        <Typography>
                          Selected: {selectedToken?.metadata.name}
                        </Typography>
                        <Divider orientation="vertical" />
                        {availableBalance && (
                          <Typography>
                            Available balance: {availableBalance} (%
                            {(
                              (availableBalance /
                                (selectedToken?.amount /
                                  Math.pow(10, selectedToken.decimal))) *
                              100
                            ).toFixed(2)}
                            )
                          </Typography>
                        )}
                        <Divider orientation="vertical" />
                        <Typography>
                          Total Balance:
                          {selectedToken?.amount /
                            Math.pow(10, selectedToken.decimal)}
                        </Typography>
                      </>
                    ) : (
                      "Not selected any Token"
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </CardContent>
            {selectedToken && (
              <CardContent className={classes.cardContent}>
                <Stack
                  direction={"column"}
                  justifyContent={"space-around"}
                  spacing={2}
                >
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          sectionSetter(e, index, "name")
                        }
                        placeHolder="Section Name"
                        type="text"
                        value={sections[index].name}
                      ></CustomInput>
                      <TextField
                        placeholder="aaa"
                        value={
                          "%" +
                          (
                            (sections[index].amount /
                              (selectedToken?.amount /
                                Math.pow(10, selectedToken.decimal))) *
                            100
                          ).toFixed(2)
                        }
                        disabled
                      ></TextField>
                      <TextField
                        placeholder="Amount"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          sectionSetter(e, index, "amount")
                        }
                        type="text"
                        value={sections[index].amount}
                      ></TextField>
                      <Grid item display={"flex"} alignContent={"center"}>
                        <Button onClick={() => console.log(sections[index])}>
                          Vesting
                        </Button>
                      </Grid>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};
