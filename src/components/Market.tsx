import React from 'react';
import { Card as CardType } from '../types/cards';
import { GameState } from '../types/game';
import Card from './Card';

interface MarketProps {
  gameState: GameState;
  onCardClick: (card: CardType) => void;
}

const Market: React.FC<MarketProps> = ({ gameState, onCardClick }) => {
  // Group stackable cards in each tier
  const groupedFreeMarket = groupStackableCards(gameState.market.freeMarket);
  const groupedTier1 = groupStackableCards(gameState.market.tier1);
  const groupedTier2 = groupStackableCards(gameState.market.tier2);
  const groupedTier3 = groupStackableCards(gameState.market.tier3);

  return (
    <div className="market">
      <h2>Market</h2>
      <div className="market-section">
        <h3>Free Market</h3>
        <div className="cards-container">
          {groupedFreeMarket.map((cardGroup, index) => (
            <Card
              key={`free-${index}`}
              card={cardGroup.card}
              onClick={() => onCardClick(cardGroup.card)}
              count={cardGroup.count}
            />
          ))}
        </div>
      </div>
      <div className="market-section">
        <h3>Tier 1</h3>
        <div className="cards-container">
          {groupedTier1.map((cardGroup, index) => (
            <Card
              key={`tier1-${index}`}
              card={cardGroup.card}
              onClick={() => onCardClick(cardGroup.card)}
              count={cardGroup.count}
            />
          ))}
        </div>
      </div>
      <div className="market-section">
        <h3>Tier 2</h3>
        <div className="cards-container">
          {groupedTier2.map((cardGroup, index) => (
            <Card
              key={`tier2-${index}`}
              card={cardGroup.card}
              onClick={() => onCardClick(cardGroup.card)}
              count={cardGroup.count}
            />
          ))}
        </div>
      </div>
      <div className="market-section">
        <h3>Tier 3</h3>
        <div className="cards-container">
          {groupedTier3.map((cardGroup, index) => (
            <Card
              key={`tier3-${index}`}
              card={cardGroup.card}
              onClick={() => onCardClick(cardGroup.card)}
              count={cardGroup.count}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to group stackable cards
const groupStackableCards = (cards: CardType[]) => {
  const cardGroups: { card: CardType; count: number }[] = [];
  const processedCards = new Set<string>();

  cards.forEach(card => {
    if (processedCards.has(card.name)) return;
    
    if (card.keywords.includes("Stackable")) {
      const count = cards.filter(c => c.name === card.name).length;
      cardGroups.push({ card, count });
    } else {
      cardGroups.push({ card, count: 1 });
    }
    
    processedCards.add(card.name);
  });

  return cardGroups;
};

export default Market; 