import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all cards
app.get('/api/cards', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'src', 'data', 'cards.json');
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading cards:', error);
    res.status(500).json({ error: 'Failed to read cards' });
  }
});

// Update cards
app.post('/api/cards', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'src', 'data', 'cards.json');
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Cards saved successfully' });
  } catch (error) {
    console.error('Error saving cards:', error);
    res.status(500).json({ error: 'Failed to save cards' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 