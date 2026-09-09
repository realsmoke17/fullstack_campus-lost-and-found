import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  increment,
  limit,
  startAfter
} from "firebase/firestore";

const itemsCollection = collection(db, "items");

export const getBoardStats = async () => {
  try {
    const statsDoc = await getDoc(doc(db, "metadata", "boardStats"));
    if (statsDoc.exists()) {
      return statsDoc.data();
    }
    return { totalItems: 0, lostCount: 0, foundCount: 0 };
  } catch (error) {
    console.error("Error fetching board stats:", error);
    return { totalItems: 0, lostCount: 0, foundCount: 0 };
  }
};

const updateBoardStats = async (status, change) => {
  try {
    const statsRef = doc(db, "metadata", "boardStats");
    await updateDoc(statsRef, {
      totalItems: increment(change),
      [`${status}Count`]: increment(change),
    });
  } catch (error) {
    console.error("Error updating board stats:", error);
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const fetchItems = async () => {
  try {
    const q = query(itemsCollection, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching items from Firestore:", error);
    throw error;
  }
};

export const subscribeToItems = (onUpdate, onError) => {
  const q = query(itemsCollection, orderBy("date", "desc"), limit(100));

  return onSnapshot(q,
    (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(items);
    },
    (error) => {
      console.error("Error in Firestore subscription:", error);
      if (onError) onError(error);
    }
  );
};

export const addItem = async (itemData, userProfile) => {
  try {
    const newItemData = {
      ...itemData,
      postedByUid: userProfile.id,
      postedByUsername: userProfile.username,
      postedByStudentNumber: userProfile.studentNumber,
    };
    const docRef = await addDoc(itemsCollection, newItemData);
    await updateBoardStats(itemData.status, 1);
    return { id: docRef.id, ...newItemData };
  } catch (error) {
    console.error("Error adding item to Firestore:", error);
    throw error;
  }
};

export const updateItemStatus = async (itemId, updates) => {
  try {
    const itemDoc = doc(db, "items", itemId);
    const currentDoc = await getDoc(itemDoc);

    if (currentDoc.exists() && updates.status === 'resolved') {
      const oldStatus = currentDoc.data().status;
      if (oldStatus !== 'resolved') {
        await updateBoardStats(oldStatus, -1);
      }
    }

    await updateDoc(itemDoc, updates);
  } catch (error) {
    console.error("Error updating item status in Firestore:", error);
    throw error;
  }
};

export const fetchItemsPage = async (lastDoc = null, pageSize = 20) => {
  try {
    let q;
    if (lastDoc) {
      q = query(itemsCollection, orderBy("date", "desc"), startAfter(lastDoc), limit(pageSize));
    } else {
      q = query(itemsCollection, orderBy("date", "desc"), limit(pageSize));
    }
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    return { items, lastVisible, hasMore: querySnapshot.docs.length === pageSize };
  } catch (error) {
    console.error("Error fetching paginated items:", error);
    throw error;
  }
};
