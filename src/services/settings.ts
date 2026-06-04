import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { UserSettings } from '../types';

type SyncableSettings = Omit<UserSettings, 'selectedMonth'>;

function prefDoc(userId: string) {
  return doc(db, 'users', userId, 'settings', 'preferences');
}

export async function saveSettings(userId: string, prefs: Partial<SyncableSettings>): Promise<void> {
  await setDoc(prefDoc(userId), prefs, { merge: true });
}

export function subscribeToSettings(
  userId: string,
  callback: (prefs: Partial<SyncableSettings>, exists: boolean) => void,
): Unsubscribe {
  return onSnapshot(prefDoc(userId), (snap) => {
    callback(snap.exists() ? snap.data() : {}, snap.exists());
  });
}
