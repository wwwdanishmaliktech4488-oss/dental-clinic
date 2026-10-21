import express from 'express';
import { pool } from '../db.js';
import { EnquiryCreateSchema, EnquiryStatusSchema } from '../schemas.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { sendEnquiryNotification } from '../services/email.js';

// THIS IS THE EXPORT NODE IS LOOKING FOR
export const enquiryRouter = express.Router(); 

// 🔓 PUBLIC ROUTE: Submit an enquiry
enquiryRouter.post('/', async (req, res, next) => {
  try {
    const data = EnquiryCreateSchema.parse(req.body);
    const id = randomUUID();

    const [clinics]: any = await pool.execute('SELECT id FROM clinics LIMIT 1');
    if (clinics.length === 0) {
      return res.status(500).json({ error: 'Clinic configuration missing' });
    }
    const clinicId = clinics[0].id;

    await pool.execute(
      `INSERT INTO enquiries (id, clinic_id, full_name, email, phone, preferred_contact_method, 
        preferred_contact_time, preferred_date, treatment_id, message, consent_granted, consent_version, consent_timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id, clinicId, data.fullName, data.email, data.phone || null, data.preferredContactMethod,
        data.preferredContactTime || null, data.preferredDate || null, data.treatmentId || null,
        data.message || null, data.consentGranted, 'v1'
      ]
    );

    void sendEnquiryNotification(data.fullName, data.email, data.phone || '', data.message || '');

    res.status(201).json({ 
      message: 'Enquiry received successfully', 
      id 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }
    next(error);
  }
});

// 🔒 PROTECTED ROUTE: Get all enquiries (Admin dashboard)
enquiryRouter.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const [enquiries]: any = await pool.execute(
      `SELECT id, full_name, email, phone, status, created_at 
       FROM enquiries 
       ORDER BY created_at DESC`
    );

    res.json({ enquiries });
  } catch (error) {
    next(error);
  }
});

// 🔒 PROTECTED ROUTE: Update enquiry status
enquiryRouter.patch('/:id/status', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid enquiry ID' });
    }
    const { status } = EnquiryStatusSchema.parse(req.body);

    const [result]: any = await pool.execute(
      `UPDATE enquiries SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ message: 'Status updated successfully', status });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: z.prettifyError(error) });
    }
    next(error);
  }
});
enquiryRouter.get('/export', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const [rows]: any = await pool.execute(
      `SELECT full_name, email, phone, status, created_at FROM enquiries ORDER BY created_at DESC`
    );
    
    // Convert to CSV
    const csv = [
      ['Name', 'Email', 'Phone', 'Status', 'Date'],
      ...rows.map((r: any) => [
        `"${r.full_name}"`, r.email, r.phone || '', r.status, new Date(r.created_at).toISOString()
      ])
    ].map(e => e.join(",")).join("\n");

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="enquiries.csv"');
    res.send(csv);
  } catch (error) { next(error); }
});