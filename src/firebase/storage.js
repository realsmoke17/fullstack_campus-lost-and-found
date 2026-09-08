import { storage } from "./firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * @param {File} file - The image file selected by the user.
 * @param {string} fileName - A unique name for the file (e.g., timestamp + original name).
 * @returns {Promise<string>} - The download URL of the uploaded image.
 */
export const uploadItemPhoto = async (file, fileName) => {
  try {
    // Create a reference to the file in the 'photos' folder
    const storageRef = ref(storage, `photos/${fileName}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the public download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading photo to Firebase Storage:", error);
    throw error;
  }
};
