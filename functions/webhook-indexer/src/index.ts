import {Request, Response} from '@google-cloud/functions-framework';
import {getFirestore} from 'firebase-admin/firestore';
import {app} from './firebase';

export async function handleWebhookIndexer(req: Request, res: Response) {
  console.log(req.body);
  res.send('Hello World');

  // const fs = getFirestore(app);
  // await fs.runTransaction(async tx => {});
}
