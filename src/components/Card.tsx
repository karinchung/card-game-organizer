import React from 'react';
import { Card as CardType } from '../types/cards';
import './Card.css';

interface CardProps {
  card: CardType;
  onClick?: (event: React.MouseEvent) => void;
  onPlay?: (event: React.MouseEvent) => void;
  count?: number;
}

const Card: React.FC<CardProps> = ({ card, onClick, onPlay, count = 1 }) => {
  const isStackable = card.keywords.includes('Stackable');

  const renderCost = () => {
    if (card.cost_values.food === 0 && card.cost_values.trash === 0) {
      return null;
    }

    const costs = [];
    if (card.cost_values.food > 0) {
      costs.push(`${card.cost_values.food} Food`);
    }
    if (card.cost_values.trash > 0) {
      costs.push(`${card.cost_values.trash} Trash`);
    }

    return (
      <div className="card-cost">
        Cost: {costs.join(' + ')}
        {card.cost_text && <div className="cost-text">{card.cost_text}</div>}
      </div>
    );
  };

  return (
    <div
      className={`card ${card.tier.toLowerCase().replace(' ', '-')} ${isStackable ? 'stackable' : ''}`}
      onClick={onClick}
    >
      {isStackable && count > 1 && <div className="stack-indicator">{count}</div>}
      <div className="card-header">
        <h3 className="card-name">{card.name}</h3>
        <div className="card-type">{card.cardType}</div>
      </div>
      <div className="card-body">
        <div className="card-type-badge">{card.cardType}</div>
        {renderCost()}
        {card.effect && <div className="card-effect">{card.effect}</div>}
        {card.keywords && card.keywords.length > 0 && (
          <div className="card-keywords">
            {card.keywords.map((keyword, index) => (
              <span key={index} className="keyword">
                {keyword}
              </span>
            ))}
          </div>
        )}
        {card.resourceType && card.resourceType.length > 0 && (
          <div className="card-resources">
            {card.resourceType.map((resource, index) => (
              <span key={index} className="resource">
                {resource}
              </span>
            ))}
          </div>
        )}
        {card.effect_values?.vp > 0 && (
          <div className="card-vp">
            <span className="vp-value">{card.effect_values.vp}</span>
            {card.victoryPointsText && <span className="vp-text">({card.victoryPointsText})</span>}
          </div>
        )}
      </div>
      {card.flavor && <div className="card-flavor">{card.flavor}</div>}
      {onPlay && (
        <button className="play-button" onClick={onPlay}>
          Play
        </button>
      )}
    </div>
  );
};

export default Card;
