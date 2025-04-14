import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Card } from './types/cards';
import { GameState } from './types/game';
import GameBoard from './components/GameBoard';
import Market from './components/Market';
import Hand from './components/Hand';
import GameStats from './components/GameStats';
import Cards from './pages/Cards';
import { convertToCards } from './utils/cardUtils';
import useSWR from 'swr';
import './App.css';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'
  : 'http://localhost:3001/api';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  return convertToCards(data.cards);
};

const initialGameState: GameState = {
  board: {
    denCards: [],
    friendCards: [],
  },
  hand: [],
  market: {
    freeMarket: [],
    tier1: [],
    tier2: [],
    tier3: [],
  },
  trash: [],
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [loading, setLoading] = useState(true);
  const [gameStats, setGameStats] = useState({
    food: 0,
    trash: 0,
    victoryPoints: 0,
  });

  // Use SWR to fetch cards
  const { data: allCards, mutate: mutateCards } = useSWR<Card[]>(`${API_URL}/cards`, fetcher, {
    onSuccess: (cards: Card[]) => {
      initializeGame(cards);
      setLoading(false);
    },
    onError: (error: Error) => {
      console.error('Error fetching cards:', error);
      setLoading(false);
    },
  });

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const initializeGame = useCallback((cards: Card[]) => {
    if (!cards) return;

    const shuffledCards = shuffleArray(cards);

    const newGameState = {
      ...initialGameState,
      market: {
        freeMarket: shuffledCards.filter((card) => card.tier === 'Basic').slice(0, 5),
        tier1: shuffledCards.filter((card) => card.tier === 'Tier 1').slice(0, 5),
        tier2: shuffledCards.filter((card) => card.tier === 'Tier 2').slice(0, 5),
        tier3: shuffledCards.filter((card) => card.tier === 'Tier 3').slice(0, 5),
      },
    };

    setGameState(newGameState);
  }, []);

  const handleCardActivation = (card: Card) => {
    setGameStats((prevStats) => {
      const newStats = { ...prevStats };

      // Check for food resources
      if (card.resourceType?.includes('Food')) {
        newStats.food += card.effect_values?.food || 1;
      }

      // Check for trash resources
      if (card.resourceType?.includes('Trash')) {
        newStats.trash += card.effect_values?.trash || 1;
      }

      // Check for victory points
      if (card.effect_values?.vp) {
        newStats.victoryPoints += card.effect_values.vp;
      }

      return newStats;
    });
  };

  const handleCardClick = (card: Card, event?: React.MouseEvent) => {
    // Prevent default behavior to avoid navigation to card detail page
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // If the card is in the hand or on the board, activate it
    if (
      gameState.hand.includes(card) ||
      gameState.board.denCards.includes(card) ||
      gameState.board.friendCards.includes(card)
    ) {
      handleCardActivation(card);

      // Move the card to trash after activation
      setGameState((prevState) => {
        return {
          ...prevState,
          hand: prevState.hand.filter((c) => c !== card),
          board: {
            denCards: prevState.board.denCards.filter((c) => c !== card),
            friendCards: prevState.board.friendCards.filter((c) => c !== card),
          },
          trash: [...prevState.trash, card],
        };
      });

      // Return early to prevent further processing
      return;
    }

    setGameState((prevState) => {
      // If card is in market, try to add it to hand or board
      const isInMarket = [
        ...prevState.market.freeMarket,
        ...prevState.market.tier1,
        ...prevState.market.tier2,
        ...prevState.market.tier3,
      ].includes(card);

      if (isInMarket) {
        // Check if player has enough resources to pay the cost
        const costFood = card.cost_values?.food || 0;
        const costTrash = card.cost_values?.trash || 0;

        if (gameStats.food >= costFood && gameStats.trash >= costTrash) {
          // Subtract the cost from the player's resources
          setGameStats((prevStats) => ({
            ...prevStats,
            food: Math.max(0, prevStats.food - costFood),
            trash: Math.max(0, prevStats.trash - costTrash),
          }));

          // Special handling for basic cards in free market
          if (card.tier === 'Basic' && prevState.market.freeMarket.includes(card)) {
            // Create a duplicate of the card to add to hand or board
            const cardDuplicate = { ...card };

            // Check if we can add the card based on its type and current state
            if (card.cardType === 'Den') {
              if (prevState.board.denCards.length < 6) {
                return {
                  ...prevState,
                  board: {
                    ...prevState.board,
                    denCards: [...prevState.board.denCards, cardDuplicate],
                  },
                };
              }
            } else if (card.cardType === 'Ally') {
              return {
                ...prevState,
                board: {
                  ...prevState.board,
                  friendCards: [...prevState.board.friendCards, cardDuplicate],
                },
              };
            } else if (prevState.hand.length < 10) {
              return {
                ...prevState,
                hand: [...prevState.hand, cardDuplicate],
              };
            }
          } else {
            // For non-basic cards, determine which market section the card is in
            let marketSection: keyof typeof prevState.market = 'freeMarket';
            if (prevState.market.tier1.includes(card)) marketSection = 'tier1';
            else if (prevState.market.tier2.includes(card)) marketSection = 'tier2';
            else if (prevState.market.tier3.includes(card)) marketSection = 'tier3';

            // Find a replacement card from the same tier
            const availableCards = allCards
              ? allCards.filter(
                  (c) =>
                    c.tier === card.tier &&
                    !prevState.market.freeMarket.includes(c) &&
                    !prevState.market.tier1.includes(c) &&
                    !prevState.market.tier2.includes(c) &&
                    !prevState.market.tier3.includes(c) &&
                    !prevState.hand.includes(c) &&
                    !prevState.board.denCards.includes(c) &&
                    !prevState.board.friendCards.includes(c)
                )
              : [];

            const replacementCard =
              availableCards.length > 0 ? shuffleArray(availableCards)[0] : null;

            // Update the market section with the replacement card
            const updatedMarket = {
              ...prevState.market,
              [marketSection]: prevState.market[marketSection]
                .filter((c) => c !== card)
                .concat(replacementCard ? [replacementCard] : []),
            };

            // Add the card to the appropriate location
            if (card.cardType === 'Den') {
              if (prevState.board.denCards.length < 6) {
                return {
                  ...prevState,
                  board: {
                    ...prevState.board,
                    denCards: [...prevState.board.denCards, card],
                  },
                  market: updatedMarket,
                };
              }
            } else if (card.cardType === 'Ally') {
              return {
                ...prevState,
                board: {
                  ...prevState.board,
                  friendCards: [...prevState.board.friendCards, card],
                },
                market: updatedMarket,
              };
            } else if (prevState.hand.length < 10) {
              return {
                ...prevState,
                hand: [...prevState.hand, card],
                market: updatedMarket,
              };
            }
          }
        }
      }

      return prevState;
    });
  };

  const handleShuffle = () => {
    if (allCards) {
      initializeGame(allCards);
    }
  };

  const handleRestart = () => {
    setGameState(initialGameState);
    setGameStats({ food: 0, trash: 0, victoryPoints: 0 });
    if (allCards) {
      initializeGame(allCards);
    }
  };

  const handleEditCard = (card: Card) => {
    if (!allCards) return;

    const updatedCards = [...allCards];
    const cardIndex = updatedCards.findIndex((c: Card) => c.name === card.name);

    if (cardIndex === -1) {
      // This is a new card
      updatedCards.push(card);
    } else {
      // Update existing card
      updatedCards[cardIndex] = card;
    }

    // Update the cards.json file
    fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cards: updatedCards }),
    })
      .then(() => {
        // Update the SWR cache with the new data
        // This will trigger a re-render of all components that use the allCards data
        mutateCards(updatedCards, false);

        // Force a re-render of all components by updating the state
        setGameState((prevState) => {
          // Create a new game state with the updated cards
          const newGameState = {
            ...prevState,
            market: {
              freeMarket: updatedCards.filter((card) => card.tier === 'Basic'),
              tier1: updatedCards.filter((card) => card.tier === 'Tier 1'),
              tier2: updatedCards.filter((card) => card.tier === 'Tier 2'),
              tier3: updatedCards.filter((card) => card.tier === 'Tier 3'),
            },
          };

          // Also update the hand and board with the updated cards
          return {
            ...newGameState,
            hand: prevState.hand.map((c) => {
              const updatedCard = updatedCards.find((uc) => uc.name === c.name);
              return updatedCard || c;
            }),
            board: {
              denCards: prevState.board.denCards.map((c) => {
                const updatedCard = updatedCards.find((uc) => uc.name === c.name);
                return updatedCard || c;
              }),
              friendCards: prevState.board.friendCards.map((c) => {
                const updatedCard = updatedCards.find((uc) => uc.name === c.name);
                return updatedCard || c;
              }),
            },
            trash: prevState.trash.map((c) => {
              const updatedCard = updatedCards.find((uc) => uc.name === c.name);
              return updatedCard || c;
            }),
          };
        });
      })
      .catch((error) => {
        console.error('Error saving cards:', error);
      });
  };

  const handleDeleteCard = (cardName: string) => {
    if (!allCards) return;

    const updatedCards = allCards.filter((card) => card.name !== cardName);

    // Update the cards.json file
    fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cards: updatedCards }),
    })
      .then(() => {
        // Update the SWR cache with the new data
        mutateCards(updatedCards, false);

        // Force a re-render of all components by updating the state
        setGameState((prevState) => {
          // Create a new game state with the updated cards
          const newGameState = {
            ...prevState,
            market: {
              freeMarket: updatedCards.filter((card) => card.tier === 'Basic'),
              tier1: updatedCards.filter((card) => card.tier === 'Tier 1'),
              tier2: updatedCards.filter((card) => card.tier === 'Tier 2'),
              tier3: updatedCards.filter((card) => card.tier === 'Tier 3'),
            },
          };

          // Also update the hand and board with the updated cards
          return {
            ...newGameState,
            hand: prevState.hand.filter((c) => c.name !== cardName),
            board: {
              denCards: prevState.board.denCards.filter((c) => c.name !== cardName),
              friendCards: prevState.board.friendCards.filter((c) => c.name !== cardName),
            },
            trash: prevState.trash.filter((c) => c.name !== cardName),
          };
        });
      })
      .catch((error) => {
        console.error('Error deleting card:', error);
      });
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
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Raccoon Trash Scheme</h1>
          <nav className="main-nav">
            <Link to="/" className="nav-link">
              Game
            </Link>
            <Link to="/cards" className="nav-link">
              Cards
            </Link>
          </nav>
        </header>
        <main className="game-container">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <GameStats
                    food={gameStats.food}
                    trash={gameStats.trash}
                    victoryPoints={gameStats.victoryPoints}
                  />
                  <div className="game-controls">
                    <button className="control-button" onClick={handleShuffle}>
                      Shuffle
                    </button>
                    <button className="control-button" onClick={handleRestart}>
                      Restart
                    </button>
                  </div>
                  <div className="game-layout">
                    <GameBoard gameState={gameState} onCardClick={handleCardClick} />
                    <Market gameState={gameState} onCardClick={handleCardClick} />
                    <Hand
                      gameState={gameState}
                      onCardClick={handleCardClick}
                      onPlayCard={handleCardClick}
                    />
                  </div>
                </>
              }
            />
            <Route
              path="/cards"
              element={
                <Cards
                  allCards={allCards || []}
                  onEditCard={handleEditCard}
                  onDeleteCard={handleDeleteCard}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
