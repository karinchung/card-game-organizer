import React, { useState } from 'react';
import { Card } from '../types/cards';
import CardTable from '../components/CardTable';
import CardDetails from '../components/CardDetails';
import './Cards.css';

interface CardsProps {
  cards: Card[];
  onEditCard: (card: Card) => void;
}

const Cards: React.FC<CardsProps> = ({ cards, onEditCard }) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleBack = () => {
    setSelectedCard(null);
  };

  return (
    <div className="cards-page">
      <header className="cards-header">
        <h1>All Cards</h1>
        <button className="add-card-button" onClick={() => onEditCard({} as Card)}>
          Add New Card
        </button>
      </header>
      {selectedCard ? (
        <CardDetails
          card={selectedCard}
          onBack={handleBack}
          onEdit={onEditCard}
        />
      ) : (
        <CardTable
          cards={cards}
          onCardClick={handleCardClick}
          onEditCard={onEditCard}
        />
      )}
    </div>
  );
};

export default Cards; 