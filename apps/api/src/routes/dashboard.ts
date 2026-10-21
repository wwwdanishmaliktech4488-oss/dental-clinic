import express from 'express';
import { pool } from '../db.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const dashboardRouter = express.Router();

dashboardRouter.get('/reports', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    // 1. Enquiries by Status
    const [statusRows]: any = await pool.execute(
      `SELECT status, COUNT(*) as count FROM enquiries GROUP BY status`
    );

    // 2. Enquiries by Treatment Interest
    const [treatmentRows]: any = await pool.execute(
      `SELECT t.name, COUNT(e.id) as count 
       FROM treatments t 
       LEFT JOIN enquiries e ON e.treatment_id = t.id 
       GROUP BY t.id, t.name`
    );

    // 3. Total Enquiries Over Time (Last 30 days)
    const [timeRows]: any = await pool.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM enquiries 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`
    );

    res.json({
      byStatus: statusRows,
      byTreatment: treatmentRows,
      overTime: timeRows
    });
  } catch (error) {
    next(error);
  }
});