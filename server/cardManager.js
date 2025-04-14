import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import lockfile from 'proper-lockfile';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARDS_PATH = path.join(__dirname, '..', 'data', 'cards.json');

// In-memory cache
let cardsCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

export async function getCards() {
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

export async function updateCards(newCards) {
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