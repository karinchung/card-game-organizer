// netlify/functions/api.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lockfile from 'proper-lockfile';

// Get the path to the cards.json file in the functions directory
const getCardsPath = () => {
  try {
    // Try multiple possible locations for the cards.json file
    const possiblePaths = [
      // Try the data directory in the functions folder
      path.join(process.cwd(), 'netlify', 'functions', 'data', 'cards.json'),
      // Try the data directory in the root
      path.join(process.cwd(), 'data', 'cards.json'),
      // Try the functions directory
      path.join(process.cwd(), 'netlify', 'functions', 'cards.json'),
      // Fallback to a hardcoded path
      '/var/task/netlify/functions/data/cards.json'
    ];

    // Try each path and return the first one that exists
    for (const p of possiblePaths) {
      try {
        // Check if the file exists
        fs.accessSync(p);
        console.log('Found cards.json at:', p);
        return p;
      } catch (err) {
        console.log('Path not found:', p);
        // Continue to the next path
      }
    }

    // If we get here, we couldn't find the file
    console.error('Could not find cards.json in any of the expected locations');
    
    // Create a default cards.json file if it doesn't exist
    const defaultPath = path.join(process.cwd(), 'netlify', 'functions', 'data', 'cards.json');
    console.log('Creating default cards.json at:', defaultPath);
    
    // Ensure the directory exists
    const dir = path.dirname(defaultPath);
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }
    
    // Create a default cards.json file
    const defaultCards = { cards: [] };
    fs.writeFileSync(defaultPath, JSON.stringify(defaultCards, null, 2));
    
    return defaultPath;
  } catch (error) {
    console.error('Error in getCardsPath:', error);
    // Return a fallback path
    return '/tmp/cards.json';
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