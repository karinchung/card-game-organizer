import { Card, Tier, Keyword, ResourceType, CardType } from '../types/cards';

// Type for the raw JSON data
interface RawCard {
  name: string;
  tier: string;
  cost: string;
  effect: string;
  keywords: string[];
  resourceType: string[];
  cardType: string;
  victoryPoints: number | string;
  flavor: string;
  quantity: number;
}

// Convert raw card data to our Card type
export function convertToCard(rawCard: RawCard): Card {
  return {
    ...rawCard,
    tier: rawCard.tier as Tier,
    keywords: rawCard.keywords as Keyword[],
    resourceType: rawCard.resourceType as ResourceType[],
    cardType: rawCard.cardType as CardType,
  };
}

// Convert an array of raw cards to our Card type
export function convertToCards(rawCards: RawCard[]): Card[] {
  return rawCards.map(convertToCard);
} 