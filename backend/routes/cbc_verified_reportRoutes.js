import express from 'express';
import { getCbcVerifiedReport } from '../controllers/cbc_verified_reportcontroller.js';

const router = express.Router();


router.get('/cbc-verified-report', getCbcVerifiedReport);

export default router;