
import express from 'express';
import { getFullVerificationReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/verification/full-report', getFullVerificationReport);

export default router;
