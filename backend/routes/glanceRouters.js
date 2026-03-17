import express from 'express';
import { getGlanceData, getGlanceYears } from '../controllers/glanceController.js';

const router = express.Router();

router.get('/years', getGlanceYears);
router.get('/data', getGlanceData);

export default router;
