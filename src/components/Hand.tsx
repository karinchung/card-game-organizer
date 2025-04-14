import React, { useState } from 'react';
import { Card as CardType } from '../types/cards';
import { GameState } from '../types/game';
import Card from './Card';
import CardDetails from './CardDetails';
import { useLocation } from 'react-router-dom';
import './Hand.css';

interface HandProps {
  gameState: GameState;
  onPlayCard: (card: CardType) => void;
  onCardClick: (card: CardType) => void;
}

const Hand: React.FC<HandProps> = ({ gameState, onPlayCard, onCardClick }) => {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const location = useLocation();
  const isGameView = location.pathname === '/';

  const handleCardClick = (card: CardType) => {
    onCardClick(card);
    if (!isGameView) {
      setSelectedCard(card);
    }
  };

  const handleBack = () => {
    setSelectedCard(null);
  };

  const handleEdit = (card: CardType) => {
    // For now, just close the details
    setSelectedCard(null);
  };

  const handlePlayCard = (card: CardType) => {
    onPlayCard(card);
    setSelectedCard(null);
  };

  // Group identical stackable cards
  const groupedCards = gameState.hand.reduce((acc, card) => {
    if (card.keywords.includes("Stackable")) {
      const key = `${card.name}-${card.cost}`;
      if (!acc[key]) {
        acc[key] = { card, count: 1 };
      } else {
        acc[key].count++;
      }
    } else {
      acc[`${card.name}-${card.cost}-${Math.random()}`] = { card, count: 1 };
    }
    return acc;
  }, {} as Record<string, { card: CardType; count: number }>);

  return (
    <div className="hand">
      <h3>Your Hand</h3>
      <div className="hand-cards">
        {Object.values(groupedCards).map(({ card, count }) => (
          <div key={`${card.name}-${card.cost}`} className="card-container">
            <Card
              card={card}
              onClick={() => handleCardClick(card)}
              count={count}
            />
          </div>
        ))}
      </div>
      {selectedCard && (
        <CardDetails
          card={selectedCard}
          onBack={handleBack}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default Hand; 