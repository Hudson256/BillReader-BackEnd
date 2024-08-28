import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../config/logger';
import { MeasureErrors } from '../../../domain/exceptions/MeasureErrors';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(`${err.name}: ${err.message}`);

    if (err instanceof MeasureErrors.InvalidData) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof MeasureErrors.DoubleReport) {
        return res.status(409).json({ error: err.message });
    }
    if (err instanceof MeasureErrors.MeasureNotFound) {
        return res.status(404).json({ error: err.message });
    }
    if (err instanceof MeasureErrors.ConfirmationDuplicate) {
        return res.status(409).json({ error: err.message });
    }
    if (err instanceof MeasureErrors.InvalidType) {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal Server Error' });
}
