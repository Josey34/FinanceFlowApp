import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Goal } from '../types';

function goalsPath(userId: string) {
  return collection(db, 'users', userId, 'goals');
}

export async function addGoal(userId: string, data: Omit<Goal, 'id'>): Promise<string> {
  const ref = await addDoc(goalsPath(userId), data);
  return ref.id;
}

export async function updateGoal(userId: string, goalId: string, data: Partial<Goal>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'goals', goalId), data);
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
}

export function subscribeToGoals(
  userId: string,
  callback: (goals: Goal[]) => void,
): Unsubscribe {
  return onSnapshot(goalsPath(userId), (snap) => {
    const goals = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Goal));
    callback(goals);
  });
}
