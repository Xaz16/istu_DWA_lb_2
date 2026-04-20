const express = require('express');
const { query } = require('express-validator');
const { pool } = require('../db/pool');
const { requireAuth } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/requireAdmin');
const { sendValidationErrors } = require('../middleware/validate');

const router = express.Router();

const limitValidators = [
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
];

router.get(
  '/admin/bookings',
  requireAuth,
  requireAdmin,
  limitValidators,
  sendValidationErrors,
  async (req, res, next) => {
    const limit = req.query.limit != null ? req.query.limit : 100;
    try {
      const { rows } = await pool.query(
        `SELECT b.id,
                b.visit_date AS "visitDate",
                b.guest_count AS "guestCount",
                b.contact_name AS "contactName",
                b.contact_phone AS "contactPhone",
                b.contact_email AS "contactEmail",
                b.created_at AS "createdAt",
                t.code AS "tableCode",
                h.name AS "hallName"
         FROM bookings b
         JOIN hall_tables t ON t.id = b.table_id
         JOIN halls h ON h.id = t.hall_id
         ORDER BY b.created_at DESC, b.id DESC
         LIMIT $1`,
        [limit]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/admin/reviews',
  requireAuth,
  requireAdmin,
  limitValidators,
  sendValidationErrors,
  async (req, res, next) => {
    const limit = req.query.limit != null ? req.query.limit : 100;
    try {
      const { rows } = await pool.query(
        `SELECT r.id,
                r.author_name AS "authorName",
                r.body,
                r.photo_url AS "photoUrl",
                r.created_at AS "createdAt",
                d.id AS "dishId",
                d.name AS "dishName"
         FROM reviews r
         JOIN dishes d ON d.id = r.dish_id
         ORDER BY r.created_at DESC, r.id DESC
         LIMIT $1`,
        [limit]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
