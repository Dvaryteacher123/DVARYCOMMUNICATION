const express = require('express');
const axios = require('axios');
const router = express.Router();
const Message = require('../models/Message');
const Product = require('../models/Product');

// ==================== PAGES ====================

// Ukurasa wa mteja (chat + bidhaa)
router.get('/', (req, res) => {
  res.render('chat');
});

// Ukurasa wa AI
router.get('/ai', (req, res) => {
  res.render('ai');
});

// ==================== CHAT API ====================

// Chukua jumbe zote za room fulani
router.get('/api/messages/:roomId', async (req, res) => {
  try {
    const msgs = await Message.find({ roomId: req.params.roomId }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tuma ujumbe mpya
router.post('/api/messages', async (req, res) => {
  try {
    const { roomId, sender, text } = req.body;

    if (!roomId || !sender || !text) {
      return res.status(400).json({ error: 'roomId, sender na text zote zinahitajika' });
    }

    const msg = await Message.create({ roomId, sender, text });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PRODUCTS API ====================

// Bidhaa zote (kwa mteja kuona)
router.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== OPENROUTER AI ====================

router.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt inahitajika' });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Wewe ni msaidizi wa DVaryHub. Jibu kwa Kiswahili kifupi, wazi na kwa heshima.'
          },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'DVaryHub'
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('OpenRouter error:', err.response?.data || err.message);
    res.status(500).json({ error: 'AI imeshindwa kujibu kwa sasa' });
  }
});

module.exports = router;
