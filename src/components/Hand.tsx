import React from 'react';
import { Card as CardType } from '../types/cards';
import { GameState } from '../types/game';
import Card from './Card';
import './Hand.css';

interface HandProps {
  gameState: GameState;
  onCardClick: (card: CardType, event?: React.MouseEvent) => void;
  onPlayCard: (card: CardType, event?: React.MouseEvent) => void;
}

const Hand: React.FC<HandProps> = ({ gameState, onCardClick, onPlayCard }) => {
  // Group stackable cards
  const groupedCards = groupStackableCards(gameState.hand);

  // Calculate hand total (stackable cards count as 1)
  const handTotal = calculateHandTotal(gameState.hand);

  return (
    <div className="hand">
      <h2>Hand ({handTotal}/10)</h2>
      <div className="hand-cards">
        {groupedCards.map((cardGroup, index) => (
          <div key={`${cardGroup.card.name}-${index}`} className="hand-card">
            <Card
              card={cardGroup.card}
              onClick={(e: React.MouseEvent) => onCardClick(cardGroup.card, e)}
              onPlay={(e: React.MouseEvent) => onPlayCard(cardGroup.card, e)}
              count={cardGroup.count}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to group stackable cards
const groupStackableCards = (cards: CardType[]) => {
  const cardGroups: { card: CardType; count: number }[] = [];
  const processedCards = new Set<string>();

  cards.forEach((card) => {
    // For non-stackable cards, add each instance separately
    if (!card.keywords.includes('Stackable')) {
      cardGroups.push({ card, count: 1 });
      return;
    }

    // For stackable cards, group them
    if (processedCards.has(card.name)) return;

    const count = cards.filter((c) => c.name === card.name).length;
    cardGroups.push({ card, count });
    processedCards.add(card.name);
  });

  return cardGroups;
};

// Helper function to calculate hand total (stackable cards count as 1)
const calculateHandTotal = (cards: CardType[]) => {
  const processedCards = new Set<string>();
  let total = 0;

  cards.forEach((card) => {
    if (card.keywords.includes('Stackable')) {
      if (!processedCards.has(card.name)) {
        total += 1;
        processedCards.add(card.name);
      }
    } else {
      total += 1;
    }
  });

  return total;
};

export default Hand;
