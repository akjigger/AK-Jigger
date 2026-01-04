
import { GameScore } from '../types';

const STORAGE_KEYS = {
  'shot-drop': 'bop_scores_shot_drop',
  'wing-catcher': 'bop_scores_wing_catcher',
  'vinyl-scratch': 'bop_scores_vinyl_scratch'
};

export type GameId = keyof typeof STORAGE_KEYS;

export const saveScore = (gameId: GameId, playerName: string, score: number) => {
  if (score <= 0) return;
  
  const scores: GameScore[] = JSON.parse(localStorage.getItem(STORAGE_KEYS[gameId]) || '[]');
  
  const newScore: GameScore = {
    playerName: playerName || 'Anonymous Pony',
    score,
    date: new Date().toLocaleDateString()
  };

  scores.push(newScore);
  // Sort descending and keep top 10
  const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
  
  localStorage.setItem(STORAGE_KEYS[gameId], JSON.stringify(topScores));
};

export const getLeaderboard = (gameId: GameId): GameScore[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS[gameId]) || '[]');
};
