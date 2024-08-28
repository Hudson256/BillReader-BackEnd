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

    private handleError(error: Error, res: Response, next: NextFunction) {
        const errorMap = {
            [MeasureErrors.InvalidData.name]: () => res.status(400).json({ error_code: 'INVALID_DATA', error_description: error.message }),
            [MeasureErrors.ConfirmationDuplicate.name]: () => res.status(409).json({ error_code: 'DOUBLE_REPORT', error_description: error.message }),
            [MeasureErrors.MeasureNotFound.name]: () => res.status(404).json({ error_code: 'MEASURE_NOT_FOUND', error_description: error.message })
        };

        const errorHandler = errorMap[error.constructor.name];
        return errorHandler ? errorHandler() : next(error);
    }

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
            this.handleError(error as Error, res, next);
        }
    }

    async confirmMeasure(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { measure_uuid, confirmed_value } = req.body;
            const result = await this.measureService.confirmMeasure(measure_uuid, confirmed_value);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error as Error, res, next);
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
            this.handleError(error as Error, res, next);
        }
    }
}
