import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Measure, MeasureType } from '../../domain/entities/Measure';
import { IMeasureRepository } from '../../domain/interfaces/IMeasureRepository';
import { GeminiAPI } from '../../infrastructure/external/GeminiAPI';
import { MeasureErrors } from '../../domain/exceptions/MeasureErrors';
import { logger } from '../../config/logger';
import { isBase64 } from 'validator';

const MAX_MEASURES_PER_PAGE = 50;

@injectable()
export class MeasureService {
    constructor(
        @inject('IMeasureRepository') private measureRepository: IMeasureRepository,
        @inject('GeminiAPI') private geminiAPI: GeminiAPI
    ) {}

    /**
     * Uploads a new measure
     * @param {string} image - Base64 encoded image
     * @param {string} customerCode - Customer code
     * @param {Date} measureDatetime - Measure date and time
     * @param {MeasureType} measureType - Type of measure (WATER or GAS)
     * @returns {Promise<UploadMeasureResult>}
     * @throws {MeasureErrors.InvalidType | MeasureErrors.DoubleReport}
     */
    async uploadMeasure(image: string, customerCode: string, measureDatetime: Date, measureType: MeasureType): Promise<UploadMeasureResult> {
        this.validateUploadParams(image, customerCode, measureDatetime, measureType);

        const existingMeasure = await this.measureRepository.findByMonthAndType(customerCode, measureType, measureDatetime);
        if (existingMeasure) {
            throw new MeasureErrors.DoubleReport();
        }

        const processedImage = await this.geminiAPI.processImage(image);
        const measure = new Measure(
            processedImage.measureUuid,
            customerCode,
            measureDatetime,
            measureType,
            processedImage.measureValue,
            processedImage.imageUrl
        );

        await this.measureRepository.save(measure);
        logger.info(`Measure saved: ${measure.measureUuid}`);

        return {
            image_url: measure.imageUrl,
            measure_value: measure.measureValue,
            measure_uuid: measure.measureUuid
        };
    }

    async confirmMeasure(measureUuid: string, confirmedValue: number): Promise<{ success: boolean }> {
        if (!measureUuid || typeof measureUuid !== 'string') {
            throw new MeasureErrors.InvalidData('UUID da medição inválido');
        }
        if (typeof confirmedValue !== 'number' || isNaN(confirmedValue)) {
            throw new MeasureErrors.InvalidData('Valor confirmado inválido');
        }

        const measure = await this.measureRepository.findByUuid(measureUuid);
        if (!measure) {
            throw new MeasureErrors.MeasureNotFound();
        }

        if (measure.isConfirmed) {
            throw new MeasureErrors.ConfirmationDuplicate();
        }

        measure.confirm(confirmedValue);
        await this.measureRepository.update(measure);
        logger.info(`Measure confirmed: ${measureUuid}`);

        return { success: true };
    }

    async listMeasures(customerCode: string, measureType?: string): Promise<ListMeasuresResult> {
        if (typeof customerCode !== 'string' || customerCode.trim() === '') {
            throw new MeasureErrors.InvalidData('Código do cliente inválido');
        }

        const type = measureType ? this.validateAndConvertMeasureType(measureType) : undefined;

        const measures = await this.measureRepository.findAllByCustomer(customerCode, type);
        if (measures.length === 0) {
            throw new MeasureErrors.MeasuresNotFound();
        }

        return {
            customer_code: customerCode,
            measures: measures.map(measure => ({
                measure_uuid: measure.measureUuid,
                measure_datetime: measure.measureDatetime,
                measure_type: measure.measureType,
                has_confirmed: measure.isConfirmed,
                image_url: measure.imageUrl
            }))
        };
    }

    private validateUploadParams(image: string, customerCode: string, measureDatetime: Date, measureType: MeasureType): void {
        if (!isBase64(image)) {
            throw new MeasureErrors.InvalidData('Imagem inválida: deve ser uma string base64');
        }
        if (typeof customerCode !== 'string' || customerCode.trim() === '') {
            throw new MeasureErrors.InvalidData('Código do cliente inválido');
        }
        if (!(measureDatetime instanceof Date) || isNaN(measureDatetime.getTime())) {
            throw new MeasureErrors.InvalidData('Data de medição inválida');
        }
        if (!Object.values(MeasureType).includes(measureType)) {
            throw new MeasureErrors.InvalidType();
        }
    }

    private validateAndConvertMeasureType(measureType: string): MeasureType {
        const upperCaseType = measureType.toUpperCase();
        if (upperCaseType !== 'WATER' && upperCaseType !== 'GAS') {
            throw new MeasureErrors.InvalidType();
        }
        return upperCaseType as MeasureType;
    }
}

interface UploadMeasureResult {
    image_url: string;
    measure_value: number;
    measure_uuid: string;
}

interface ListMeasuresResult {
    customer_code: string;
    measures: {
        measure_uuid: string;
        measure_datetime: Date;
        measure_type: string;
        has_confirmed: boolean;
        image_url: string;
    }[];
}
