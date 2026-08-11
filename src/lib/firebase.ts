import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const configModules = (import.meta as any).glob('../../firebase-applet-config.json', { eager: true });
const appletConfigModule = Object.values(configModules)[0] as any;
const appletConfig = (appletConfigModule?.default || appletConfigModule || {}) as Record<string, string>;

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: (metaEnv.VITE_FIREBASE_API_KEY as string) || appletConfig.apiKey || '',
  authDomain: (metaEnv.VITE_FIREBASE_AUTH_DOMAIN as string) || appletConfig.authDomain || '',
  projectId: (metaEnv.VITE_FIREBASE_PROJECT_ID as string) || appletConfig.projectId || '',
  storageBucket: (metaEnv.VITE_FIREBASE_STORAGE_BUCKET as string) || appletConfig.storageBucket || '',
  messagingSenderId: (metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || appletConfig.messagingSenderId || '',
  appId: (metaEnv.VITE_FIREBASE_APP_ID as string) || appletConfig.appId || '',
  firestoreDatabaseId: (metaEnv.VITE_FIREBASE_DATABASE_ID as string) || appletConfig.firestoreDatabaseId || ''
};

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
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
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
