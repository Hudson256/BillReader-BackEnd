import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../config/logger';
import { MeasureErrors } from '../../../domain/exceptions/MeasureErrors';

interface ErrorResponse {
    status: number;
    body: { error: string };
}

const errorMap: Record<string, ErrorResponse> = {
    InvalidData: { status: 400, body: { error: 'Dados inválidos' } },
    ConfirmationDuplicate: { status: 409, body: { error: 'Operação duplicada' } },
    MeasureNotFound: { status: 404, body: { error: 'Medição não encontrada' } },
};

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(`${err.name}: ${err.message}`);

    const errorResponse = errorMap[err.name];
    if (errorResponse) {
        return res.status(errorResponse.status).json(errorResponse.body);
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
}
