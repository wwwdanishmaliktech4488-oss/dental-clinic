import express from 'express';
import { pool } from '../db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export const followUpRouter = express.Router();

const TaskSchema = z.object({
  enquiryId: z.string().uuid(),
  dueAt: z.string(), // ISO string
  notes: z.string().optional(),
});

// GET all pending tasks
followUpRouter.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const [tasks]: any = await pool.execute(
      `SELECT t.id, t.due_at, t.notes, t.status, e.full_name as patient_name, e.id as enquiry_id
       FROM follow_up_tasks t
       JOIN enquiries e ON t.enquiry_id = e.id
       WHERE t.status = 'pending' ORDER BY t.due_at ASC`
    );
    res.json({ tasks });
  } catch (error) { next(error); }
});

// CREATE a task
followUpRouter.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = TaskSchema.parse(req.body);
    const id = randomUUID();
    const [clinics]: any = await pool.execute('SELECT id FROM clinics LIMIT 1');

    await pool.execute(
      `INSERT INTO follow_up_tasks (id, clinic_id, enquiry_id, assigned_to, due_at, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, clinics[0].id, data.enquiryId, req.user!.id, data.dueAt, data.notes || null]
    );
    res.status(201).json({ message: 'Task created', id });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: z.prettifyError(error) });
    next(error);
  }
});