import express, { Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();
import router from './routes';
import './utils/supabase';

const app = express();
app.use(express.json());
const port = 8000;

app.get('/', (res: Response, req: Request) => {
  res.send('Welcome to the API');
});

app.use('/api', router);

app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});