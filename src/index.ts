import express from 'express';
import measureRoutes from './infrastructure/interfaces/http/routes/measureRoutes';
import { errorHandler } from './infrastructure/interfaces/errors/ErrorHandler';
import { config } from './config/env';
import 'reflect-metadata';

const app = express();
app.use(express.json());

app.use('/api', measureRoutes);

app.use(errorHandler);

const port = config.port;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
