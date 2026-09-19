const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Product = require('../models/Product');

// ==================== PAGES ====================

// Ukurasa wa admin chat
router.get('/chat', (req, res) => {
  res.render('admin-chat');
});

// Ukurasa wa admin bidhaa
router.get('/products', (req, res) => {
  res.render('admin-products');
});

// ==================== PRODUCTS API (ADMIN) ====================

// Ongeza bidhaa mpya
router.post('/api/products', async (req, res) => {
  try {
    const { name, price, imageUrl } = req.body;

    if (!name || !price || !imageUrl) {
      return res.status(400).json({ error: 'name, price na imageUrl zote zinahitajika' });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      imageUrl
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Futa bidhaa kwa ID
router.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Bidhaa haipatikani' });
    }

    res.json({ ok: true, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CHAT API (ADMIN) ====================

// Jumbe zote za chat (kutoka rooms zote)
router.get('/api/all-messages', async (req, res) => {
  try {
    const msgs = await Message.find().sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
