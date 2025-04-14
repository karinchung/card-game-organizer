// netlify/functions/api.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lockfile from 'proper-lockfile';

// Get the path to the cards.json file in the functions directory
const getCardsPath = () => {
  const __filename = fileURLToPath(import.meta.url);
  const functionDir = path.dirname(__filename);
  return path.join(functionDir, 'data', 'cards.json');
};

const CARDS_PATH = getCardsPath();
console.log('Cards path:', CARDS_PATH);

// In-memory cache
let cardsCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

async function getCards() {
  try {
    // Check cache first
    if (cardsCache && (Date.now() - lastCacheTime < CACHE_TTL)) {
      console.log('Returning cached cards data');
      return cardsCache;
    }

    console.log('Reading cards from file:', CARDS_PATH);
    const data = await fs.readFile(CARDS_PATH, 'utf8');
    console.log('Successfully read cards file');
    
    const parsedData = JSON.parse(data);
    console.log('Successfully parsed cards data');
    
    // Ensure we have a valid cards array
    if (!parsedData || !parsedData.cards || !Array.isArray(parsedData.cards)) {
      throw new Error('Invalid cards data structure');
    }
    
    cardsCache = parsedData;
    lastCacheTime = Date.now();
    return cardsCache;
  } catch (error) {
    console.error('Error in getCards:', error);
    throw error;
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
    throw new Error('Failed to update cards');
  } finally {
    if (release) {
      await release();
    }
  }
}

export const handler = async (event, context) => {
  console.log('API function called with method:', event.httpMethod);
  
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
      console.log('Processing GET request');
      const cardsData = await getCards();
      console.log('Cards data retrieved successfully');
      
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardsData),
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
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
}; 