import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

const itemsCollection = collection(db, "items");

/**
 * Fetches all items from the Firestore 'items' collection.
 * Ordered by date descending so newest items appear first.
 */
export const fetchItems = async () => {
  try {
    const q = query(itemsCollection, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    // Map the Firestore documents to a plain JS array
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching items from Firestore:", error);
    throw error;
  }
};

/**
 * Adds a new item document to the Firestore 'items' collection.
 * @param {Object} itemData - The item details (title, category, status, etc.)
 */
export const addItem = async (itemData) => {
  try {
    const docRef = await addDoc(itemsCollection, itemData);
    return { id: docRef.id, ...itemData };
  } catch (error) {
    console.error("Error adding item to Firestore:", error);
    throw error;
  }
};

/**
 * Updates a specific item's status in Firestore.
 * Used for marking items as 'resolved'.
 * @param {string} itemId - The Firestore document ID.
 * @param {Object} updates - The fields to update (e.g., { status: 'resolved' }).
 */
export const updateItemStatus = async (itemId, updates) => {
  try {
    const itemDoc = doc(db, "items", itemId);
    await updateDoc(itemDoc, updates);
  } catch (error) {
    console.error("Error updating item status in Firestore:", error);
    throw error;
  }
};
