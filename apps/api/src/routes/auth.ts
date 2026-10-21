import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { LoginSchema, RegisterSchema } from '../schemas.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export const authRouter = express.Router();

// Note: In production, this should be locked down so only a clinic admin can register new users.
authRouter.post('/register', async (req, res, next) => {
  try {
    const data = RegisterSchema.parse(req.body);
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);
    
    // Get the first clinic to attach this user to (for demo purposes)
    const [clinics]: any = await pool.execute('SELECT id FROM clinics LIMIT 1');
    if (clinics.length === 0) {
      return res.status(400).json({ error: 'No clinic exists. Please seed the database first.' });
    }
    const clinicId = clinics[0].id;

    const id = randomUUID();
    
    await pool.execute(
      `INSERT INTO users (id, clinic_id, name, email, password_hash, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, clinicId, data.name, data.email, passwordHash, data.role]
    );

    res.status(201).json({ message: 'User created successfully', id });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists in this clinic' });
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);

    const [users]: any = await pool.execute(
      `SELECT id, clinic_id, name, role, password_hash FROM users WHERE email = ? LIMIT 1`,
      [data.email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { sub: user.id, clinicId: user.clinic_id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({ 
      accessToken, 
      user: { id: user.id, name: user.name, role: user.role } 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }
    next(error);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const [users]: any = await pool.execute(
      `SELECT id, name, email, role FROM users WHERE id = ?`,
      [req.user!.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: users[0] });
  } catch (error) {
    next(error);
  }
});