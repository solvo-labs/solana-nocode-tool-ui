/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserTokens } from "../../lib";
import { TokenData, ToolTips } from "../../utils/types";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/Custom/CustomButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { CustomInput } from "../../components/Custom/CustomInput";
import { burnToken, getLargestAccounts, getOrCreateAssociatedTokenAccount } from "../../lib/token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMintToInstruction, createTransferInstruction, getAccount } from "@solana/spl-token";
import toastr from "toastr";
import RegisterTokenForm from "../../components/RegisterTokenForm";
import { RegisterToken, register } from "../../lib/tokenRegister";
import ImageUpload from "../../components/ImageUpload";
import { NFTStorage } from "nft.storage";
// import VestingForm from "../../components/VestingForm";
// import { Durations, Recipient, RecipientFormInput, UnlockSchedule, VestParams, VestParamsData } from "../../lib/models/Vesting";
// import dayjs from "dayjs";
// import { getBN } from "@streamflow/stream";
// import { vestMulti } from "../../lib/vesting";
// import { SignerWalletAdapter } from "@solana/wallet-adapter-base";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "80vw",
    maxWidth: "80vw",
    [theme.breakpoints.down("lg")]: {
      minWidth: "90vw",
      maxWidth: "90vw",
    },
    [theme.breakpoints.down("md")]: {
      maxWidth: "90vw",
      minWidth: "90vw",
    },
    paddingBottom: "1rem",
  },
  cardsContainer: {
    justifyContent: "center",
  },
  card: {
    maxHeight: "240px",
    [theme.breakpoints.up("md")]: {
      minHeight: "240px",
    },
    borderRadius: "16px !important",
  },
  manager: {
    minHeight: "240px",
    borderRadius: "16px !important",
  },
  info: {
    marginTop: "0.25rem",
    marginBottom: "0.25rem",
  },
  copyButton: {
    "& .css-nixcjy-MuiSvgIcon-root": {
      fontSize: "1rem !important",
      padding: "0rem !important",
    },
  },
  tabTitle: {
    [theme.breakpoints.down("md")]: {
      fontSize: "0.7rem !important",
    },
  },
  titleContainer: {
    marginBottom: "2rem",
    [theme.breakpoints.down("md")]: {
      // marginTop: "2rem",
    },
  },
}));

// const recipientDefaultState = {
//   name: "",
//   amount: 0,
//   cliffAmount: 0,
//   recipientAddress: "",
// };

