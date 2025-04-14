// netlify/functions/api.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lockfile from 'proper-lockfile';

// Get the path to the cards.json file in the functions directory
const getCardsPath = () => {
  try {
    // In Netlify, the function is deployed to /var/task/netlify/functions/
    // The data directory should be included in the deployment
    const netlifyPath = '/var/task/netlify/functions/data/cards.json';
    
    // Check if the file exists at the Netlify path
    try {
      fs.accessSync(netlifyPath);
      console.log('Found cards.json at Netlify path:', netlifyPath);
      return netlifyPath;
    } catch (err) {
      console.log('Cards.json not found at Netlify path:', netlifyPath);
    }
    
    // Try the relative path from the function directory
    const functionDir = path.dirname(fileURLToPath(import.meta.url));
    const relativePath = path.join(functionDir, 'data', 'cards.json');
    
    try {
      fs.accessSync(relativePath);
      console.log('Found cards.json at relative path:', relativePath);
      return relativePath;
    } catch (err) {
      console.log('Cards.json not found at relative path:', relativePath);
    }
    
    // If we get here, we couldn't find the file
    console.error('Could not find cards.json in the expected location');
    
    // Return a default empty cards object
    return null;
  } catch (error) {
    console.error('Error in getCardsPath:', error);
    return null;
  }
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

    // If CARDS_PATH is null, return a default empty cards object
    if (!CARDS_PATH) {
      console.log('No cards.json file found, returning default empty cards object');
      const defaultCards = { cards: [] };
      cardsCache = defaultCards;
      lastCacheTime = Date.now();
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
    // Return a default empty cards object
    const defaultCards = { cards: [] };
    cardsCache = defaultCards;
    lastCacheTime = Date.now();
    return cardsCache;
  }
}

async function updateCards(newCards) {
  // If CARDS_PATH is null, we can't update the file
  if (!CARDS_PATH) {
    console.log('No cards.json file found, cannot update cards');
    // Just update the cache
    cardsCache = newCards;
    lastCacheTime = Date.now();
    return;
  }

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
    console.error('Error in updateCards:', error);
    // Just update the cache
    cardsCache = newCards;
    lastCacheTime = Date.now();
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
      console.log('Handling GET request for cards');
      const cards = await getCards();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cards),
      };
    }

    // Handle POST request to update cards
    if (event.httpMethod === 'POST') {
      console.log('Handling POST request to update cards');
      const body = JSON.parse(event.body || '{}');
      await updateCards(body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // Handle unsupported methods
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error in handler:', error);
    
    // Return a more detailed error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
}; 