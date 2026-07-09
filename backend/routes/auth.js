const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Student } = require('../models');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, target_role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const student = await Student.create({
      name,
      email,
      password_hash,
      target_role: target_role || 'Software Engineer'
    });

    const token = jwt.sign({ id: student.id, email: student.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        target_role: student.target_role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register student' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const student = await Student.findOne({ where: { email } });
    if (!student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, student.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: student.id, email: student.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        target_role: student.target_role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET CURRENT USER PROFILE
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByPk(req.studentId, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
});

// UPDATE PROFILE (TARGET ROLE)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, target_role } = req.body;
    const student = await Student.findByPk(req.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (name) student.name = name;
    if (target_role !== undefined) student.target_role = target_role;
    
    await student.save();
    
    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      target_role: student.target_role
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
