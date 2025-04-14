import React from 'react';
import { Card } from '../types/cards';
import './CardTable.css';

interface CardTableProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  onEditCard: (card: Card) => void;
}

const CardTable: React.FC<CardTableProps> = ({ cards, onCardClick, onEditCard }) => {
  // Group cards by tier
  const cardsByTier = cards.reduce((acc, card) => {
    if (!acc[card.tier]) {
      acc[card.tier] = [];
    }
    acc[card.tier].push(card);
    return acc;
  }, {} as Record<string, Card[]>);

  // Sort tiers in the correct order
  const tierOrder = ["Basic", "Tier 1", "Tier 2", "Tier 3"];
  const sortedTiers = Object.keys(cardsByTier).sort(
    (a, b) => tierOrder.indexOf(a) - tierOrder.indexOf(b)
  );

  return (
    <div className="card-table-container">
      {sortedTiers.map(tier => (
        <div key={tier} className="tier-section">
          <h2 className="tier-header">{tier}</h2>
          <table className="card-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cost</th>
                <th>Type</th>
                <th>Effect</th>
                <th>Keywords</th>
                <th>VP</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cardsByTier[tier].map((card, index) => (
                <tr 
                  key={`${card.name}-${index}`} 
                  className="card-row"
                >
                  <td onClick={() => onCardClick?.(card)} className={onCardClick ? "clickable" : ""}>{card.name}</td>
                  <td onClick={() => onCardClick?.(card)} className={onCardClick ? "clickable" : ""}>{card.cost}</td>
                  <td onClick={() => onCardClick?.(card)} className={onCardClick ? "clickable" : ""}>{card.cardType} {card.resourceType.join(', ')}</td>
                  <td onClick={() => onCardClick?.(card)} className={onCardClick ? "clickable" : ""}>{card.effect}</td>
                  <td onClick={() => onCardClick?.(card)} className={onCardClick ? "clickable" : ""}>{card.keywords.join(', ') || '-'}</td>
                  <td onClick={() => onCardClick?.(card)} className={onCardClick ? "clickable" : ""}>{card.effect_values?.vp || 0}</td>
                  <td>
                    <button 
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCard(card);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default CardTable; 