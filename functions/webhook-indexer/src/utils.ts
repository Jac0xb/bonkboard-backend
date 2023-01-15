import {BorshCoder, Idl} from '@project-serum/anchor';
import {Connection, PublicKey} from '@solana/web3.js';
import {BONK_BOARD_IDL} from './IDL';

export const BB_CODER = new BorshCoder(BONK_BOARD_IDL);
export const CONNECTION = new Connection(
  process.env.SOLANA_RPC ?? 'https://solana-mainnet.rpc.extrnode.com'
);
export const BB_PROGRAM_ID = new PublicKey(
  'bbggT3MZKdJ2cgHQpfSZJFvKHrvAm3NHSqxHq2zoe7A'
);

export function getAccountKey(
  idl: Idl,
  accountName: string,
  ixName: string,
  ixAccountKeys: number[],
  txAccountKeys: (PublicKey | string)[]
): PublicKey {
  for (let i = 0; i < idl.instructions.length; i++) {
    const idlIx = idl.instructions[i];

    if (idlIx.name === ixName) {
      const accountIndex = [...idlIx.accounts].findIndex(
        a => a.name === accountName
      );

      if (accountIndex >= 0) {
        return new PublicKey(txAccountKeys[ixAccountKeys[accountIndex]]);
      }
    }
  }

  throw new Error(`Account not found ${accountName}`);
}
