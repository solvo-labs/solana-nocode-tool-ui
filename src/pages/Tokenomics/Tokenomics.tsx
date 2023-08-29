/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, CardContent, CircularProgress, Divider, Grid, IconButton, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useMemo, useState } from "react";
import { Section, TokenData } from "../../utils/types";
import { fetchUserTokens } from "../../lib";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import TokenSelector from "../../components/TokenSelector";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { CustomInput } from "../../components/Custom/CustomInput";
import { useNavigate } from "react-router-dom";
import { getVestingMyOwn } from "../../lib/vesting";

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
      isOldSection: false,
    },
  ]);

  // const [oldVestingList, setOldVestingList] = useState<{ date: number; value: number; name: string }[]>([]);

  const navigate = useNavigate();

  const addInput = () => {
    setSections([...sections, { name: "", amount: 0, percent: 0, isOldSection: false }]);
  };

  const removeInput = (index: number) => {
    const list = [...sections];
    list.splice(index, 1);
    setSections(list);
  };

  const limits = useMemo(() => {
    if (selectedToken) {
      // const totalBalance = selectedToken.amount / Math.pow(10, selectedToken.decimal);

      const availableBalance = selectedToken.supply.value.uiAmount! - sections.reduce((acc, cur) => acc + cur.amount, 0);

      const availablePercent = (availableBalance / Number(selectedToken.supply.value.uiAmount)) * 100;

      return { availableBalance, availablePercent };
    }
  }, [sections, selectedToken]);

  const sectionSetter = (e: React.ChangeEvent<HTMLInputElement>, index: number, key: keyof Section) => {
    const newSection = [...sections];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    if (selectedToken) {
      let targetValue: any;
      const supply = selectedToken.supply.value.uiAmount || 0;

      switch (key) {
        case "amount":
          targetValue = +e.target.value;

          // eslint-disable-next-line no-case-declarations
          const newPercent: number = +((targetValue / supply) * 100).toFixed(2);
          newSection[index] = {
            ...newSection[index],
            [key]: targetValue,
            percent: newPercent,
          };
          break;
        case "percent":
          targetValue = +e.target.value;

          // eslint-disable-next-line no-case-declarations
          const newAmount: number = (supply / 100) * targetValue;
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

  useEffect(() => {
    const getVestingAboutThisToken = async () => {
      if (publicKey && selectedToken) {
        const allVestings = await getVestingMyOwn(publicKey?.toBase58());
        const filteredVesting = allVestings?.filter((all) => all[1].mint === selectedToken.hex);

        if (filteredVesting && filteredVesting.length > 0) {
          console.log("1");
          const contracts = filteredVesting.map((av) => av[1]);

          const oldVestings = contracts.filter((ct) => ct.mint === selectedToken.hex);

          const total: { date: number; value: number; name: string }[] = [];

          oldVestings.forEach((ov) => {
            const currentIndex = total.findIndex((tl) => tl.date === ov.createdAt);

            if (currentIndex < 0) {
              total.push({ date: ov.createdAt, value: ov.depositedAmount.toNumber(), name: ov.name });
            } else {
              total[currentIndex] = { date: ov.createdAt, name: ov.name, value: total[currentIndex].value + ov.depositedAmount.toNumber() };
            }
          });

          const oldSections: Section[] = total.map((ol) => {
            return {
              name: ol.name,
              amount: ol.value / Math.pow(10, selectedToken.decimal),
              percent: (ol.value / Number(selectedToken.supply.value.amount) || 1) * 100,
              isOldSection: true,
            };
          });

          setSections([...oldSections, ...sections]);
        } else {
          console.log("2");
          setSections([
            {
              name: "",
              amount: 0,
              percent: 0,
              isOldSection: false,
            },
          ]);
        }
      }
    };

    getVestingAboutThisToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, selectedToken]);

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
              {selectedToken && (
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
              )}
            </Stack>
          </CardContent>
          {/* {oldVestingList && oldVestingList.length > 0 && (
            <>
              <h2 style={{ marginBottom: "0" }}>Vesting History</h2>
              <List dense sx={{ width: "100%" }}>
                {oldVestingList.map((value, index) => {
                  const labelId = `checkbox-list-secondary-label-${value}`;
                  return (
                    <>
                      <ListItem key={index} disablePadding>
                        <ListItemText
                          style={{ color: "black", fontSize: "1rem" }}
                          id={labelId}
                          primary={
                            "Date :  " +
                            dayjs.unix(value.date).format("YYYY-MM-DD HH:mm") +
                            ", Amount :  " +
                            value.value / Math.pow(10, selectedToken?.decimal || 1) +
                            " " +
                            selectedToken?.metadata.symbol +
                            ", Percent :  " +
                            (value.value / Number(selectedToken?.supply.value.amount) || 1) * 100 +
                            "%"
                          }
                        />
                      </ListItem>
                      <Divider sx={{ marginTop: "0.5rem", marginBottom: "0.5rem", background: "black" }} />
                    </>
                  );
                })}
              </List>
            </>
          )} */}
          {selectedToken && (
            <Stack direction={"column"} justifyContent={"space-around"} spacing={2}>
              {sections.map((section: Section, index: number) => (
                <Stack direction={"row"} spacing={2} key={index}>
                  <Grid item display={"flex"} alignContent={"center"}>
                    {index > sections.length - 2 ? (
                      <IconButton onClick={addInput} disabled={disable}>
                        <AddIcon></AddIcon>
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => removeInput(index)} disabled={section.isOldSection}>
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Grid>
                  <CustomInput
                    label="Section Name"
                    name="sectionName"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => sectionSetter(e, index, "name")}
                    placeholder="Section Name"
                    type="text"
                    disable={section.isOldSection}
                    value={section.name}
                  ></CustomInput>
                  <CustomInput
                    label="%"
                    name="percent"
                    value={section.percent}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => sectionSetter(e, index, "percent")}
                    disable={section.isOldSection}
                    type="text"
                    placeholder={"percent"}
                  ></CustomInput>
                  <CustomInput
                    label="Amount"
                    placeholder="Amount"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => sectionSetter(e, index, "amount")}
                    disable={section.isOldSection}
                    type="text"
                    value={section.amount}
                    name={"amount"}
                  />

                  <Grid item display={"flex"} alignContent={"center"}>
                    <Button
                      variant="contained"
                      disabled={section.isOldSection || section.name === "" || limits!.availableBalance < 0}
                      onClick={() => {
                        navigate("/create-vesting/" + selectedToken.hex + "/" + section.name + "/" + section.amount);
                      }}
                    >
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
