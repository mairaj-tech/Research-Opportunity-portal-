const express = require('express');
const router = express.Router();
const pool = require('../db');

// Validate required fields
function validateRequiredFields(body) {
  const required = [
    'title', 'description', 'research_area', 'faculty_name',
    'department', 'required_skills', 'available_positions',
    'application_deadline', 'status'
  ];
  const missing = required.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
  return missing;
}

// POST /api/opportunities — Create
router.post('/', async (req, res) => {
  try {
    const missing = validateRequiredFields(req.body);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    const { title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status } = req.body;

    const positions = parseInt(available_positions, 10);
    if (isNaN(positions) || positions < 1) {
      return res.status(400).json({ message: 'available_positions must be a positive integer' });
    }

    const deadline = new Date(application_deadline);
    if (isNaN(deadline.getTime())) {
      return res.status(400).json({ message: 'application_deadline must be a valid date' });
    }

    if (!['Open', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'status must be either Open or Closed' });
    }

    const [result] = await pool.execute(
      `INSERT INTO opportunities (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, research_area, faculty_name, department, required_skills, positions, application_deadline, status]
    );

    const [rows] = await pool.execute('SELECT * FROM opportunities WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/opportunities — Retrieve All
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM opportunities ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/opportunities/:id — Retrieve One
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM opportunities WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/opportunities/:id — Update
router.put('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT * FROM opportunities WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const allowed = ['title', 'description', 'research_area', 'faculty_name', 'department', 'required_skills', 'available_positions', 'application_deadline', 'status'];
    const updates = {};

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    if (updates.available_positions !== undefined) {
      const positions = parseInt(updates.available_positions, 10);
      if (isNaN(positions) || positions < 1) {
        return res.status(400).json({ message: 'available_positions must be a positive integer' });
      }
      updates.available_positions = positions;
    }

    if (updates.application_deadline !== undefined) {
      const deadline = new Date(updates.application_deadline);
      if (isNaN(deadline.getTime())) {
        return res.status(400).json({ message: 'application_deadline must be a valid date' });
      }
    }

    if (updates.status !== undefined && !['Open', 'Closed'].includes(updates.status)) {
      return res.status(400).json({ message: 'status must be either Open or Closed' });
    }

    if (updates.title !== undefined && updates.title.trim() === '') {
      return res.status(400).json({ message: 'title cannot be empty' });
    }

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    await pool.execute(`UPDATE opportunities SET ${setClauses} WHERE id = ?`, values);

    const [updated] = await pool.execute('SELECT * FROM opportunities WHERE id = ?', [req.params.id]);
    res.status(200).json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/opportunities/:id — Delete
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT * FROM opportunities WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    await pool.execute('DELETE FROM opportunities WHERE id = ?', [req.params.id]);
    res.status(200).json({ message: 'Opportunity deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
