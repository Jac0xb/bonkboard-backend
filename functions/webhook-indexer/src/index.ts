import {Request, Response} from '@google-cloud/functions-framework';
import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import {firestore} from 'firebase-admin';
import {getFirestore} from 'firebase-admin/firestore';
import {app} from './firebase';
import {BONK_BOARD_IDL} from './IDL';
import {DrawInstructionDecoded, TransactionResponseJson} from './types';
import {BB_CODER, BB_PROGRAM_ID, CONNECTION, getAccountKey} from './utils';

import './env';

export async function handleWebhookIndexer(req: Request, res: Response) {
  const txResponses: TransactionResponseJson[] = req.body;

  for (const txResponse of txResponses) {
    const signature = txResponse.transaction.signatures[0];
    const slot = txResponse.slot;
    const blocktime = txResponse.blockTime;

    if (txResponse.meta && txResponse.meta.err !== null) {
      continue;
    }

    console.log(`Processing tx: ${signature}`);

    const accountKeys = txResponse.transaction.message.accountKeys;
    const instructions = txResponse.transaction.message.instructions;

    for (const ix of instructions) {
      const ixProgram = accountKeys[ix.programIdIndex];

      if (ixProgram !== BB_PROGRAM_ID.toString()) {
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

        let lastSeenSlot = 0;
        let encodedBoardState: string | undefined = undefined;
        while (lastSeenSlot < slot) {
          const result = await CONNECTION.getAccountInfoAndContext(
            boardAccount,
            'confirmed'
          );

          encodedBoardState = bs58.encode(result.value!.data);
          lastSeenSlot = result.context.slot;

          if (lastSeenSlot >= slot) {
            break;
          } else {
            await new Promise(resolve => setTimeout(resolve, 250));
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
            `User: ${user}, Pixel position: ${pixel.coord.x}, f${pixel.coord.y}, Pixel color: ${pixel.color.r} ${pixel.color.g} ${pixel.color.b}`
          );
        }

        await Promise.all([
          activitiesRef.set({
            slot: slot,
            signature: signature,
            timestamp: blocktime,
            user: user.toString(),
            activities: drawIx.pixels.map(pixel => ({
              x: pixel.coord.x,
              y: pixel.coord.y,
              rgb: `rgb(${pixel.color.r}, ${pixel.color.g}, ${pixel.color.b})`,
            })),
          }),
          userRef.set(
            {
              lastUpdatedSlot: slot,
              lastUpdatedSignature: signature,
              lastUpdated: blocktime,
              pixelsPlaced: firestore.FieldValue.increment(numOfPixelsPlaced),
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
            lastUpdatedSlot: slot,
            lastUpdatedSignature: signature,
            lastUpdated: blocktime,
            boardState: encodedBoardState,
          }),
        ]);
      }
    }
  }

  res.send('OK');
}
