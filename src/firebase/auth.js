import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  updateProfile,
  applyActionCode
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * Validates if an email is a valid TUT student email.
 * Format: {studentNumber}@tut4life.ac.za where studentNumber is purely numeric.
 * @param {string} email
 * @returns {boolean}
 */
const isValidTUTEmail = (email) => {
  const regex = /^[0-9]+@tut4life\.ac\.za$/i;
  return regex.test(email);
};

/**
 * Sets the authentication persistence to session-only.
 * Users will be logged out when the browser tab is closed.
 */
export const initAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserSessionPersistence);
  } catch (error) {
    console.error("Error setting auth persistence:", error);
  }
};

/**
 * Signs up a new student user.
 * Validates TUT email and username uniqueness, creates auth account,
 * updates Auth profile, sends verification email with custom redirect,
 * and stores the student profile in Firestore.
 * @param {string} email
 * @param {string} password
 * @param {string} username
 * @throws Error if validation fails or Firebase auth fails.
 */
export const signUp = async (email, password, username) => {
  // 1. Validate TUT student email format
  if (!isValidTUTEmail(email)) {
    throw new Error("Please sign up with your TUT4life student email, e.g. 1234567@tut4life.ac.za");
  }

  // 2. Validate username length
  if (!username || username.length < 3 || username.length > 20) {
    throw new Error("Username must be between 3 and 20 characters.");
  }

  const normalizedUsername = username.toLowerCase();

  try {
    // 3. Check if username is already taken
    const usernameRef = doc(db, "usernames", normalizedUsername);
    const usernameSnap = await getDoc(usernameRef);
    if (usernameSnap.exists()) {
      throw new Error("This username is already taken. Please choose another one.");
    }

    // 4. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 5. Sync username to Firebase Auth Profile
    await updateProfile(user, {
      displayName: username,
    });

    // 6. Send verification email with action code settings to return to app
    const actionCodeSettings = {
      url: `${window.location.origin}/verify-complete`,
      handleCodeInApp: true,
    };
    await sendEmailVerification(user, actionCodeSettings);

    // 7. Extract student number (local part of the email)
    const studentNumber = email.split('@')[0];

    // 8. Store student profile in Firestore 'users' collection
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      studentNumber,
      email: email.toLowerCase(),
      createdAt: serverTimestamp(),
    });

    // 9. Reserve the username to prevent duplicates
    await setDoc(doc(db, "usernames", normalizedUsername), {
      uid: user.uid,
      createdAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    console.error("Sign-up error:", error);
    throw error;
  }
};

/**
 * Logs in an existing user.
 * @param {string} email
 * @param {string} password
 */
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Log-in error:", error);
    throw error;
  }
};

/**
 * Logs the current user out.
 */
export const logOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Log-out error:", error);
    throw error;
  }
};

/**
 * Sends a password reset email.
 * @param {string} email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

/**
 * Verifies an email using an action code.
 * @param {string} oobCode - The out-of-band code from the email link.
 */
export const verifyEmailWithCode = async (oobCode) => {
  try {
    await applyActionCode(auth, oobCode);
  } catch (error) {
    console.error("Error verifying email with code:", error);
    throw error;
  }
};

/**
 * Listener for authentication state changes.
 * @param {Function} callback - Function called when auth state changes.
 * @returns {Function} Unsubscribe function.
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
