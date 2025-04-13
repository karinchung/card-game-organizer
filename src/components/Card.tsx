import React from 'react';
import { Card as CardType } from '../types/cards';
import './Card.css';

interface CardProps {
  card: CardType;
}

const Card: React.FC<CardProps> = ({ card }) => {
  return (
    <div className={`card ${card.tier.toLowerCase().replace(' ', '-')}`}>
      <div className="card-header">
        <h3 className="card-name">{card.name}</h3>
        <span className="card-cost">{card.cost}</span>
      </div>
      <div className="card-body">
        <div className="card-type">
          {card.cardType} {card.resourceType.join(', ')}
        </div>
        <div className="card-effect">{card.effect}</div>
        {card.keywords.length > 0 && (
          <div className="card-keywords">
            {card.keywords.join(', ')}
          </div>
        )}
      </div>
      <div className="card-footer">
        {typeof card.victoryPoints === 'number' && card.victoryPoints > 0 && (
          <span className="victory-points">VP: {card.victoryPoints}</span>
        )}
        {card.flavor && <div className="flavor-text">{card.flavor}</div>}
      </div>
    </div>
  );
};

export default Card; 