export const TokenDetail = () => {
  const classes = useStyles();
  const params = useParams();
  const navigate = useNavigate();
  const tokenHex = params.id;
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [token, setToken] = useState<TokenData>();
  const [value, setValue] = useState("1");
  const [myAddresses, setMyAddresses] = useState<any[]>([]);
  const [registerData, setRegisterData] = useState<RegisterToken>({
    name: "",
    symbol: "",
  });
  const [copy, setCopy] = useState<ToolTips>({
    hexToolTip: false,
    ownerToolTip: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [registerLoading, setRegiterLoading] = useState<boolean>(false);

  //Transfer
  const [transferData, setTransferData] = useState({
    destinationPubkey: "",
    amount: 0,
  });

  //Mint&Burn
  const [amountToMB, setAmountToMB] = useState<number>(0);
  const [selectedHolder, setSelectedHolder] = useState<any>();

  // Holders
  const [holders, setHolders] = useState<any>([]);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  // Register
  const [file, setFile] = useState<File | undefined>();

  const storeImage = async () => {
    if (file) {
      const storage = new NFTStorage({
        token: import.meta.env.VITE_NFT_STORAGE_API_KEY,
      });

      const fileCid = await storage.storeBlob(new Blob([file]));

      const fileUrl = "https://ipfs.io/ipfs/" + fileCid;

      const obj = {
        image: fileUrl,
      };

      // (5)
      const metadata = new Blob([JSON.stringify(obj)], {
        type: "application/json",
      });
      const metadataCid = await storage.storeBlob(metadata);
      const metadataUrl = "https://ipfs.io/ipfs/" + metadataCid;
      return metadataUrl;
    } else {
      return "";
    }
  };
  // //vest
  // const [vestParams, setVestParams] = useState<VestParamsData>({
  //   startDate: dayjs().add(1, "h"),
  //   cliff: dayjs().add(3, "day"),
  //   period: 1,
  //   selectedDuration: Durations.DAY,
  //   selectedUnlockSchedule: UnlockSchedule.HOURLY,
  //   automaticWithdraw: true,
  // });

  // const [activateCliff, setActivateCliff] = useState<boolean>(false);
  // const [recipientModal, setRecipientModal] = useState<RecipientModal>({
  //   show: false,
  //   activeTab: "1",
  // });
  // const [recipients, setRecipients] = useState<RecipientFormInput[]>([]);
  // const [recipient, setRecipient] = useState<RecipientFormInput>(recipientDefaultState);

  useEffect(() => {
    const init = async () => {
      if (publicKey && tokenHex) {
        const data = await fetchUserTokens(connection, publicKey, new PublicKey(tokenHex));
        setToken(data[0]);
        setLoading(false);
      }
    };
    init();
    const interval = setInterval(() => {
      init();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey, tokenHex]);

  useEffect(() => {
    const fetch = async () => {
      if (token && publicKey) {
        const getLargest = await getLargestAccounts(connection, new PublicKey(token.hex));
        const myAddress = await connection.getTokenAccountsByOwner(publicKey, {
          mint: new PublicKey(token.hex),
        });
        const myAddressPubkeys = myAddress.value.map((my) => my.pubkey.toBase58());
        setMyAddresses(myAddressPubkeys);
        setHolders(getLargest.value);
      }
    };

    fetch();
  }, [connection, publicKey, token]);

  const handleTooltipOpen = (buttonName: keyof typeof copy, target: any) => {
    setCopy((prevToolTipVisible) => ({
      ...prevToolTipVisible,
      [buttonName]: true,
    }));
    navigator.clipboard.writeText(target);
  };

  const handleTooltipClose = (buttonName: keyof typeof copy) => {
    setCopy({ ...copy, [buttonName]: false });
  };

  const transfer = async () => {
    try {
      if (publicKey && token) {
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const destination = new PublicKey(transferData.destinationPubkey);
        const selectedTokenPubkey = new PublicKey(token.hex);

        const { associatedToken } = await getOrCreateAssociatedTokenAccount(selectedTokenPubkey, publicKey, publicKey, connection);

        const fromAccount = await getAccount(connection, associatedToken);

        const {
          transaction: tx2,
          account: toAccount,
          associatedToken: associatedTokenTo,
        } = await getOrCreateAssociatedTokenAccount(selectedTokenPubkey, publicKey, destination, connection);

        if (tx2) {
          const transactions = new Transaction();

          transactions.add(tx2);
          transactions.add(createTransferInstruction(fromAccount.address, associatedTokenTo, publicKey, transferData.amount * Math.pow(10, token.decimal)));

          const signature = await sendTransaction(transactions, connection, {
            minContextSlot,
          });

          await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
          });

          setTransferData({ destinationPubkey: "", amount: 0 });
          toastr.success("Transfer completed successfully.");
        } else {
          const transaction = new Transaction().add(
            createTransferInstruction(fromAccount.address, toAccount.address, publicKey, transferData.amount * Math.pow(10, token.decimal))
          );

          const signature = await sendTransaction(transaction, connection, {
            minContextSlot,
          });
          await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
          });
          toastr.success("Transfer completed successfully.");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintTransaction = async () => {
    if (publicKey && token && selectedHolder) {
      const ix = new Transaction().add(
        createMintToInstruction(new PublicKey(token.hex), selectedHolder.address, publicKey, amountToMB * Math.pow(10, token.decimal), [], TOKEN_PROGRAM_ID)
      );

      const {
        context: { slot: minContextSlot },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      try {
        const burnTransaction = new Transaction();
        burnTransaction.add(ix);

        const burnSignature = await sendTransaction(burnTransaction, connection, {
          minContextSlot,
          signers: [],
        });
        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: burnSignature,
        });
        toastr.success("Mint completed Successfully");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const burnTransaction = async () => {
    if (publicKey && token && selectedHolder) {
      const ix = await burnToken(publicKey, new PublicKey(token.hex), selectedHolder.address, amountToMB * Math.pow(10, token.decimal));

      const {
        context: { slot: minContextSlot },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      try {
        const burnTransaction = new Transaction();
        burnTransaction.add(ix);

        const burnSignature = await sendTransaction(burnTransaction, connection, {
          minContextSlot,
          signers: [],
        });

        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: burnSignature,
        });

        // setAmountToMB(0);
        // selectedHolder("");
        toastr.success("Burn completed Successfully");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const registerTransaction = async () => {
    setRegiterLoading(true);
    if (publicKey && token) {
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      try {
        const newUri = await storeImage();

        const transaction = register(token?.hex, publicKey, {
          name: registerData.name,
          symbol: registerData.symbol,
          uri: newUri,
        });

        const registertransaction = new Transaction();
        registertransaction.add(transaction);
        const signature = await sendTransaction(registertransaction, connection, { minContextSlot, signers: [] });
        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: signature,
        });

        setRegisterData({ name: "", symbol: "" });
        toastr.success("Token register completed successfully");
        navigate("/token/" + tokenHex);
        setRegiterLoading(false);
      } catch (error) {
        console.log(error);
        setRegiterLoading(false);
      }
    }
  };

  // const startVesting = async () => {
  //   if (wallet && token && recipients.length > 0) {
  //     const amountPer = (vestParams.period * vestParams.selectedDuration) / vestParams.selectedUnlockSchedule;

  //     const params: VestParams = {
  //       startDate: vestParams.startDate.unix(),
  //       cliff: activateCliff ? vestParams.cliff?.unix() : 0,
  //       period: (vestParams.period * vestParams.selectedDuration) / amountPer,
  //       automaticWithdrawal: vestParams.automaticWithdraw,
  //     };

  //     const recipientList: Recipient[] = recipients.map((data) => {
  //       return {
  //         recipient: data.recipientAddress, // Recipient address (base58 string for Solana)
  //         amount: getBN(data.amount, token.decimal), // Deposited amount of tokens (using smallest denomination).
  //         name: data.name, // The stream name or subject.
  //         cliffAmount: getBN(data.cliffAmount, token.decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
  //         amountPerPeriod: getBN(data.amount / amountPer, token.decimal), // Release rate: how many tokens are unlocked per each period.
  //       };
  //     });

  //     const data = await vestMulti(wallet as SignerWalletAdapter, token, params, recipientList);

  //     toastr.success("Contract Deployed Successfully");

  //     console.log(data);

  //     data?.txs.forEach((tx) => {
  //       window.open("https://explorer.solana.com/tx/" + tx + "?cluster=devnet", "_blank");
  //     });

  //     navigate("/vesting-list");
  //   }
  // };

  if (loading || registerLoading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          minWidth: "50vw",
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
    <Grid container className={classes.container} direction={"column"}>
      <Grid container className={classes.titleContainer} justifyContent={"space-between"}>
        <Grid item>
          <Grid container direction={"row"} alignItems={"center"}>
            <Grid item>
              {token?.metadata.uri?.startsWith("https:") ? (
                <Avatar src={token.metadata.uri} sx={{ marginRight: "1rem", width: 56, height: 56 }} />
              ) : (
                <Avatar sx={{ marginRight: "1rem", width: 56, height: 56 }}>{token?.metadata.symbol.slice(0, 2)}</Avatar>
              )}
            </Grid>
            <Grid item>
              <Typography variant="h5">Token Detail</Typography>
            </Grid>
          </Grid>
          {/* <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            > */}
          {/* </div> */}
        </Grid>
        <CustomButton disable={false} label="My Tokens" onClick={() => navigate("/my-tokens")}></CustomButton>
      </Grid>
      <Grid container className={classes.cardsContainer} direction={"row"} spacing={4}>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.info} sx={{ fontWeight: "bold" }} variant="subtitle1" marginBottom={"0.5rem"}>
                Token Summary
              </Typography>

              <Grid container className={classes.info}>
                <Grid container width={"20%"}>
                  <Typography variant="body2">Name:</Typography>
                </Grid>
                <Grid container width={"70%"}>
                  <Typography variant="body2">{token?.metadata.name}</Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.info}>
                <Grid container width={"20%"}>
                  <Typography variant="body2">Symbol:</Typography>
                </Grid>
                <Grid container width={"70%"}>
                  <Typography variant="body2">{token?.metadata.symbol}</Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.info}>
                <Grid container width={"20%"}>
                  <Typography variant="body2">Hex:</Typography>
                </Grid>
                <Grid container width={"80%"} direction={"row"} justifyContent={"space-between"}>
                  <Typography variant="body2">{token?.hex.slice(0, 24) + "..."}</Typography>
                  <Tooltip
                    id="hex"
                    PopperProps={{
                      disablePortal: true,
                    }}
                    open={copy.hexToolTip}
                    title="Copied"
                    onClose={() => handleTooltipClose("hexToolTip")}
                    leaveDelay={1000}
                    placement="left"
                  >
                    <IconButton onClick={() => handleTooltipOpen("hexToolTip", token?.hex)} className={classes.copyButton} sx={{ padding: "0rem" }}>
                      <ContentCopyIcon sx={{ fontSize: "1rem", margin: "0rem" }}></ContentCopyIcon>
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
              <Grid container className={classes.info}>
                <Grid container width={"20%"}>
                  <Typography variant="body2">Decimal:</Typography>
                </Grid>
                <Grid container width={"70%"}>
                  <Typography variant="body2">{token?.decimal}</Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.info}>
                <Grid container width={"20%"}>
                  <Typography variant="body2">Owner:</Typography>
                </Grid>
                <Grid container width={"80%"} justifyContent={"space-between"}>
                  <Typography variant="body2">{token?.owner.slice(0, 24) + "..."}</Typography>
                  <Tooltip
                    id="hex"
                    PopperProps={{
                      disablePortal: true,
                    }}
                    open={copy.ownerToolTip}
                    title="Copied"
                    onClose={() => handleTooltipClose("ownerToolTip")}
                    leaveDelay={1000}
                    placement="left"
                  >
                    <IconButton onClick={() => handleTooltipOpen("ownerToolTip", token?.owner)} className={classes.copyButton} sx={{ padding: "0rem" }}>
                      <ContentCopyIcon sx={{ fontSize: "1rem", margin: "0rem" }}></ContentCopyIcon>
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography sx={{ fontWeight: "bold" }} variant="subtitle1" marginBottom={"0.5rem"} className={classes.info}>
                Market Overview
              </Typography>
              <Grid container className={classes.info}>
                <Grid container width={"40%"}>
                  <Typography variant="body2">Current Supply:</Typography>
                </Grid>
                <Grid container width={"60%"}>
                  <Typography variant="body2">{token?.supply.value.uiAmount}</Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.info}>
                <Grid container width={"40%"}>
                  <Typography variant="body2">Balance:</Typography>
                </Grid>
                <Grid container width={"60%"}>
                  <Typography variant="body2">{token && token?.amount / Math.pow(10, token?.decimal)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid item marginTop={"1rem"} xl={6} lg={6} md={6} sm={12} xs={12} maxWidth={"90vw !important"}>
        <Card className={classes.manager}>
          <CardContent>
            <Box>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList onChange={handleChange} className={classes.tabTitle}>
                    <Tab className={classes.tabTitle} label="Transfer" value="1" />
                    <Tab className={classes.tabTitle} label="Mint & Burn" value="2" />
                    <Tab className={classes.tabTitle} label="Holders" value="3" />
                    {!token?.metadata.isRegistered && <Tab className={classes.tabTitle} label="Register" value="4"></Tab>}
                    <Tab className={classes.tabTitle} label="Vesting" value="5" />
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <Grid item display={"flex"} justifyContent={"center"} marginY={"1rem"}>
                    <Stack spacing={4}>
                      <CustomInput
                        label="Destination Publickey"
                        name="destinationpublickey"
                        onChange={(e: any) =>
                          setTransferData({
                            ...transferData,
                            destinationPubkey: e.target.value,
                          })
                        }
                        placeholder="Destination Publickey"
                        type="text"
                        value={transferData.destinationPubkey}
                      ></CustomInput>
                      <CustomInput
                        label="Amount"
                        name="Amount"
                        onChange={(e: any) =>
                          setTransferData({
                            ...transferData,
                            amount: e.target.value,
                          })
                        }
                        placeholder="Amount"
                        type="text"
                        value={transferData.amount}
                      ></CustomInput>

                      <Grid item gap={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
                        <CustomButton label="Transfer Token" disable={false} onClick={transfer}></CustomButton>
                      </Grid>
                    </Stack>
                  </Grid>
                </TabPanel>
                <TabPanel value="2">
                  <Grid item display={"flex"} justifyContent={"center"} marginY={"1rem"}>
                    <Stack spacing={4}>
                      <Grid item display={"flex"} justifyContent={"center"}>
                        <FormControl fullWidth>
                          <InputLabel id="selectLabel">Select a Holder</InputLabel>
                          <Select
                            value={selectedHolder ? selectedHolder.address.toBase58() : ""}
                            label="Token"
                            onChange={(e: any) => {
                              const currentHolder = holders.find((hf: any) => hf.address.toBase58() === e.target.value);
                              setSelectedHolder(currentHolder);
                            }}
                            id={"custom-select"}
                          >
                            {holders.map((holder: any) => {
                              return (
                                <MenuItem key={holder.address.toBase58()} value={holder.address.toBase58()}>
                                  {myAddresses.includes(holder.address.toBase58()) && "My Account: "} {holder.address.toBase58()}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                      <CustomInput
                        label="Amount"
                        name="Amount"
                        onChange={(e: any) => setAmountToMB(e.target.value)}
                        placeholder="Amount"
                        type="text"
                        value={amountToMB}
                      ></CustomInput>

                      <Grid item gap={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"row"}>
                        <CustomButton label="Burn Token" disable={false} onClick={burnTransaction}></CustomButton>
                        <CustomButton disable={false} label="Mint Token" onClick={mintTransaction}></CustomButton>
                      </Grid>
                    </Stack>
                  </Grid>
                </TabPanel>
                <TabPanel value="3">
                  <TableContainer>
                    <Table component={Paper} sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="left">Address</TableCell>
                          <TableCell align="right">Balance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {holders.map((e: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{e.address.toBase58()}</TableCell>
                            <TableCell align="right">{e.amount / Math.pow(10, e.decimals)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
                <TabPanel value="4">
                  <Grid container display={"flex"} justifyContent={"center"} marginY={"1rem"} direction={"row"}>
                    <Stack spacing={2}>
                      <ImageUpload file={file} setFile={(data) => setFile(data)}></ImageUpload>
                      <RegisterTokenForm
                        disable={false}
                        register={registerTransaction}
                        inputs={registerData}
                        inputOnChange={(data) => {
                          setRegisterData(data);
                        }}
                      ></RegisterTokenForm>
                    </Stack>
                  </Grid>
                </TabPanel>
                {/* <TabPanel value="5">
                  <VestingForm
                    startVesting={startVesting}
                    recipient={recipient}
                    setRecipient={(data) => setRecipient(data)}
                    recipients={recipients}
                    setRecipients={(data) => setRecipients(data)}
                    recipientModal={recipientModal}
                    setRecipientModal={(data) => setRecipientModal(data)}
                    activateCliff={activateCliff}
                    setActiveCliff={() => setActivateCliff(!activateCliff)}
                    inputOnChange={(data) => setVestParams(data)}
                    vestParams={vestParams}
                  ></VestingForm>
                </TabPanel> */}
              </TabContext>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
