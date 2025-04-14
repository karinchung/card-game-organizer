// Card type definitions
export interface Card {
  name: string;
  tier: Tier;
  cost: string;
  cost_values: {
    food: number;
    trash: number;
  };
  cost_text: string;
  effect: string;
  effect_values: {
    food: number;
    trash: number;
    vp: number;
  };
  keywords: Keyword[];
  resourceType: ResourceType[];
  cardType: CardType;
  flavor: string;
  quantity: number;
  victoryPointsText: string;
}

// Enums for type safety
export type Tier = 'Basic' | 'Tier 1' | 'Tier 2' | 'Tier 3';
export type Keyword = 'Stackable' | 'Shiny' | 'Spiritual' | 'Friend' | 'Metal';
export type ResourceType = 'Food' | 'Trash';
export type CardType = 'Resource' | 'Den' | 'Ally' | 'Ritual' | '';
