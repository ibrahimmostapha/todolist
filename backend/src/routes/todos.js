const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    let query =
      'SELECT id, title, description, status, created_at, updated_at FROM todos WHERE user_id = $1';
    const params = [req.user.id];

    if (status === 'ongoing' || status === 'done') {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC, id DESC';

    const result = await pool.query(query, params);
    return res.status(200).json({ todos: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description =
      typeof req.body.description === 'string' ? req.body.description.trim() : '';

    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'Task title must be 200 characters or fewer.' });
    }

    const result = await pool.query(
      `INSERT INTO todos (user_id, title, description, status)
       VALUES ($1, $2, $3, 'ongoing')
       RETURNING id, title, description, status, created_at, updated_at`,
      [req.user.id, title, description]
    );

    return res.status(201).json({ todo: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const todoId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(todoId) || todoId <= 0) {
      return res.status(400).json({ error: 'Invalid todo ID.' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (req.body.title !== undefined) {
      const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
      if (!title) {
        return res.status(400).json({ error: 'Task title cannot be empty.' });
      }
      if (title.length > 200) {
        return res.status(400).json({ error: 'Task title must be 200 characters or fewer.' });
      }
      updates.push(`title = $${idx++}`);
      values.push(title);
    }

    if (req.body.description !== undefined) {
      const description =
        typeof req.body.description === 'string' ? req.body.description.trim() : '';
      updates.push(`description = $${idx++}`);
      values.push(description);
    }

    if (req.body.status !== undefined) {
      if (req.body.status !== 'ongoing' && req.body.status !== 'done') {
        return res.status(400).json({ error: "Status must be either 'ongoing' or 'done'." });
      }
      updates.push(`status = $${idx++}`);
      values.push(req.body.status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update.' });
    }

    updates.push('updated_at = NOW()');
    values.push(todoId, req.user.id);

    const result = await pool.query(
      `UPDATE todos
       SET ${updates.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING id, title, description, status, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found.' });
    }

    return res.status(200).json({ todo: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const todoId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(todoId) || todoId <= 0) {
      return res.status(400).json({ error: 'Invalid todo ID.' });
    }

    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
      [todoId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found.' });
    }

    return res.status(200).json({ message: 'Todo deleted.', id: result.rows[0].id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
