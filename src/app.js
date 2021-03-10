import express from 'express';
import logger from 'morgan';
import { config } from 'dotenv';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import authRouter from './routes/auth.route';
import tradRouter from './routes/trad.route';

config();

const app = express();

app.use(cors());

if (['development', 'production'].includes(process.env.NODE_ENV)) {
  app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

passport.initialize();

app.use('/auth', authRouter);
app.use('/translate', tradRouter)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(errorHandler);

export default app;
