import { BN } from "@project-serum/anchor";
import { MintMaxVoteWeightSource } from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";

export const GOVERNANCE_PROGRAM_ID = new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw");
export const DEFAULT_COMMUNITY_MINT_MAX_VOTE_WEIGHT_SOURCE = MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION;
export const MIN_COMMUNITY_TOKENS_TO_CREATE_WITH_ZERO_SUPPLY = 1000000;
export const DISABLED_VOTER_WEIGHT = new BN("18446744073709551615");
