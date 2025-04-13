import React from 'react';
import { Card as CardType } from '../types/cards';
import CardComponent from './Card';
import './CardList.css';

interface CardListProps {
  cards: CardType[];
}

const CardList: React.FC<CardListProps> = ({ cards }) => {
  return (
    <div className="card-list">
      {cards.map((card, index) => (
        <CardComponent key={`${card.name}-${index}`} card={card} />
      ))}
    </div>
  );
};

export default CardList; 