import express from 'express';
import { getAllCbcData, getCbcDataById } from '../controllers/cbc_data_tableController.js';

const router = express.Router();


router.get('/', getAllCbcData);


router.get('/:id', getCbcDataById);

export default router;