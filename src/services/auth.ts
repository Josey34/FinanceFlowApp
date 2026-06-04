import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from '../store/authStore';

export async function registerUser(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user;
}

export async function loginUser(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
  useAuthStore.getState().signOut();
}

export async function deleteAccount() {
  if (!auth.currentUser) throw new Error('No authenticated user');
  await deleteUser(auth.currentUser);
  useAuthStore.getState().signOut();
}

export function listenToAuthChanges() {
  const { setUser, setLoading } = useAuthStore.getState();
  setLoading(true);
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      setUser({ uid: user.uid, email: user.email, displayName: user.displayName });
    } else {
      setUser(null);
    }
    setLoading(false);
  });
}
