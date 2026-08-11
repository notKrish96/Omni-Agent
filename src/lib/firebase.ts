import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// AI Studio normally injects firebase-applet-config.json at runtime/build time.
// The standalone Android build does not have that private AI Studio file, so use
// environment values when available and a harmless local fallback otherwise.
// Firebase API keys are client-side identifiers, not server secrets.
// The fallback keeps the UI bootable; Firebase login/sync will remain unavailable
// until real Firebase configuration is supplied.
// @ts-ignore
import appletConfigJson from '../../firebase-applet-config.json';

const appletConfig = (appletConfigJson as Record<string, string>) || {};
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: (metaEnv.VITE_FIREBASE_API_KEY as string) || appletConfig.apiKey || 'AIzaSyDUMMY-OMNIAGENT-LOCAL-KEY-1234567890',
  authDomain: (metaEnv.VITE_FIREBASE_AUTH_DOMAIN as string) || appletConfig.authDomain || 'omni-agent-local.firebaseapp.com',
  projectId: (metaEnv.VITE_FIREBASE_PROJECT_ID as string) || appletConfig.projectId || 'omni-agent-local',
  storageBucket: (metaEnv.VITE_FIREBASE_STORAGE_BUCKET as string) || appletConfig.storageBucket || 'omni-agent-local.firebasestorage.app',
  messagingSenderId: (metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || appletConfig.messagingSenderId || '000000000000',
  appId: (metaEnv.VITE_FIREBASE_APP_ID as string) || appletConfig.appId || '1:000000000000:web:0000000000000000',
  firestoreDatabaseId: (metaEnv.VITE_FIREBASE_DATABASE_ID as string) || appletConfig.firestoreDatabaseId || ''
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Firebase is optional for the standalone APK. Do not prevent the UI from booting.
    console.warn('Firebase sync unavailable in standalone APK:', error);
  }
}
