import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { Farm, Cow, CattleEvent, UserAccount } from "../types";

// Firebase Config Interface
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// LocalStorage key for Firebase config
const LOCAL_STORAGE_KEY = "akbeitara_firebase_config";

// Retrieve saved config from LocalStorage or environment variables
export function getSavedFirebaseConfig(): FirebaseConfig | null {
  // 1. Check Local Storage
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved Firebase config:", e);
    }
  }

  // 2. Fallback to Vite Environment variables (if defined by user in their local build)
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: metaEnv.VITE_FIREBASE_API_KEY,
      authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: metaEnv.VITE_FIREBASE_APP_ID || "",
    };
  }

  // 3. Default fallback configuration provided by the user
  return {
    apiKey: "AIzaSyD_RlpfxjGvxUmVv_qDTOVLtqFWb4Tj6Bo",
    authDomain: "myfarm-b6a8a.firebaseapp.com",
    projectId: "myfarm-b6a8a",
    storageBucket: "myfarm-b6a8a.firebasestorage.app",
    messagingSenderId: "778247549432",
    appId: "1:778247549432:web:236d3413c2750aacea660d"
  };
}

// Check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return getSavedFirebaseConfig() !== null;
}

// Save Firebase configuration to LocalStorage
export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
}

// Clear Firebase configuration
export function clearFirebaseConfig(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

// Initialize Firebase App dynamically and safely
export function getFirebaseApp() {
  const config = getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    throw new Error("Firebase is not configured yet.");
  }

  if (getApps().length === 0) {
    return initializeApp(config);
  } else {
    return getApp();
  }
}

// Get Firestore DB Reference safely
export function getFirestoreDB() {
  const app = getFirebaseApp();
  return getFirestore(app);
}

// Helper function to remove undefined fields recursively so Firestore doesn't crash on 'undefined'
function cleanFirestoreData(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreData);
  }
  if (typeof obj === "object") {
    const clean: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          clean[key] = cleanFirestoreData(val);
        }
      }
    }
    return clean;
  }
  return obj;
}

// ==========================================
// Firestore Data Operations & Sync Helpers
// ==========================================

// 1. Load Farms
export async function loadFarmsFromFirestore(): Promise<Farm[] | null> {
  try {
    if (!isFirebaseConfigured()) return null;
    const db = getFirestoreDB();
    const querySnapshot = await getDocs(collection(db, "farms"));
    const loadedFarms: Farm[] = [];
    querySnapshot.forEach((doc) => {
      loadedFarms.push({ id: doc.id, ...doc.data() } as Farm);
    });
    return loadedFarms;
  } catch (error) {
    console.error("Error loading farms from Firestore:", error);
    throw error;
  }
}

// 2. Load Cows
export async function loadCowsFromFirestore(): Promise<Cow[] | null> {
  try {
    if (!isFirebaseConfigured()) return null;
    const db = getFirestoreDB();
    const querySnapshot = await getDocs(collection(db, "cows"));
    const loadedCows: Cow[] = [];
    querySnapshot.forEach((doc) => {
      loadedCows.push({ id: doc.id, ...doc.data() } as Cow);
    });
    return loadedCows;
  } catch (error) {
    console.error("Error loading cows from Firestore:", error);
    throw error;
  }
}

// 3. Load Events
export async function loadEventsFromFirestore(): Promise<CattleEvent[] | null> {
  try {
    if (!isFirebaseConfigured()) return null;
    const db = getFirestoreDB();
    const querySnapshot = await getDocs(collection(db, "events"));
    const loadedEvents: CattleEvent[] = [];
    querySnapshot.forEach((doc) => {
      loadedEvents.push({ id: doc.id, ...doc.data() } as CattleEvent);
    });
    return loadedEvents;
  } catch (error) {
    console.error("Error loading events from Firestore:", error);
    throw error;
  }
}

// 4. Save/Sync Single Farm
export async function saveFarmToFirestore(farm: Farm): Promise<void> {
  try {
    if (!isFirebaseConfigured()) return;
    const db = getFirestoreDB();
    const { id, ...data } = farm;
    await setDoc(doc(db, "farms", id), cleanFirestoreData(data));
  } catch (error) {
    console.error(`Error saving farm ${farm.id} to Firestore:`, error);
    throw error;
  }
}

// 5. Delete Single Farm
export async function deleteFarmFromFirestore(farmId: string): Promise<void> {
  try {
    if (!isFirebaseConfigured()) return;
    const db = getFirestoreDB();
    await deleteDoc(doc(db, "farms", farmId));
  } catch (error) {
    console.error(`Error deleting farm ${farmId} from Firestore:`, error);
    throw error;
  }
}

