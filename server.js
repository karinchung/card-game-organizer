import express from 'express';
import cors from 'cors';
import { getCards, updateCards } from './server/cardManager.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all cards
app.get('/api/cards', async (req, res) => {
    try {
        const cards = await getCards();
        res.json(cards);
    } catch (error) {
        console.error('Error reading cards:', error);
        res.status(500).json({ error: 'Failed to read cards' });
    }
});

// Update cards
app.post('/api/cards', async (req, res) => {
    try {
        await updateCards(req.body);
        res.json({ message: 'Cards saved successfully' });
    } catch (error) {
        console.error('Error saving cards:', error);
        res.status(500).json({ error: 'Failed to save cards' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 