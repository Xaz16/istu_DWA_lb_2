const express = require('express');
const { query, param, body } = require('express-validator');
const { pool } = require('../db/pool');
const { sendValidationErrors } = require('../middleware/validate');

const router = express.Router();

function isValidCalendarDateString(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function utcTodayString() {
  const t = new Date();
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, '0');
  const d = String(t.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function visitDateNotInPast(value) {
  if (!isValidCalendarDateString(value)) return false;
  return value >= utcTodayString();
}

const visitDateQueryValidator = query('visitDate')
  .notEmpty()
  .withMessage('visitDate is required')
  .custom((v) => isValidCalendarDateString(v))
  .withMessage('visitDate must be a valid YYYY-MM-DD')
  .custom((v) => visitDateNotInPast(v))
  .withMessage('visitDate cannot be in the past');

const visitDateBodyValidator = body('visitDate')
  .notEmpty()
  .withMessage('visitDate is required')
  .custom((v) => isValidCalendarDateString(v))
  .withMessage('visitDate must be a valid YYYY-MM-DD')
  .custom((v) => visitDateNotInPast(v))
  .withMessage('visitDate cannot be in the past');

router.get('/halls', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, sort_order AS "sortOrder"
       FROM halls
       ORDER BY sort_order ASC, id ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/halls/:hallId/tables',
  [param('hallId').isInt({ min: 1 }).toInt(), visitDateQueryValidator],
  sendValidationErrors,
  async (req, res, next) => {
    const hallId = req.params.hallId;
    const visitDate = req.query.visitDate;
    try {
      const hall = await pool.query(`SELECT id FROM halls WHERE id = $1`, [hallId]);
      if (hall.rowCount === 0) {
        return res.status(404).json({ error: 'Hall not found' });
      }

      const { rows } = await pool.query(
        `SELECT t.id,
                t.hall_id AS "hallId",
                t.code,
                t.pos_x AS "posX",
                t.pos_y AS "posY",
                t.seat_count AS "seatCount",
                (b.id IS NOT NULL) AS booked
         FROM hall_tables t
         LEFT JOIN bookings b
           ON b.table_id = t.id AND b.visit_date = $2::date
         WHERE t.hall_id = $1
         ORDER BY t.code ASC, t.id ASC`,
        [hallId, visitDate]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/bookings',
  [
    body('tableId').isInt({ min: 1 }).toInt(),
    visitDateBodyValidator,
    body('guestCount').isInt({ min: 1 }).toInt(),
    body('contactName').trim().isLength({ min: 1, max: 255 }),
    body('contactPhone').trim().isLength({ min: 5, max: 64 }),
    body('contactEmail')
      .optional({ values: 'null' })
      .custom((v) => {
        if (v == null || v === '') return true;
        if (typeof v !== 'string') return false;
        const t = v.trim();
        if (t === '') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
      })
      .withMessage('contactEmail must be a valid email or empty'),
  ],
  sendValidationErrors,
  async (req, res, next) => {
    const { tableId, visitDate, guestCount, contactName, contactPhone, contactEmail } = req.body;
    const email =
      contactEmail == null || (typeof contactEmail === 'string' && contactEmail.trim() === '')
        ? null
        : String(contactEmail).trim();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const tableRes = await client.query(
        `SELECT id, seat_count FROM hall_tables WHERE id = $1 FOR UPDATE`,
        [tableId]
      );
      const tableRow = tableRes.rows[0];
      if (!tableRow) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Table not found' });
      }

      if (guestCount > tableRow.seat_count) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'guestCount exceeds table capacity',
          seatCount: tableRow.seat_count,
        });
      }

      const insert = await client.query(
        `INSERT INTO bookings (table_id, visit_date, guest_count, contact_name, contact_phone, contact_email)
         VALUES ($1, $2::date, $3, $4, $5, $6)
         ON CONFLICT (table_id, visit_date) DO NOTHING
         RETURNING id, table_id, visit_date, guest_count, contact_name, contact_phone, contact_email, created_at`,
        [tableId, visitDate, guestCount, contactName, contactPhone, email]
      );

      if (insert.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'This table is already booked for the selected date' });
      }

      await client.query('COMMIT');

      const row = insert.rows[0];
      res.status(201).json({
        id: row.id,
        tableId: row.table_id,
        visitDate: row.visit_date,
        guestCount: row.guest_count,
        contactName: row.contact_name,
        contactPhone: row.contact_phone,
        contactEmail: row.contact_email,
        createdAt: row.created_at,
      });
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (_) {
        /* ignore */
      }
      next(err);
    } finally {
      client.release();
    }
  }
);

module.exports = router;
