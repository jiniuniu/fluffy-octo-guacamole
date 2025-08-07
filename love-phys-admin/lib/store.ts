import { create } from "zustand";
import { GenerationRecord, GenerationState } from "./types";

interface AppStore extends GenerationState {
  // Actions
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  setCurrentStep: (step: string) => void;
  setSelectedRecord: (record: GenerationRecord | null) => void;
  setRecentRecords: (records: GenerationRecord[]) => void;
  addRecord: (record: GenerationRecord) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // State
  isGenerating: false,
  progress: 0,
  currentStep: "",
  selectedRecord: null,
  recentRecords: [],

  // Actions
  setGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setSelectedRecord: (selectedRecord) => set({ selectedRecord }),
  setRecentRecords: (recentRecords) => set({ recentRecords }),
  addRecord: (record) =>
    set((state) => ({
      recentRecords: [record, ...state.recentRecords].slice(0, 20),
    })),
}));
