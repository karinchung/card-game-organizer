import React, { useState } from 'react';
import { Card } from '../types/cards';
import CardTable from '../components/CardTable';
import CardDetails from '../components/CardDetails';
import CardForm from '../components/CardForm';
import './Cards.css';

interface CardsProps {
  allCards: Card[] | undefined;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardName: string) => void;
}

const Cards: React.FC<CardsProps> = ({ allCards, onEditCard, onDeleteCard }) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleClose = () => {
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
    return <CardForm card={editingCard} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />;
  }

  return (
    <div className="cards-page">
      <header className="cards-header">
        <h1>All Cards</h1>
        {!selectedCard && (
          <button className="add-card-button" onClick={() => handleEdit({} as Card)}>
            Add New Card
          </button>
        )}
      </header>
      {selectedCard ? (
        <CardDetails
          card={selectedCard}
          onEditCard={handleEdit}
          onDeleteCard={onDeleteCard}
          onClose={handleClose}
        />
      ) : (
        <CardTable cards={allCards || []} onCardClick={handleCardClick} onEditCard={handleEdit} />
      )}
    </div>
  );
};

export default Cards;
