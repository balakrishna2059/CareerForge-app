import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
});

const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    console.log("Attempting write to db: " + config.firestoreDatabaseId);
    await setDoc(doc(db, 'test_collection', 'test_doc'), { test: true });
    console.log("Write succeeded!");
  } catch (e) {
    console.error("Write failed:", e);
  }
  process.exit();
}
test();
