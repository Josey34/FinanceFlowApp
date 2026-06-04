import { create } from 'zustand';
import { uid } from '../utils/uid';
import { Goal } from '../types';
import {
  addGoal as fsAdd,
  updateGoal as fsUpdate,
  deleteGoal as fsDelete,
} from '../services/goals';


interface GoalState {
  goals: Goal[];
  userId: string | null;
  setUserId: (id: string | null) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  userId: null,

  setUserId: (userId) => set({ userId }),

  addGoal: async (goal) => {
    const { userId } = get();
    if (userId) {
      await fsAdd(userId, goal);
      return;
    }
    set((s) => ({ goals: [...s.goals, { ...goal, id: uid() }] }));
  },

  updateGoal: async (id, updates) => {
    const { userId } = get();
    if (userId) {
      await fsUpdate(userId, id, updates);
      return;
    }
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) }));
  },

  deleteGoal: async (id) => {
    const { userId } = get();
    if (userId) {
      await fsDelete(userId, id);
      return;
    }
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
  },

  contributeToGoal: async (id, amount) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;
    const saved = Math.min(goal.savedAmount + amount, goal.targetAmount);
    const completed = saved >= goal.targetAmount;
    await get().updateGoal(id, { savedAmount: saved, completed });
  },
}));
