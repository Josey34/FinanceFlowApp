import { create } from 'zustand';
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
    if (!userId) return;
    await fsAdd(userId, goal);
  },

  updateGoal: async (id, updates) => {
    const { userId } = get();
    if (!userId) return;
    await fsUpdate(userId, id, updates);
  },

  deleteGoal: async (id) => {
    const { userId } = get();
    if (!userId) return;
    await fsDelete(userId, id);
  },

  contributeToGoal: async (id, amount) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;
    const saved = Math.min(goal.savedAmount + amount, goal.targetAmount);
    const completed = saved >= goal.targetAmount;
    await get().updateGoal(id, { savedAmount: saved, completed });
  },
}));
