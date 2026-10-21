import express from 'express';
import { pool } from '../db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export const treatmentRouter = express.Router();

const TreatmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  pricingNote: z.string().optional(),
  published: z.boolean().default(false)
});

// PUBLIC: Get all published treatments
treatmentRouter.get('/', async (req, res, next) => {
  try {
    const [treatments]: any = await pool.execute(
      'SELECT id, name, description, pricing_note, published FROM treatments WHERE published = true'
    );
    res.json({ treatments });
  } catch (error) { next(error); }
});

// ADMIN: Create a new treatment
treatmentRouter.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = TreatmentSchema.parse(req.body);
    const id = randomUUID();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Get clinic ID
    const [clinics]: any = await pool.execute('SELECT id FROM clinics LIMIT 1');
    const clinicId = clinics[0].id;

    await pool.execute(
      `INSERT INTO treatments (id, clinic_id, name, slug, description, pricing_note, published) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, clinicId, data.name, slug, data.description, data.pricingNote || null, data.published]
    );
    res.status(201).json({ message: 'Treatment created', id });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: z.prettifyError(error) });
    next(error);
  }
});