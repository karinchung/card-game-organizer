// Card type definitions
export interface Card {
  name: string;
  tier: Tier;
  cost: string;
  effect: string;
  keywords: Keyword[];
  resourceType: ResourceType[];
  cardType: CardType;
  victoryPoints: number | string;
  flavor: string;
  quantity: number;
}

// Enums for type safety
export type Tier = "Basic" | "Tier 1" | "Tier 2" | "Tier 3";
export type Keyword = "Stackable" | "Shiny" | "Spiritual" | "Friend" | "Metal";
export type ResourceType = "Food" | "Trash";
export type CardType = "Resource" | "Den" | "Ally" | "Ritual" | ""; 