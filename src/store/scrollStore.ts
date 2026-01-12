import { create } from 'zustand';

interface ScrollState {
  currentWeapon: number;
  scrollProgress: number;
  setCurrentWeapon: (index: number) => void;
  setScrollProgress: (progress: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  currentWeapon: 0,
  scrollProgress: 0,
  setCurrentWeapon: (index) => set({ currentWeapon: index }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
}));

