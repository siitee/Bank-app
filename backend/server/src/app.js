import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRouter from './routes/email.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', emailRouter);

app.get('/', (req, res) => {
  res.send('Bank Calculator API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['POST'],
    credentials: true
  }));