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
import {
  SchoolClass,
  HomeworkItem,
  ExamItem,
  QuranProgress,
  UserSettings,
  UserStats,
  DailyChallengeRecord,
} from '../types';
import { notifyFirebaseSynced } from './notifications';

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

/**
 * Recursively removes all undefined fields from an object or array.
 * Firestore strictly rejects documents containing undefined values.
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (obj instanceof Date) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return obj;
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
  homework: HomeworkItem[],
  exams?: ExamItem[],
  quran?: QuranProgress,
  lastModified?: number,
  dailyChallenge?: DailyChallengeRecord | null
): Promise<{ success: boolean; syncedAt: string; error?: string }> {
  const syncedAt = new Date().toISOString();
  const timestamp = lastModified || Date.now();
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      cleanFirestoreData({
        userId,
        settings,
        stats,
        classes: classes || [],
        homework: homework || [],
        exams: exams || [],
        quran: quran || null,
        dailyChallenge: dailyChallenge || null,
        studentName: settings.studentName,
        selectedCity: settings.selectedCity,
        wakeUpTime: settings.wakeUpTime,
        targetBedTime: settings.targetBedTime,
        commuteMinutes: settings.commuteMinutes,
        xp: stats.xp,
        level: stats.level,
        streakDays: stats.streakDays,
        totalStudyMinutes: stats.totalStudyMinutes ?? 0,
        weeklyHistory: stats.weeklyHistory ?? [],
        lastModified: timestamp,
        lastSyncedAt: syncedAt,
      }),
      { merge: true }
    );

    // Sync classes batch for subcollections compatibility
    try {
      const batch = writeBatch(db);
      classes.forEach((c) => {
        const cRef = doc(db, 'users', userId, 'classes', c.id);
        batch.set(cRef, cleanFirestoreData({ ...c, userId }));
      });
      homework.forEach((h) => {
        const hRef = doc(db, 'users', userId, 'homework', h.id);
        batch.set(hRef, cleanFirestoreData({ ...h, userId }));
      });
      await batch.commit();
    } catch (batchErr) {
      console.warn('Batch subcollection sync notice:', batchErr);
    }

    notifyFirebaseSynced();
    return { success: true, syncedAt };
  } catch (error) {
    console.error('syncUserDataToCloud error:', error);
    return { success: false, syncedAt, error: String(error) };
  }
}

export async function loadUserDataFromCloud(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      let classes: SchoolClass[] | null = Array.isArray(data.classes) ? (data.classes as SchoolClass[]) : null;
      let homework: HomeworkItem[] | null = Array.isArray(data.homework) ? (data.homework as HomeworkItem[]) : null;
      const exams: ExamItem[] | null = Array.isArray(data.exams) ? (data.exams as ExamItem[]) : null;
      const quran: QuranProgress | null = (data.quran as QuranProgress) || null;
      const settings: UserSettings | null = (data.settings as UserSettings) || null;
      const stats: UserStats | null = (data.stats as UserStats) || null;
      const dailyChallenge: DailyChallengeRecord | null = (data.dailyChallenge as DailyChallengeRecord) || null;
      const lastModified: number = typeof data.lastModified === 'number' ? data.lastModified : 0;

      // Fallback to subcollections if not present on root doc
      if (!classes) {
        try {
          const classesSnap = await getDocs(collection(db, 'users', userId, 'classes'));
          if (classesSnap.docs.length > 0) {
            classes = classesSnap.docs.map((d) => d.data() as SchoolClass);
          }
        } catch {}
      }

      if (!homework) {
        try {
          const homeworkSnap = await getDocs(collection(db, 'users', userId, 'homework'));
          if (homeworkSnap.docs.length > 0) {
            homework = homeworkSnap.docs.map((d) => d.data() as HomeworkItem);
          }
        } catch {}
      }

      return {
        profile: data,
        settings,
        stats,
        classes,
        homework,
        exams,
        quran,
        dailyChallenge,
        lastModified,
      };
    }
    return null;
  } catch (error) {
    console.warn('loadUserDataFromCloud error:', error);
    return null;
  }
}
