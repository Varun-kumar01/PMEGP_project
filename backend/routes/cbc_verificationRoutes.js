import express from 'express';
import multer from 'multer';
import { 
  submitCbcWorkingDetails, 
  submitCbcNotWorkingDetails,
  storeCbcVerifiedData
} from '../controllers/cbc_verificationController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); 


router.post('/cbc/submit-working', upload.array('working_photos', 5), submitCbcWorkingDetails);
router.post('/cbc/submit-not-working', upload.array('not_working_photos', 5), submitCbcNotWorkingDetails);


router.post('/cbc-verified-data', storeCbcVerifiedData);

export default router;