import React from 'react';
import { Card as CardType } from '../types/cards';
import './Card.css';

interface CardProps {
  card: CardType;
  onClick: () => void;
  count?: number;
}

const Card: React.FC<CardProps> = ({ card, onClick, count = 1 }) => {
  const isStackable = card.keywords.includes("Stackable");
  
  return (
    <div className={`card ${card.tier.toLowerCase().replace(' ', '-')} ${isStackable ? 'stackable' : ''}`} onClick={onClick}>
      {isStackable && count > 1 && (
        <div className="stack-indicator">{count}</div>
      )}
      <div className="card-header">
        <h3 className="card-name">{card.name}</h3>
      </div>
      <div className="card-body">
        <div className="card-type-badge">{card.cardType}</div>
        {card.cost && <div className="card-cost">Cost: {card.cost}</div>}
        {card.effect && <div className="card-effect">{card.effect}</div>}
        {card.keywords && card.keywords.length > 0 && (
          <div className="card-keywords">
            {card.keywords.map((keyword, index) => (
              <span key={index} className="keyword">{keyword}</span>
            ))}
          </div>
        )}
        {card.resourceType && card.resourceType.length > 0 && (
          <div className="card-resources">
            {card.resourceType.map((resource, index) => (
              <span key={index} className="resource">{resource}</span>
            ))}
          </div>
        )}
        {card.effect_values?.vp > 0 && (
          <div className="card-vp">
            <span className="vp-value">{card.effect_values.vp}</span>
            {card.victoryPointsText && (
              <span className="vp-text">({card.victoryPointsText})</span>
            )}
          </div>
        )}
      </div>
      {card.flavor && <div className="card-flavor">{card.flavor}</div>}
    </div>
  );
};

export default Card; 