import express from 'express';
import cors from 'cors';
import matchRoutes from './routes/matches';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/matches', matchRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Cricket Scorer API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
