import React from 'react';
import './GameStats.css';

interface GameStatsProps {
  food: number;
  trash: number;
  victoryPoints: number;
}

const GameStats: React.FC<GameStatsProps> = ({ food, trash, victoryPoints }) => {
  return (
    <div className="game-stats">
      <div className="stat-item">
        <span className="stat-label">Food:</span>
        <span className="stat-value">{food}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Trash:</span>
        <span className="stat-value">{trash}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Victory Points:</span>
        <span className="stat-value">{victoryPoints}</span>
      </div>
    </div>
  );
};

export default GameStats;
