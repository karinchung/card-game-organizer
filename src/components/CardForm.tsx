import React, { useState } from 'react';
import { Card, Keyword, ResourceType } from '../types/cards';
import './CardForm.css';

interface CardFormProps {
  card?: Card;
  onSubmit: (card: Card) => void;
  onCancel: () => void;
}

const CardForm: React.FC<CardFormProps> = ({ card, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Card>({
    name: card?.name || '',
    tier: card?.tier || 'Basic',
    cost: card?.cost || '0',
    effect: card?.effect || '',
    effect_values: card?.effect_values || {
      food: 0,
      trash: 0,
      vp: 0
    },
    keywords: card?.keywords || [],
    resourceType: card?.resourceType || [],
    cardType: card?.cardType || 'Resource',
    flavor: card?.flavor || '',
    quantity: card?.quantity || 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name === 'resourceType' || name === 'keywords') {
        const currentValues = formData[name as keyof Card] as string[];
        const newValues = checkbox.checked
          ? [...currentValues, value]
          : currentValues.filter(v => v !== value);
        setFormData(prev => ({ ...prev, [name]: newValues }));
      }
    } else if (name === 'vp') {
      setFormData(prev => ({
        ...prev,
        effect_values: {
          ...prev.effect_values,
          vp: Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card-form-container">
      <h2>{card ? 'Edit Card' : 'Add New Card'}</h2>
      <form className="card-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Card Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tier">Tier</label>
          <select
            id="tier"
            name="tier"
            value={formData.tier}
            onChange={handleChange}
          >
            <option value="Basic">Basic</option>
            <option value="Tier 1">Tier 1</option>
            <option value="Tier 2">Tier 2</option>
            <option value="Tier 3">Tier 3</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="cost">Cost</label>
          <input
            type="text"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cardType">Card Type</label>
          <select
            id="cardType"
            name="cardType"
            value={formData.cardType}
            onChange={handleChange}
          >
            <option value="Resource">Resource</option>
            <option value="Den">Den</option>
            <option value="">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Resource Types</label>
          <div className="checkbox-group">
            {['Food', 'Trash'].map(type => (
              <label key={type}>
                <input
                  type="checkbox"
                  name="resourceType"
                  value={type}
                  checked={formData.resourceType.includes(type as ResourceType)}
                  onChange={handleChange}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="effect">Effect</label>
          <textarea
            id="effect"
            name="effect"
            value={formData.effect}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Keywords</label>
          <div className="checkbox-group">
            {['Stackable', 'Shiny', 'Spiritual', 'Friend', 'Metal'].map(keyword => (
              <label key={keyword}>
                <input
                  type="checkbox"
                  name="keywords"
                  value={keyword}
                  checked={formData.keywords.includes(keyword as Keyword)}
                  onChange={handleChange}
                />
                {keyword}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="vp">Victory Points</label>
          <input
            type="number"
            id="vp"
            name="vp"
            value={formData.effect_values.vp}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="flavor">Flavor Text</label>
          <textarea
            id="flavor"
            name="flavor"
            value={formData.flavor}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {card ? 'Save Changes' : 'Add Card'}
          </button>
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardForm; 