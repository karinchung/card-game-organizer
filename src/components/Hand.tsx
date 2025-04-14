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
  return (
    <div className="hand">
      <h2>Hand ({gameState.hand.length}/10)</h2>
      <div className="hand-cards">
        {gameState.hand.map((card, index) => (
          <div key={index} className="hand-card">
            <Card
              card={card}
              onClick={(e: React.MouseEvent) => onCardClick(card, e)}
              onPlay={(e: React.MouseEvent) => onPlayCard(card, e)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hand;
