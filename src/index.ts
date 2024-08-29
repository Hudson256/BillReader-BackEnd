import express from 'express';
import measureRoutes from './infrastructure/interfaces/http/routes/measureRoutes';
import { errorHandler } from './infrastructure/interfaces/errors/ErrorHandler';
import { config } from './config/env';
import 'reflect-metadata';

const app = express();
app.use(express.json());

app.use('/api', measureRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('BillReader-BackEnd está funcionando!');
});

const port = config.port || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
