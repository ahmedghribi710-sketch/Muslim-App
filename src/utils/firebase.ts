import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SchoolClass, HomeworkItem, UserSettings, UserStats } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handler specified by firebase-integration-rpc
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using LocalStorage cache.');
    }
  }
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Cloud synchronization functions
export async function syncUserDataToCloud(
  userId: string,
  settings: UserSettings,
  stats: UserStats,
  classes: SchoolClass[],
  homework: HomeworkItem[]
) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        userId,
        studentName: settings.studentName,
        selectedCity: settings.selectedCity,
        wakeUpTime: settings.wakeUpTime,
        targetBedTime: settings.targetBedTime,
        commuteMinutes: settings.commuteMinutes,
        xp: stats.xp,
        level: stats.level,
        streakDays: stats.streakDays,
      },
      { merge: true }
    );

    // Sync classes batch
    const batch = writeBatch(db);
    classes.forEach((c) => {
      const cRef = doc(db, 'users', userId, 'classes', c.id);
      batch.set(cRef, { ...c, userId });
    });

    homework.forEach((h) => {
      const hRef = doc(db, 'users', userId, 'homework', h.id);
      batch.set(hRef, { ...h, userId });
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

export async function loadUserDataFromCloud(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    const classesSnap = await getDocs(collection(db, 'users', userId, 'classes'));
    const classes = classesSnap.docs.map((d) => d.data() as SchoolClass);

    const homeworkSnap = await getDocs(collection(db, 'users', userId, 'homework'));
    const homework = homeworkSnap.docs.map((d) => d.data() as HomeworkItem);

    return {
      profile: userSnap.exists() ? userSnap.data() : null,
      classes: classes.length > 0 ? classes : null,
      homework: homework.length > 0 ? homework : null,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    return null;
  }
}
