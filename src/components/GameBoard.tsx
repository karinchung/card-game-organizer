import React from 'react';
import { Card as CardType } from '../types/cards';
import { GameState } from '../types/game';
import Card from './Card';

interface GameBoardProps {
  gameState: GameState;
  onCardClick: (card: CardType) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onCardClick }) => {
  // Group stackable cards
  const groupedDenCards = groupStackableCards(gameState.board.denCards);
  const groupedFriendCards = groupStackableCards(gameState.board.friendCards);

  return (
    <div className="game-board">
      <h2>Your Board</h2>
      <div className="board-section">
        <h3>Den Cards ({countNonStackableCards(gameState.board.denCards)}/6)</h3>
        <div className="cards-container">
          {groupedDenCards.map((cardGroup, index) => (
            <Card
              key={`den-${index}`}
              card={cardGroup.card}
              onClick={() => onCardClick(cardGroup.card)}
              count={cardGroup.count}
            />
          ))}
        </div>
      </div>
      <div className="board-section">
        <h3>Friend Cards ({gameState.board.friendCards.length})</h3>
        <div className="cards-container">
          {groupedFriendCards.map((cardGroup, index) => (
            <Card
              key={`friend-${index}`}
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

// Helper function to count non-stackable cards
const countNonStackableCards = (cards: CardType[]) => {
  return cards.filter(card => !card.keywords.includes("Stackable")).length;
};

export default GameBoard; 