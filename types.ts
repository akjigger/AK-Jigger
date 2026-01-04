
export type AppState = 'welcome' | 'mixer' | 'game' | 'oracle' | 'waitlist' | 'quiz' | 'wingflip' | 'vinyl' | 'leaderboard';

export interface WaitlistItem {
  name: string;
  size: number;
  timeRemaining: number;
}

export interface GameScore {
  playerName: string;
  score: number;
  date: string;
}

export interface BoilermakerPairing {
  beer: string;
  whiskey: string;
  description: string;
  vibe: string;
}

export interface CocktailResult {
  cocktailName: string;
  description: string;
  personality: string;
  spiritAnimal: string;
}
