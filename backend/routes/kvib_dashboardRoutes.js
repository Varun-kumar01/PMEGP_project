import express from 'express';
import {
  getYears,
  getYearWiseStats,
  getTotalStats,
  getYearDetails
} from '../controllers/kvib_dashboardController.js';

const router = express.Router();

router.get('/years', getYears);
router.get('/year-wise/:year', getYearWiseStats);
router.get('/totals', getTotalStats);
router.get('/details/:year', getYearDetails);


export default router;
