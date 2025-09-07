import type { GameState } from "../types";

interface ProgressData {
  unlockedCharacters: string[];
  completedLevels: string[];
  currentLevelSetId: string;
  currentCharacterIndex: number;
  timestamp: number;
}

export class ProgressManager {
  private static readonly STORAGE_KEY = "kana-reader-progress";

  static saveProgress(state: GameState): void {
    try {
      const progressData: ProgressData = {
        unlockedCharacters: Array.from(state.unlockedCharacters),
        completedLevels: Array.from(state.completedLevels),
        currentLevelSetId: state.currentLevelSetId,
        currentCharacterIndex: state.currentCharacterIndex,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressData));
    } catch (error) {
      console.warn("Failed to save progress to localStorage:", error);
    }
  }

  static loadProgress(): ProgressData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const progressData: ProgressData = JSON.parse(stored);

      // Validate the data structure
      if (this.isValidProgressData(progressData)) {
        return progressData;
      } else {
        console.warn("Invalid progress data found, resetting");
        this.resetProgress();
        return null;
      }
    } catch (error) {
      console.warn("Failed to load progress from localStorage:", error);
      return null;
    }
  }

  static resetProgress(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to reset progress:", error);
    }
  }

  private static isValidProgressData(data: unknown): data is ProgressData {
    return (
      !!data &&
      typeof data === "object" &&
      data !== null &&
      Array.isArray((data as any).unlockedCharacters) &&
      Array.isArray((data as any).completedLevels) &&
      typeof (data as any).currentLevelSetId === "string" &&
      typeof (data as any).currentCharacterIndex === "number" &&
      typeof (data as any).timestamp === "number"
    );
  }
}
