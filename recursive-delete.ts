// Run with: deno test -A recursive-delete.ts

import { initializeApp, cert } from 'npm:firebase-admin/app';
import { getFirestore, Firestore } from 'npm:firebase-admin/firestore';
import { test, beforeAll, afterAll } from 'jsr:@std/testing/bdd';

let db: Firestore;

beforeAll(() => {
  initializeApp({ credential: cert('service-account-key.json') });
  db = getFirestore();
});

test('Test recursiveDelete with empty Firestore', async () => {
  const docRef = db.collection('testCollection').doc('testDoc');
  await docRef.set({ field: 'value' });

  console.log('Starting recursiveDelete...');
  await db.recursiveDelete(docRef); // deleting the document appears to leak
  console.log('Finished recursiveDelete.');
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 1 * 1000));  // 10 seconds makes no difference
  await db.terminate();  // omitting this results in 5 leaks detected
  // error: "All onSnapshot() listeners must be unsubscribed, and all BulkWriter instances must be closed before terminating the client. There are 0 active listeners and 1 open BulkWriter instances."
});
