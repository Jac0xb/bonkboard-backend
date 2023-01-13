import admin from 'firebase-admin';
import {App} from 'firebase-admin/app';

let app: App;

if (process.env.K_SERVICE) {
  console.log('Running on GCP');
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} else {
  console.log('Running locally');
  const serviceAccount = require('../../../.secrets/firebase-service.json');
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export {app};
