import { AccountLayout, TOKEN_PROGRAM_ID, createMint, getAccount, getMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

export const mintInit = async (connection: Connection, payer: Keypair) => {
  const mint = await createMint(
    connection,
    payer, // Account that will control the minting
    payer.publicKey, // Account that will control the freezing of the token
    null,
    9 // We are using 9 to match the CLI decimal default exactly // for nft = 0
  );

  console.log("1", mint.toBase58());

  const mintInfo = await getMint(connection, mint);

  console.log("2", mintInfo.supply);

  const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);

  console.log("3", tokenAccount.address.toBase58());

  const tokenAccountInfo = await getAccount(connection, tokenAccount.address);

  console.log("4", tokenAccountInfo.amount);

  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    100000000000 // because decimals for the mint are set to 9  // for nft = 1
  );

  const mintInfo2 = await getMint(connection, mint);

  console.log("5", mintInfo2.supply);
  // 100

  const tokenAccountInfo2 = await getAccount(connection, tokenAccount.address);

  console.log("6", tokenAccountInfo2.amount);

  return mint.toBase58();
  // await transfer(connection, payer, tokenAccount.address, new PublicKey("2vnr3zoMbWaKE5xpskTgmufH4aT5NQiikji9ngqGcxTe"), payer.publicKey, 50);
  // 100
};

export const getTokensWithAccount = async (connection: Connection, payer: Keypair) => {
  const tokenAccounts = await connection.getTokenAccountsByOwner(payer.publicKey, {
    programId: TOKEN_PROGRAM_ID,
  });

  console.log("Token                                         Balance");
  console.log("------------------------------------------------------------");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokenAccounts.value.forEach((tokenAccount: { account: { data: any } }) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    console.log(`${new PublicKey(accountData.mint)}   ${accountData.amount}`);
  });
};
