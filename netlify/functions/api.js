// netlify/functions/api.js
const fs = require('fs').promises;
const path = require('path');
const lockfile = require('proper-lockfile');

// Get the correct path for both local and Netlify environments
const getCardsPath = () => {
  try {
    // Try to get the path relative to the function
    const functionDir = path.dirname(__filename);
    const projectRoot = path.join(functionDir, '../..');
    return path.join(projectRoot, 'data', 'cards.json');
  } catch (error) {
    console.error('Error getting cards path:', error);
    // Fallback to process.cwd()
    return path.join(process.cwd(), 'data', 'cards.json');
  }
};

const CARDS_PATH = getCardsPath();

// In-memory cache
let cardsCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

async function getCards() {
  try {
    // Check cache first
    if (cardsCache && (Date.now() - lastCacheTime < CACHE_TTL)) {
      return cardsCache;
    }

    const data = await fs.readFile(CARDS_PATH, 'utf8');
    cardsCache = JSON.parse(data);
    lastCacheTime = Date.now();
    return cardsCache;
  } catch (error) {
    console.error('Error reading cards:', error);
    throw new Error('Failed to read cards');
  }
}

async function updateCards(newCards) {
  let release = null;
  try {
    // Acquire a lock before writing
    release = await lockfile.lock(CARDS_PATH, { 
      retries: 5,
      retryWait: 1000,
      stale: 10000
    });

    // Validate the data structure
    if (!Array.isArray(newCards?.cards)) {
      throw new Error('Invalid cards data structure');
    }

    // Write to temporary file first
    const tempPath = CARDS_PATH + '.tmp';
    await fs.writeFile(tempPath, JSON.stringify(newCards, null, 2));
    
    // Atomic rename
    await fs.rename(tempPath, CARDS_PATH);
    
    // Update cache
    cardsCache = newCards;
    lastCacheTime = Date.now();
  } catch (error) {
    console.error('Error updating cards:', error);
    throw new Error('Failed to update cards');
  } finally {
    if (release) {
      await release();
    }
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Handle GET request to fetch cards
    if (event.httpMethod === 'GET') {
      const cards = await getCards();
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cards),
      };
    }

    // Handle POST request to update cards
    if (event.httpMethod === 'POST') {
      const updatedCards = JSON.parse(event.body);
      await updateCards(updatedCards);
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Cards saved successfully' }),
      };
    }

    // Handle unsupported methods
    return {
      statusCode: 405,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 