import React, { useState } from 'react';
import { Card } from '../types/cards';
import CardForm from './CardForm';
import './CardDetails.css';

interface CardDetailsProps {
  card: Card;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardName: string) => void;
  onClose: () => void;
}

const CardDetails: React.FC<CardDetailsProps> = ({ card, onEditCard, onDeleteCard, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the card "${card.name}"?`)) {
      onDeleteCard(card.name);
      onClose();
    }
  };

  const handleSave = (updatedCard: Card) => {
    onEditCard(updatedCard);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return <CardForm card={card} onSave={handleSave} onCancel={handleCancel} />;
  }

  return (
    <div className="card-details">
      <div className="card-details-header">
        <h2>{card.name}</h2>
        <div className="card-details-actions">
          <button className="edit-button" onClick={handleEdit}>
            Edit
          </button>
          <button className="delete-button" onClick={handleDelete}>
            Delete
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="card-details-content">
        <div className="card-details-section">
          <h3>Card Information</h3>
          <p>
            <strong>Type:</strong> {card.cardType}
          </p>
          <p>
            <strong>Tier:</strong> {card.tier}
          </p>
          <p>
            <strong>Description:</strong> {card.effect}
          </p>
        </div>

        {card.cost_values && (
          <div className="card-details-section">
            <h3>Cost</h3>
            {card.cost_values.food > 0 && (
              <p>
                <strong>Food:</strong> {card.cost_values.food}
              </p>
            )}
            {card.cost_values.trash > 0 && (
              <p>
                <strong>Trash:</strong> {card.cost_values.trash}
              </p>
            )}
          </div>
        )}

        {card.effect_values && (
          <div className="card-details-section">
            <h3>Effect</h3>
            {card.effect_values.food > 0 && (
              <p>
                <strong>Food:</strong> +{card.effect_values.food}
              </p>
            )}
            {card.effect_values.trash > 0 && (
              <p>
                <strong>Trash:</strong> +{card.effect_values.trash}
              </p>
            )}
            {card.effect_values.vp > 0 && (
              <p>
                <strong>Victory Points:</strong> +{card.effect_values.vp}
              </p>
            )}
          </div>
        )}

        {card.resourceType && (
          <div className="card-details-section">
            <h3>Resource Type</h3>
            <p>{card.resourceType.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDetails;
