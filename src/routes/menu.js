const express = require('express');
const { query, param } = require('express-validator');
const { pool } = require('../db/pool');
const { sendValidationErrors } = require('../middleware/validate');

const router = express.Router();

function mapDish(row) {
  return {
    id: row.id,
    sectionId: row.section_id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    weightG: row.weight_g,
    calories: row.calories,
    hasAllergens: row.has_allergens,
    isSpicy: row.is_spicy,
    kidFriendly: row.kid_friendly,
    createdAt: row.created_at,
  };
}

router.get(
  '/sections',
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, name, sort_order AS "sortOrder"
         FROM menu_sections
         ORDER BY sort_order ASC, id ASC`
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

const dishesQueryValidators = [
  query('sectionId').optional().isInt({ min: 1 }).toInt(),
  query('minWeight').optional().isInt({ min: 0 }).toInt(),
  query('maxWeight').optional().isInt({ min: 0 }).toInt(),
  query('minCalories').optional().isInt({ min: 0 }).toInt(),
  query('maxCalories').optional().isInt({ min: 0 }).toInt(),
  query('hasAllergens').optional().isIn(['true', 'false']),
  query('isSpicy').optional().isIn(['true', 'false']),
  query('kidFriendly').optional().isIn(['true', 'false']),
  query('q')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('q must be 1–200 characters'),
  query().custom((value, { req }) => {
    const { minWeight, maxWeight, minCalories, maxCalories } = req.query;
    if (minWeight != null && maxWeight != null && minWeight > maxWeight) {
      throw new Error('minWeight must be less than or equal to maxWeight');
    }
    if (minCalories != null && maxCalories != null && minCalories > maxCalories) {
      throw new Error('minCalories must be less than or equal to maxCalories');
    }
    return true;
  }),
];

router.get('/dishes', dishesQueryValidators, sendValidationErrors, async (req, res, next) => {
  try {
    const conditions = [];
    const params = [];
    let n = 1;

    const {
      sectionId,
      minWeight,
      maxWeight,
      minCalories,
      maxCalories,
      hasAllergens,
      isSpicy,
      kidFriendly,
      q,
    } = req.query;

    if (sectionId != null) {
      conditions.push(`d.section_id = $${n++}`);
      params.push(sectionId);
    }
    if (minWeight != null) {
      conditions.push(`d.weight_g >= $${n++}`);
      params.push(minWeight);
    }
    if (maxWeight != null) {
      conditions.push(`d.weight_g <= $${n++}`);
      params.push(maxWeight);
    }
    if (minCalories != null) {
      conditions.push(`d.calories >= $${n++}`);
      params.push(minCalories);
    }
    if (maxCalories != null) {
      conditions.push(`d.calories <= $${n++}`);
      params.push(maxCalories);
    }
    if (hasAllergens != null) {
      conditions.push(`d.has_allergens = $${n++}`);
      params.push(hasAllergens === 'true');
    }
    if (isSpicy != null) {
      conditions.push(`d.is_spicy = $${n++}`);
      params.push(isSpicy === 'true');
    }
    if (kidFriendly != null) {
      conditions.push(`d.kid_friendly = $${n++}`);
      params.push(kidFriendly === 'true');
    }
    if (q) {
      conditions.push(`position(lower($${n++}::text) in lower(d.name)) > 0`);
      params.push(q);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT d.id, d.section_id, d.name, d.description, d.image_url, d.weight_g, d.calories,
             d.has_allergens, d.is_spicy, d.kid_friendly, d.created_at
      FROM dishes d
      ${where}
      ORDER BY d.id ASC
    `;
    const { rows } = await pool.query(sql, params);
    res.json(rows.map(mapDish));
  } catch (err) {
    next(err);
  }
});

router.get(
  '/dishes/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  sendValidationErrors,
  async (req, res, next) => {
    const id = req.params.id;
    try {
      const dishResult = await pool.query(
        `SELECT d.id, d.section_id, d.name, d.description, d.image_url, d.weight_g, d.calories,
                d.has_allergens, d.is_spicy, d.kid_friendly, d.created_at,
                s.name AS section_name
         FROM dishes d
         JOIN menu_sections s ON s.id = d.section_id
         WHERE d.id = $1`,
        [id]
      );
      const dishRow = dishResult.rows[0];
      if (!dishRow) {
        return res.status(404).json({ error: 'Dish not found' });
      }

      const [ingredients, reviews] = await Promise.all([
        pool.query(
          `SELECT id, name, sort_order AS "sortOrder"
           FROM dish_ingredients
           WHERE dish_id = $1
           ORDER BY sort_order ASC, id ASC`,
          [id]
        ),
        pool.query(
          `SELECT id, author_name AS "authorName", body, photo_url AS "photoUrl", created_at AS "createdAt"
           FROM reviews
           WHERE dish_id = $1
           ORDER BY created_at DESC, id DESC`,
          [id]
        ),
      ]);

      const base = mapDish(dishRow);
      res.json({
        ...base,
        sectionName: dishRow.section_name,
        ingredients: ingredients.rows,
        reviews: reviews.rows,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
