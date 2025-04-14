// netlify/functions/api.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lockfile from 'proper-lockfile';

// Get the path to the cards.json file in the functions directory
const getCardsPath = () => {
  // In Netlify, the function is deployed to /var/task/netlify/functions/
  // The data directory should be included in the deployment at /var/task/netlify/functions/data/
  const netlifyPath = '/var/task/netlify/functions/data/cards.json';
  
  // Try the Netlify path first
  try {
    if (fs.existsSync(netlifyPath)) {
      console.log('Found cards.json at Netlify path:', netlifyPath);
      return netlifyPath;
    }
  } catch (error) {
    console.error('Error checking Netlify path:', error);
  }
  
  // Try other possible paths
  const possiblePaths = [
    '/var/task/data/cards.json',
    path.join(process.cwd(), 'data', 'cards.json'),
    path.join(process.cwd(), 'netlify', 'functions', 'data', 'cards.json'),
    path.join(process.cwd(), 'data', 'cards.json')
  ];
  
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`Found cards.json at: ${filePath}`);
        return filePath;
      }
    } catch (error) {
      console.error(`Error checking path ${filePath}:`, error);
    }
  }
  
  // If no file is found, return the default path and log a warning
  console.warn(`No cards.json found in any of the expected locations. Using default path: ${netlifyPath}`);
  return netlifyPath;
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
    console.error('Error in updateCards:', error);
    throw error;
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      console.log('Handling GET request for cards');
      const cardsPath = getCardsPath();
      
      try {
        const cardsData = fs.readFileSync(cardsPath, 'utf8');
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: cardsData
        };
      } catch (error) {
        console.error('Error reading cards.json:', error);
        
        // If the file doesn't exist, return a default empty cards array
        if (error.code === 'ENOENT') {
          console.log('Cards file not found, returning default empty cards array');
          return {
            statusCode: 200,
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cards: [] })
          };
        }
        
        return {
          statusCode: 500,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: 'Failed to read cards data',
            details: error.message,
            path: cardsPath,
            stack: error.stack,
            code: error.code,
            errno: error.errno,
            syscall: error.syscall
          })
        };
      }
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