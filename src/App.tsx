import React, { useState, useEffect } from 'react';
import { Card } from './types/cards';
import CardTable from './components/CardTable';
import CardForm from './components/CardForm';
import { convertToCards } from './utils/cardUtils';
import './App.css';

const API_URL = 'http://localhost:3001/api';

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_URL}/cards`);
      const data = await response.json();
      setCards(convertToCards(data.cards));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setLoading(false);
    }
  };

  const saveCards = async (updatedCards: Card[]) => {
    try {
      await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards: updatedCards }),
      });
      console.log('Cards saved successfully');
    } catch (error) {
      console.error('Error saving cards:', error);
    }
  };

  const handleAddCard = (card: Card) => {
    const updatedCards = [...cards, card];
    setCards(updatedCards);
    saveCards(updatedCards);
    setShowForm(false);
    setEditingCard(undefined);
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleUpdateCard = (updatedCard: Card) => {
    const updatedCards = cards.map(card => 
      card.name === editingCard?.name ? updatedCard : card
    );
    setCards(updatedCards);
    saveCards(updatedCards);
    setShowForm(false);
    setEditingCard(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCard(undefined);
  };

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Raccoon Trash Scheme</h1>
        </header>
        <main>
          <div className="loading">Loading cards...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Raccoon Trash Scheme</h1>
        <button 
          className="add-card-button"
          onClick={() => setShowForm(true)}
        >
          Add New Card
        </button>
      </header>
      <main>
        {showForm ? (
          <CardForm
            card={editingCard}
            onSubmit={editingCard ? handleUpdateCard : handleAddCard}
            onCancel={handleCancel}
          />
        ) : (
          <CardTable 
            cards={cards} 
            onEditCard={handleEditCard}
          />
        )}
      </main>
    </div>
  );
};

export default App; 