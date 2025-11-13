import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); 
app.use(express.json()); 
app.use('/api/users', userRoutes);
app.get('/', (req: Request, res: Response) => {
  res.send('Benvingut a la API de Compasity');
});
app.listen(PORT, () => {
  console.log(`[server]: Servidor corrent en http://localhost:${PORT}`);
});