import { Connection, PublicKey } from "@solana/web3.js";
import { ProgramAccount, Realm, getRealms, getTokenOwnerRecordsByOwner } from "@solana/spl-governance";

const GOVERNANCE_PROGRAM_ID = new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw");

export class DAO {
  connection: Connection;
  publicKey: PublicKey;

  constructor(connection: Connection, publicKey: PublicKey) {
    this.connection = connection;
    this.publicKey = publicKey;
  }

  private getAllDaos = async (): Promise<ProgramAccount<Realm>[]> => {
    return getRealms(this.connection, [GOVERNANCE_PROGRAM_ID]);
  };

  private getMyDaos = async (): Promise<{
    myDaos: ProgramAccount<Realm>[];
    allDaos: ProgramAccount<Realm>[];
  }> => {
    const allDaos = await this.getAllDaos();

    const myOwnDaos = await getTokenOwnerRecordsByOwner(this.connection, GOVERNANCE_PROGRAM_ID, this.publicKey);

    const myDaoPubkeys = myOwnDaos.map((md) => md.account.realm.toBase58());

    const myDaos: ProgramAccount<Realm>[] = [];

    allDaos.forEach((ads) => {
      if (myDaoPubkeys.includes(ads.pubkey.toBase58())) {
        myDaos.push(ads);
      }
    });

    return { myDaos, allDaos };
  };

  fetchDaos = () => {
    return this.getMyDaos();
  };
}
