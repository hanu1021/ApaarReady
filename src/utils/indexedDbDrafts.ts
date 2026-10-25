import { StudentDraftData } from '../context/AppContext';

export interface OfflineStoredDraft {
  draftId: string;
  updatedAt: string;
  step: number;
  // Strictly non-sensitive subset of StudentDraftData
  nonSensitiveData: Omit<
    StudentDraftData,
    'existingApaarId' | 'aadhaarAvailabilityInput' | 'aadhaarOptional'
  >;
  requiresSensitiveReentry: boolean;
}

const DB_NAME = 'apaar_ready_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'student_drafts';

function openDraftsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'draftId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Failed to open IndexedDB for offline drafts.'));
  });
}

// Sanitizes a draft so full Aadhaar, PEN, or APAAR numbers are NEVER stored in IndexedDB
export function sanitizeDraftForLocalDevice(
  draft: StudentDraftData,
  draftId: string,
  step: number
): OfflineStoredDraft {
  const {
    existingApaarId,
    aadhaarAvailabilityInput,
    aadhaarOptional,
    ...nonSensitiveData
  } = draft;

  const requiresSensitiveReentry =
    draft.hasExistingApaar === 'yes' || Boolean(existingApaarId || aadhaarOptional);

  return {
    draftId,
    updatedAt: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    step,
    nonSensitiveData,
    requiresSensitiveReentry,
  };
}

export async function saveOfflineDraftToIdb(
  draft: StudentDraftData,
  draftId: string,
  step: number
): Promise<OfflineStoredDraft> {
  const sanitized = sanitizeDraftForLocalDevice(draft, draftId, step);
  const db = await openDraftsDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(sanitized);

    req.onsuccess = () => resolve(sanitized);
    req.onerror = () =>
      reject(req.error || new Error('Failed to write sanitized draft to IndexedDB.'));
    tx.oncomplete = () => db.close();
  });
}

export async function getAllOfflineDraftsFromIdb(): Promise<OfflineStoredDraft[]> {
  const db = await openDraftsDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const list = (req.result as OfflineStoredDraft[]) || [];
      resolve(list);
    };
    req.onerror = () =>
      reject(req.error || new Error('Failed to read drafts from IndexedDB.'));
    tx.oncomplete = () => db.close();
  });
}

export async function deleteOfflineDraftFromIdb(draftId: string): Promise<void> {
  const db = await openDraftsDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(draftId);

    req.onsuccess = () => resolve();
    req.onerror = () =>
      reject(req.error || new Error('Failed to delete draft from IndexedDB.'));
    tx.oncomplete = () => db.close();
  });
}

export async function clearAllOfflineDraftsFromIdb(): Promise<void> {
  const db = await openDraftsDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () =>
      reject(req.error || new Error('Failed to clear drafts from IndexedDB.'));
    tx.oncomplete = () => db.close();
  });
}
