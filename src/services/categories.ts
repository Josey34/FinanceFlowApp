import { mapCategoryIcon } from "@/utils/icon";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { Category } from "../types";
import { db } from "./firebase";

function catPath(userId: string) {
  return collection(db, "users", userId, "categories");
}

export async function addCategory(
  userId: string,
  data: Omit<Category, "id" | "spent">,
): Promise<string> {
  const ref = await addDoc(catPath(userId), { ...data, spent: 0 });
  return ref.id;
}

export async function updateCategory(
  userId: string,
  catId: string,
  data: Partial<Category>,
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "categories", catId), data);
}

export async function seedDefaultCategories(
  userId: string,
  categories: Category[],
): Promise<void> {
  for (const cat of categories) {
    await setDoc(doc(db, "users", userId, "categories", cat.id), cat);
  }
}

export function subscribeToCategories(
  userId: string,
  callback: (cats: Category[]) => void,
): Unsubscribe {
  return onSnapshot(catPath(userId), (snap) => {
    const cats = snap.docs.map((d) => {
      const data = d.data() as Category;
      return { ...data, id: d.id, icon: mapCategoryIcon(data.icon) };
    });
    callback(cats);
  });
}
