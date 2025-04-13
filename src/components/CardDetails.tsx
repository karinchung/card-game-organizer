import React from 'react';
import { Card } from '../types/cards';
import './CardDetails.css';

interface CardDetailsProps {
  card: Card;
  onBack: () => void;
  onEdit: (card: Card) => void;
}

const CardDetails: React.FC<CardDetailsProps> = ({ card, onBack, onEdit }) => {
  return (
    <div className="card-details">
      <div className="card-details-header">
        <button className="back-button" onClick={onBack}>
          ← Back to List
        </button>
        <button className="edit-button" onClick={() => onEdit(card)}>
          Edit Card
        </button>
      </div>
      
      <div className={`card-details-content ${card.tier.toLowerCase().replace(' ', '-')}`}>
        <div className="card-details-header-info">
          <h2 className="card-details-name">{card.name}</h2>
          <span className="card-details-cost">{card.cost}</span>
        </div>
        
        <div className="card-details-tier">
          <span className="tier-badge">{card.tier}</span>
        </div>
        
        <div className="card-details-type">
          <strong>Type:</strong> {card.cardType} {card.resourceType.join(', ')}
        </div>
        
        <div className="card-details-effect">
          <strong>Effect:</strong> {card.effect}
        </div>
        
        {card.keywords.length > 0 && (
          <div className="card-details-keywords">
            <strong>Keywords:</strong> {card.keywords.join(', ')}
          </div>
        )}
        
        {card.effect_values?.vp > 0 && (
          <div className="card-detail">
            <span className="card-detail-label">Victory Points:</span>
            <span className="card-detail-value">{card.effect_values.vp}</span>
            {card.victoryPointsText && (
              <span className="card-detail-text">({card.victoryPointsText})</span>
            )}
          </div>
        )}
        
        {card.flavor && (
          <div className="card-details-flavor">
            <em>{card.flavor}</em>
          </div>
        )}
        
        <div className="card-details-quantity">
          <strong>Quantity:</strong> {card.quantity}
        </div>
      </div>
    </div>
  );
};

export default CardDetails; 