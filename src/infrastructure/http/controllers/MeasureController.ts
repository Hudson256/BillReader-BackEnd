import express, { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { MeasureService } from '../../../application/services/MeasureService';
import { MeasureErrors } from '../../../domain/exceptions/MeasureErrors';
import { MeasureType } from '../../../domain/entities/Measure';

@injectable()
export class MeasureController {
    constructor(
        @inject(MeasureService) private measureService: MeasureService
    ) {}

    async uploadMeasure(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { image, customer_code, measure_datetime, measure_type } = req.body;

            const result = await this.measureService.uploadMeasure(
                image,
                customer_code,
                new Date(measure_datetime),
                measure_type as MeasureType
            );

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof MeasureErrors.InvalidData) {
                res.status(400).json({
                    error_code: 'INVALID_DATA',
                    error_description: error.message
                });
            } else if (error instanceof MeasureErrors.ConfirmationDuplicate) {
                res.status(409).json({
                    error_code: 'DOUBLE_REPORT',
                    error_description: 'Já existe uma leitura para este tipo no mês atual'
                });
            } else {
                next(error);
            }
        }
    }

    async confirmMeasure(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { measure_uuid, confirmed_value } = req.body;

            const result = await this.measureService.confirmMeasure(measure_uuid, confirmed_value);

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof MeasureErrors.InvalidData) {
                res.status(400).json({
                    error_code: 'INVALID_DATA',
                    error_description: error.message
                });
            } else if (error instanceof MeasureErrors.MeasureNotFound) {
                res.status(404).json({
                    error_code: 'MEASURE_NOT_FOUND',
                    error_description: 'Leitura não encontrada'
                });
            } else if (error instanceof MeasureErrors.ConfirmationDuplicate) {
                res.status(409).json({
                    error_code: 'CONFIRMATION_DUPLICATE',
                    error_description: 'Leitura do mês já realizada'
                });
            } else {
                next(error);
            }
        }
    }

    async listMeasures(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { customer_code } = req.params;
            const { measure_type } = req.query;

            const result = await this.measureService.listMeasures(
                customer_code,
                measure_type as string | undefined
            );

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof MeasureErrors.InvalidData) {
                res.status(400).json({
                    error_code: 'INVALID_TYPE',
                    error_description: 'Tipo de medição não permitida'
                });
            } else if (error instanceof MeasureErrors.MeasureNotFound) {
                res.status(404).json({
                    error_code: 'MEASURES_NOT_FOUND',
                    error_description: 'Nenhuma leitura encontrada'
                });
            } else {
                next(error);
            }
        }
    }
}
