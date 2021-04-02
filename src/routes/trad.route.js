import { Router } from 'express';
import tradController from '../controllers/trad.controller';
import catchAsync from '../middleware/catchAsync';
import authentication from '../middleware/authenticate';
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  translateText,
  voiceToText,
  photoToText,
  translateDocument,
} = tradController;

const { authenticate } = authentication;

const tradRouter = Router();


tradRouter.post('/text', authenticate, catchAsync(translateText));
tradRouter.post('/voice', authenticate, catchAsync(voiceToText));
tradRouter.post('/photo', authenticate, upload.single("photo"), catchAsync(photoToText));
tradRouter.post('/document', authenticate, upload.any(), catchAsync(translateDocument))
export default tradRouter;
