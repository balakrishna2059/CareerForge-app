import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, QueryConstraint } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

export function useFirestoreCrud<T extends { id?: string }>(
  collectionName: string, 
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc'
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const constraints: QueryConstraint[] = [where("userId", "==", user.uid)];
      if (orderByField) {
        constraints.push(orderBy(orderByField, orderDirection));
      }
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      setData(fetchedData);
    } catch (err: any) {
      console.error(`Error fetching ${collectionName}:`, err);
      // Don't crash if index is building, just fallback to un-ordered query temporarily
      if (err.message?.includes('index') && orderByField) {
         try {
           const fallbackQ = query(collection(db, collectionName), where("userId", "==", user.uid));
           const snap = await getDocs(fallbackQ);
           setData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as T)));
         } catch (fallbackErr: any) {
           setError(fallbackErr.message);
         }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, collectionName]);

  const add = async (item: Omit<T, 'id'>) => {
    if (!user) throw new Error("Must be logged in to add data");
    
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      const newItem = { id: docRef.id, ...item, userId: user.uid } as unknown as T;
      setData(prev => [newItem, ...prev]);
      return docRef.id;
    } catch (err: any) {
      console.error(`Error adding to ${collectionName}:`, err);
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    if (!user) throw new Error("Must be logged in to update data");
    
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    } catch (err: any) {
      console.error(`Error updating ${collectionName}:`, err);
      throw err;
    }
  };

  const remove = async (id: string) => {
    if (!user) throw new Error("Must be logged in to delete data");
    
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      console.error(`Error deleting from ${collectionName}:`, err);
      throw err;
    }
  };

  return { data, loading, error, add, update, remove, refresh: fetchData };
}
