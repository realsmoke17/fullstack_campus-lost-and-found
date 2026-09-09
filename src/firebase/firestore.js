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
  increment
} from "firebase/firestore";

const itemsCollection = collection(db, "items");

/**
 * Fetches the board aggregate statistics for the public teaser.
 * Reads from a dedicated metadata document to avoid scanning all items.
 * @returns {Promise<Object>} - { totalItems, lostCount, foundCount }
 */
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

/**
 * Internal helper to update the aggregate board statistics.
 * @param {string} status - The status of the item ('lost' or 'found').
 * @param {number} change - 1 for addition, -1 for removal.
 */
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

/**
 * Fetches the profile of a student user from the 'users' collection.
 * @param {string} uid - The Firebase Auth UID of the user.
 * @returns {Promise<Object|null>} - The user profile or null if not found.
 */
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
 * Subscribes to real-time updates from the Firestore 'items' collection.
 * @param {Function} onUpdate - Callback function called whenever data changes.
 * @param {Function} onError - Callback function called when an error occurs.
 * @returns {Function} Unsubscribe function to stop the listener.
 */
export const subscribeToItems = (onUpdate, onError) => {
  const q = query(itemsCollection, orderBy("date", "desc"));

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

/**
 * Adds a new item document to the Firestore 'items' collection.
 * Includes the poster's UID and username for ownership tracking.
 * @param {Object} itemData - The item details (title, category, status, etc.)
 * @param {Object} userProfile - The profile of the user posting the item.
 */
export const addItem = async (itemData, userProfile) => {
  try {
    const newItemData = {
      ...itemData,
      postedByUid: userProfile.id,
      postedByUsername: userProfile.username,
    };
    const docRef = await addDoc(itemsCollection, newItemData);

    // Update aggregate stats
    await updateBoardStats(itemData.status, 1);

    return { id: docRef.id, ...newItemData };
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
    const currentDoc = await getDoc(itemDoc);

    if (currentDoc.exists() && updates.status === 'resolved') {
      const oldStatus = currentDoc.data().status;
      if (oldStatus !== 'resolved') {
        // Decrement stats when item is resolved
        await updateBoardStats(oldStatus, -1);
      }
    }

    await updateDoc(itemDoc, updates);
  } catch (error) {
    console.error("Error updating item status in Firestore:", error);
    throw error;
  }
};
