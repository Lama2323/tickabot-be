import express, { Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import router from './routes';
import './utils/supabase';

import { errorHandler } from './utils/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());
const port = 8000;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the API');
});

app.use('/api', router);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});