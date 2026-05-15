const express = require('express');
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.use(authenticateToken);

// Get shopping list for client
router.get('/list', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;

  const items = db.prepare(`
    SELECT id, name, quantity, category, is_checked, created_at
    FROM shopping_list_items
    WHERE client_id = ?
    ORDER BY category, name
  `).all(clientId);

  res.json(items);
});

// Add item to shopping list
router.post('/item', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  const { name, quantity, category } = req.body;

  const stmt = db.prepare(`
    INSERT INTO shopping_list_items (client_id, name, quantity, category)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(clientId, name, quantity, category || 'PANTRY');
  res.json({ id: result.lastInsertRowid, name, quantity, category, is_checked: 0 });
});

// Add ingredients from meal to shopping list
router.post('/add-meal/:mealId', (req, res) => {
  try {
    const db = getDb();
    const clientId = req.user.clientId;
    const mealId = req.params.mealId;

    const meal = db.prepare(`
      SELECT id, name, ingredients FROM meal_ideas WHERE id = ?
    `).get(mealId);

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const ingredients = Array.isArray(meal.ingredients)
      ? meal.ingredients
      : JSON.parse(meal.ingredients || '[]');

    const categories = {
      'oats': 'GRAINS',
      'banana': 'PRODUCE',
      'milk': 'DAIRY',
      'almond': 'PANTRY',
      'chicken': 'PROTEIN',
      'fish': 'PROTEIN',
      'salmon': 'PROTEIN',
      'beef': 'PROTEIN',
      'turkey': 'PROTEIN',
      'egg': 'DAIRY',
      'yoghurt': 'DAIRY',
      'cheese': 'DAIRY',
      'rice': 'GRAINS',
      'pasta': 'GRAINS',
      'bread': 'GRAINS',
      'vegetable': 'PRODUCE',
      'carrot': 'PRODUCE',
      'broccoli': 'PRODUCE',
      'spinach': 'PRODUCE',
      'tomato': 'PRODUCE',
      'lettuce': 'PRODUCE',
      'onion': 'PRODUCE',
      'garlic': 'PANTRY',
      'oil': 'PANTRY',
      'honey': 'PANTRY',
      'jam': 'PANTRY',
      'sauce': 'PANTRY',
    };

    const checkStmt = db.prepare(`SELECT id FROM shopping_list_items WHERE client_id = ? AND LOWER(name) = LOWER(?)`);
    const insertStmt = db.prepare(`
      INSERT INTO shopping_list_items (client_id, name, quantity, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    let addedCount = 0;
    ingredients.forEach(ingredient => {
      let category = 'PANTRY';
      const ingredientLower = String(ingredient).toLowerCase();
      for (const [key, cat] of Object.entries(categories)) {
        if (ingredientLower.includes(key)) { category = cat; break; }
      }
      // Only add if not already in the list
      const existing = checkStmt.get(clientId, ingredient);
      if (!existing) {
        insertStmt.run(clientId, ingredient, '', category);
        addedCount++;
      }
    });

    res.json({ success: true, added: addedCount, mealName: meal.name });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({ error: error.message || 'Failed to add meal to shopping list' });
  }
});

// Toggle item checked status
router.put('/item/:id', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  const itemId = req.params.id;
  const { is_checked } = req.body;

  const stmt = db.prepare(`
    UPDATE shopping_list_items
    SET is_checked = ?, updated_at = datetime('now')
    WHERE id = ? AND client_id = ?
  `);

  stmt.run(is_checked ? 1 : 0, itemId, clientId);
  res.json({ success: true });
});

// Delete item from shopping list
router.delete('/item/:id', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  const itemId = req.params.id;

  const stmt = db.prepare(`
    DELETE FROM shopping_list_items
    WHERE id = ? AND client_id = ?
  `);

  stmt.run(itemId, clientId);
  res.json({ success: true });
});

// Clear all checked items
router.delete('/clear-bought', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;

  const stmt = db.prepare(`
    DELETE FROM shopping_list_items
    WHERE client_id = ? AND is_checked = 1
  `);

  stmt.run(clientId);
  res.json({ success: true });
});

module.exports = router;
