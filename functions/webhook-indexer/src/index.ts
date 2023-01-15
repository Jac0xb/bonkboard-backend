import {Request, Response} from '@google-cloud/functions-framework';
import {BorshCoder} from '@project-serum/anchor';
import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import {Connection, PublicKey} from '@solana/web3.js';
import {firestore} from 'firebase-admin';
import {getFirestore} from 'firebase-admin/firestore';
import {app} from './firebase';
import {BONK_BOARD_IDL} from './IDL';
import {DrawInstructionDecoded, TransactionResponseJson} from './types';
import './env';
import {BB_CODER, BB_PROGRAM_ID, CONNECTION, getAccountKey} from './utils';

export async function handleWebhookIndexer(req: Request, res: Response) {
  const txs: TransactionResponseJson[] = req.body;

  console.log(JSON.stringify(req.rawHeaders));

  for (const tx of txs) {
    const signature = tx.transaction.signatures[0];
    console.log(`Processing tx: ${signature}`);

    if (tx.meta && tx.meta.err !== null) {
      continue;
    }

    const accountKeys = tx.transaction.message.accountKeys;

    for (const ix of tx.transaction.message.instructions) {
      const ixProgram = accountKeys[ix.programIdIndex];

      if (ixProgram !== BB_PROGRAM_ID.toString()) {
        continue;
      }

      if (tx.meta?.err) {
        continue;
      }

      const decodedIx = BB_CODER.instruction.decode(bs58.decode(ix.data));

      if (!decodedIx) {
        console.log(`Failed to decode instruction for signature ${signature}`);
        continue;
      }

      if (decodedIx.name === 'draw') {
        const drawIx = decodedIx.data as DrawInstructionDecoded;

        const user = getAccountKey(
          BONK_BOARD_IDL,
          'payer',
          'draw',
          ix.accounts,
          accountKeys
        );

        const boardAccount = getAccountKey(
          BONK_BOARD_IDL,
          'boardAccount',
          'draw',
          ix.accounts,
          accountKeys
        );

        let lastSlot = 0;
        let encodedBoardState: string | undefined = undefined;
        while (lastSlot < tx.slot) {
          const result = await CONNECTION.getAccountInfoAndContext(
            boardAccount,
            'confirmed'
          );

          encodedBoardState = bs58.encode(result.value!.data);
          lastSlot = result.context.slot;

          if (lastSlot >= tx.slot) {
            break;
          } else {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        const fs = getFirestore(app);
        const userRef = fs.collection('users').doc(user.toString());
        const statsRef = fs.collection('stats').doc('mainnet-beta');
        const activitiesRef = fs.collection('activity').doc(signature);
        const boardRef = fs.collection('board').doc('mainnet-beta');

        const numOfPixelsPlaced = drawIx.pixels.length;
        const bonkBurned = 0;
        const bonkPaid = drawIx.pixels.length * 10_000;

        for (const pixel of drawIx.pixels) {
          console.log(
            `User: ${user}, Pixel position: ${pixel.coord.x}, ${pixel.coord.y}, Pixel color: ${pixel.color.r} ${pixel.color.g} ${pixel.color.b}`
          );
        }

        await Promise.all([
          activitiesRef.set({
            slot: tx.slot,
            signature: signature,
            timestamp: tx.blockTime,
            user: user.toString(),
            activities: drawIx.pixels.map(pixel => ({
              x: pixel.coord.x,
              y: pixel.coord.y,
              rgb: `rgb(${pixel.color.r}, ${pixel.color.g}, ${pixel.color.b})`,
            })),
          }),
          userRef.set(
            {
              lastUpdatedSlot: tx.slot,
              lastUpdatedSignature: signature,
              lastUpdated: tx.blockTime,
              pixelsPlaced: firestore.FieldValue.increment(1),
              bonkBurned: firestore.FieldValue.increment(bonkBurned),
              bonkPaid: firestore.FieldValue.increment(bonkPaid),
            },
            {merge: true}
          ),
          statsRef.set(
            {
              pixelsPlaced: firestore.FieldValue.increment(numOfPixelsPlaced),
              bonkBurned: firestore.FieldValue.increment(bonkBurned),
              bonkPaid: firestore.FieldValue.increment(bonkPaid),
            },
            {merge: true}
          ),
          boardRef.set({
            lastUpdatedSlot: tx.slot,
            lastUpdatedSignature: signature,
            lastUpdated: tx.blockTime,
            boardState: encodedBoardState,
          }),
        ]);
      }
    }
  }

  res.send('OK');
}
