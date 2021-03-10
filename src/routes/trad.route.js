import { Router } from 'express';
import tradController from '../controllers/trad.controller';
import catchAsync from '../middleware/catchAsync';
import authentication from '../middleware/authenticate';

const {
  translateText,
  voiceToText,
} = tradController;

const { authenticate } = authentication;

const tradRouter = Router();


tradRouter.post('/text', authenticate, catchAsync(translateText));
tradRouter.post('/voice', authenticate, catchAsync(voiceToText))
export default tradRouter;
