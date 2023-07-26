import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MULTISIG_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createInitializeMultisigInstruction,
  getMinimumBalanceForRentExemptMultisig,
} from "@solana/spl-token";
import {
  Connection,
  GetProgramAccountsFilter,
  Keypair,
  PublicKey,
  StakeProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const createMultiSig = async (
  connection: Connection,
  owner: PublicKey,
  threshold: number,
  signers: PublicKey[]
) => {
  const lamports = await getMinimumBalanceForRentExemptMultisig(connection);
  const newAccount = Keypair.generate();

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: newAccount.publicKey,
      space: MULTISIG_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMultisigInstruction(
      newAccount.publicKey,
      signers,
      threshold
    )
  );

  return { transaction, newAccount };
};

export const fetchAllMultisignatureAddress = async (
  connection: Connection,
  owner: PublicKey
) => {
  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165,
    },
    {
      memcmp: {
        offset: 32, //location of our query in the account (bytes)
        bytes: owner.toBase58(), //our search criteria, a base58 encoded string
      },
    },
  ];

  const accounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID,
    { filters }
  );
  return accounts;
};
