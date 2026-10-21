import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/error.js';
import { enquiryRouter } from './routes/enquiries.js';
import { treatmentRouter } from './routes/treatments.js';
import { followUpRouter } from './routes/followups.js';
import { dashboardRouter } from './routes/dashboard.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '100kb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/enquiries', enquiryRouter);
app.use('/api/treatments', treatmentRouter);
app.use('/api/followups', followUpRouter);
app.use('/api/dashboard', dashboardRouter);

// Error Handling (must be last)
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});