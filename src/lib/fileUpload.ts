import { db } from './firebase';
import { doc, writeBatch, collection, getDocs, getDoc, setDoc } from 'firebase/firestore';

export async function uploadFileToFirestore(userUid: string, file: File, collectionName: string): Promise<string> {
  console.log(`Starting file upload: ${file.name} (${file.size} bytes)`);
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const CHUNK_SIZE = 500000; // 500KB chunks to avoid overloading Firestore
  const numChunks = Math.ceil(base64Data.length / CHUNK_SIZE);
  const fileId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  console.log(`Uploading ${numChunks} chunks to user_files/${userUid}/${collectionName}/${fileId}...`);
  
  const withTimeout = <T>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(message)), ms);
      promise.then((val) => { clearTimeout(timer); resolve(val); })
             .catch((err) => { clearTimeout(timer); reject(err); });
    });
  };
  
  const fileRef = doc(db, 'user_files', userUid, collectionName, fileId);
  await withTimeout(
    setDoc(fileRef, {
      fileName: file.name,
      updatedAt: new Date().toISOString(),
      chunked: true,
      totalChunks: numChunks
    }),
    15000,
    "Timeout while initializing file upload."
  );

  // Upload sequentially to prevent Firebase SDK from dropping connection on massive concurrent payloads
  for (let i = 0; i < numChunks; i++) {
    const chunk = base64Data.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const chunkRef = doc(db, 'user_files', userUid, collectionName, fileId, 'chunks', i.toString());
    await withTimeout(
      setDoc(chunkRef, { dataUrl: chunk }),
      15000,
      `Timeout while uploading file chunk ${i + 1} of ${numChunks}.`
    );
  }
  
  console.log(`Successfully uploaded ${file.name}`);
  
  return `firestore://user_files/${userUid}/${collectionName}/${fileId}`;
}

export async function getFileFromFirestore(fileRefUrl: string): Promise<{ dataUrl: string, fileName: string } | null> {
  if (!fileRefUrl.startsWith('firestore://')) return null;
  const path = fileRefUrl.replace('firestore://', '');
  const [_, userUid, collectionName, fileId] = path.split('/'); // Actually user_files/uid/coll/id -> 4 parts
  
  // path is like user_files/uid/collection/fileId
  // let's parse it correctly
  const parts = path.split('/');
  if (parts.length < 4) return null;
  
  const docRef = doc(db, parts[0], parts[1], parts[2], parts[3]);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  if (data.chunked) {
    const chunksRef = collection(db, parts[0], parts[1], parts[2], parts[3], 'chunks');
    const chunksSnap = await getDocs(chunksRef);
    if (!chunksSnap.empty) {
      const sortedChunks = chunksSnap.docs
        .map(d => ({ index: Number(d.id), dataUrl: d.data().dataUrl }))
        .sort((a, b) => a.index - b.index);
      return {
        dataUrl: sortedChunks.map(c => c.dataUrl).join(''),
        fileName: data.fileName
      };
    }
  }
  return null;
}