// 6. Save/Sync Single Cow
export async function saveCowToFirestore(cow: Cow): Promise<void> {
  try {
    if (!isFirebaseConfigured()) return;
    const db = getFirestoreDB();
    const { id, ...data } = cow;
    await setDoc(doc(db, "cows", id), cleanFirestoreData(data));
  } catch (error) {
    console.error(`Error saving cow ${cow.id} to Firestore:`, error);
    throw error;
  }
}

// 7. Delete Single Cow
export async function deleteCowFromFirestore(cowId: string): Promise<void> {
  try {
    if (!isFirebaseConfigured()) return;
    const db = getFirestoreDB();
    await deleteDoc(doc(db, "cows", cowId));
  } catch (error) {
    console.error(`Error deleting cow ${cowId} from Firestore:`, error);
    throw error;
  }
}

// 8. Save/Sync Single Event
export async function saveEventToFirestore(event: CattleEvent): Promise<void> {
  try {
    if (!isFirebaseConfigured()) return;
    const db = getFirestoreDB();
    const { id, ...data } = event;
    await setDoc(doc(db, "events", id), cleanFirestoreData(data));
  } catch (error) {
    console.error(`Error saving event ${event.id} to Firestore:`, error);
    throw error;
  }
}

// 8b. Delete Single Event
export async function deleteEventFromFirestore(eventId: string): Promise<void> {
  try {
    if (!isFirebaseConfigured()) return;
    const db = getFirestoreDB();
    await deleteDoc(doc(db, "events", eventId));
  } catch (error) {
    console.error(`Error deleting event ${eventId} from Firestore:`, error);
    throw error;
  }
}

// 8c. Load Users from Firestore
export async function loadUsersFromFirestore(): Promise<UserAccount[] | null> {
  try {
    if (!isFirebaseConfigured()) return null;
    const db = getFirestoreDB();
    const querySnapshot = await getDocs(collection(db, "users"));
    const loadedUsers: UserAccount[] = [];
    querySnapshot.forEach((doc) => {
      loadedUsers.push({ email: doc.id, ...doc.data() } as UserAccount);
    });
    return loadedUsers;
  } catch (error) {
    console.error("Error loading users from Firestore:", error);
    throw error;
  }
}

// 8d. Save Single User to Firestore
export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    if (!isFirebaseConfigured()) return;
    const db = getFirestoreDB();
    const { email, ...data } = user;
    const cleanEmail = email.trim().toLowerCase();
    await setDoc(doc(db, "users", cleanEmail), cleanFirestoreData(data));
  } catch (error) {
    console.error(`Error saving user ${user.email} to Firestore:`, error);
    throw error;
  }
}

// 8e. Delete Single User from Firestore
export async function deleteUserFromFirestore(email: string): Promise<void> {
  try {
    if (!isFirebaseConfigured()) return;
    const db = getFirestoreDB();
    const cleanEmail = email.trim().toLowerCase();
    await deleteDoc(doc(db, "users", cleanEmail));
  } catch (error) {
    console.error(`Error deleting user ${email} from Firestore:`, error);
    throw error;
  }
}

// 9. Bulk Sync All Local Data to Firestore (Initial Migration)
export async function bulkSyncLocalToFirestore(
  farms: Farm[],
  cows: Cow[],
  events: CattleEvent[],
  users: UserAccount[]
): Promise<void> {
  try {
    if (!isFirebaseConfigured()) return;
    const db = getFirestoreDB();

    // 1. Sync Farms
    for (const farm of farms) {
      const { id, ...data } = farm;
      await setDoc(doc(db, "farms", id), cleanFirestoreData(data));
    }

    // 2. Sync Cows
    for (const cow of cows) {
      const { id, ...data } = cow;
      await setDoc(doc(db, "cows", id), cleanFirestoreData(data));
    }

    // 3. Sync Events
    for (const event of events) {
      const { id, ...data } = event;
      await setDoc(doc(db, "events", id), cleanFirestoreData(data));
    }

    // 4. Sync Users
    for (const user of users) {
      const { email, ...data } = user;
      const cleanEmail = email.trim().toLowerCase();
      await setDoc(doc(db, "users", cleanEmail), cleanFirestoreData(data));
    }
  } catch (error) {
    console.error("Bulk sync to Firestore failed:", error);
    throw error;
  }
}
