import React, { useState } from 'react';
import { Card } from '../types/cards';
import CardTable from '../components/CardTable';
import CardDetails from '../components/CardDetails';
import CardForm from '../components/CardForm';
import './Cards.css';

interface CardsProps {
  cards: Card[];
  onEditCard: (card: Card) => void;
}

const Cards: React.FC<CardsProps> = ({ cards, onEditCard }) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleBack = () => {
    setSelectedCard(null);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
  };

  const handleFormSubmit = (card: Card) => {
    onEditCard(card);
    setEditingCard(null);
  };

  const handleFormCancel = () => {
    setEditingCard(null);
  };

  if (editingCard) {
    return (
      <CardForm
        card={editingCard}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="cards-page">
      <header className="cards-header">
        <h1>All Cards</h1>
        <button className="add-card-button" onClick={() => handleEdit({} as Card)}>
          Add New Card
        </button>
      </header>
      {selectedCard ? (
        <CardDetails
          card={selectedCard}
          onBack={handleBack}
          onEdit={handleEdit}
        />
      ) : (
        <CardTable
          cards={cards}
          onCardClick={handleCardClick}
          onEditCard={handleEdit}
        />
      )}
    </div>
  );
};

export default Cards; 