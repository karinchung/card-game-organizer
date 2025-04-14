import { Card } from './cards';

export interface GameState {
  board: {
    denCards: Card[];
    friendCards: Card[];
  };
  hand: Card[];
  market: {
    freeMarket: Card[];
    tier1: Card[];
    tier2: Card[];
    tier3: Card[];
  };
  trash: Card[];
}

export interface GameLimits {
  maxDenCards: number;
  maxHandSize: number;
  marketRowSize: number;
} 