import { mapCategoryIcon } from "@/utils/icon";
import { create } from "zustand";
import {
  addCategory as fsAdd,
  updateCategory as fsUpdate,
} from "../services/categories";
import { Category } from "../types";

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food & Drinks",
    icon: "restaurant",
    color: "#7C6FFF",
    monthlyLimit: 3000,
    isDefault: true,
    archived: false,
    spent: 0,
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "bag-handle",
    color: "#FF7B54",
    monthlyLimit: 1500,
    isDefault: true,
    archived: false,
    spent: 0,
  },
  {
    id: "health",
    name: "Healthcare",
    icon: "medkit",
    color: "#B4ADFF",
    monthlyLimit: 500,
    isDefault: true,
    archived: false,
    spent: 0,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "film",
    color: "#2DC76D",
    monthlyLimit: 300,
    isDefault: true,
    archived: false,
    spent: 0,
  },
  {
    id: "transport",
    name: "Transport",
    icon: "car",
    color: "#FFD93D",
    monthlyLimit: 400,
    isDefault: true,
    archived: false,
    spent: 0,
  },
  {
    id: "rent",
    name: "Rent",
    icon: "home",
    color: "#FF4B4B",
    monthlyLimit: 2000,
    isDefault: true,
    archived: false,
    spent: 0,
  },
  {
    id: "savings",
    name: "Savings",
    icon: "wallet",
    color: "#00B894",
    monthlyLimit: null,
    isDefault: true,
    archived: false,
    spent: 0,
  },
  {
    id: "income",
    name: "Income",
    icon: "cash",
    color: "#2DC76D",
    monthlyLimit: null,
    isDefault: true,
    archived: false,
    spent: 0,
  },
];

interface CategoryState {
  categories: Category[];
  loading: boolean;
  userId: string | null;
  setUserId: (id: string | null) => void;
  setCategories: (cats: Category[]) => void;
  addCategory: (cat: Category) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  archiveCategory: (id: string) => Promise<void>;
  updateSpent: (id: string, spent: number) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  loading: false,
  userId: null,

  setUserId: (userId) => set({ userId }),

  setCategories: (categories) =>
    set({
      categories: categories.map((c) => ({
        ...c,
        icon: mapCategoryIcon(c.icon),
      })),
    }),

  addCategory: async (cat) => {
    const { userId } = get();
    if (userId) {
      const { spent: _spent, ...catWithoutSpent } = cat;
      await fsAdd(userId, catWithoutSpent);
      return;
    }
    set((s) => ({ categories: [...s.categories, cat] }));
  },

  updateCategory: async (id, updates) => {
    const { userId } = get();
    if (userId) {
      await fsUpdate(userId, id, updates);
      return;
    }
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    }));
  },

  archiveCategory: async (id) => {
    const { userId } = get();
    if (userId) {
      await fsUpdate(userId, id, { archived: true });
      return;
    }
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, archived: true } : c,
      ),
    }));
  },

  updateSpent: (id, spent) =>
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, spent } : c)),
    })),
}));
