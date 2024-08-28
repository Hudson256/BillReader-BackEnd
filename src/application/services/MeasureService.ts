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
        // Validar o tipo de dados dos parâmetros
        if (!isBase64(image.split(',')[1])) {
            throw new MeasureErrors.InvalidData('Imagem inválida: deve ser uma string base64');
        }
        if (typeof customerCode !== 'string' || customerCode.trim() === '') {
            throw new MeasureErrors.InvalidData('Código do cliente inválido');
        }
        if (!(measureDatetime instanceof Date) || isNaN(measureDatetime.getTime())) {
            throw new MeasureErrors.InvalidData('Data de medição inválida');
        }
        if (!Object.values(MeasureType).includes(measureType)) {
            throw new MeasureErrors.InvalidData('Tipo de medição inválido');
        }

        // Verificar se já existe uma leitura no mês
        const existingMeasure = await this.measureRepository.findByMonthAndType(customerCode, measureType, measureDatetime);
        if (existingMeasure) {
            throw new MeasureErrors.ConfirmationDuplicate('Já existe uma leitura para este tipono mês atual');
        }

        // Integrar com a API de LLM (Gemini) para extrair o valor da imagem
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
        // Validar o tipo de dados dos parâmetros
        if (typeof measureUuid !== 'string' || measureUuid.trim() === '') {
            throw new MeasureErrors.InvalidData('Os dados fornecidos no corpo darequisição são inválidos');
        }
        if (typeof confirmedValue !== 'number' || isNaN(confirmedValue)) {
            throw new MeasureErrors.InvalidData('Os dados fornecidos no corpo darequisição são inválidos');
        }

        // Verificar se o código de leitura informado existe
        const measure = await this.measureRepository.findByUuid(measureUuid);
        if (!measure) {
            throw new MeasureErrors.MeasureNotFound('Leitura não encontrada');
        }

        // Verificar se o código de leitura já foi confirmado
        if (measure.isConfirmed) {
            throw new MeasureErrors.ConfirmationDuplicate('Leitura do mês já realizada');
        }

        // Salvar no banco de dados o novo valor informado
        measure.confirm(confirmedValue);
        await this.measureRepository.update(measure);
        
        logger.info(`Medição confirmada: ${measureUuid}`);

        return { success: true };
    }

    async listMeasures(customerCode: string, measureType?: string): Promise<ListMeasuresResult> {
        if (measureType && !this.isValidMeasureType(measureType)) {
            throw new MeasureErrors.InvalidData('Parâmetro measure typediferente de WATER ou GAS');
        }

        const type = measureType ? measureType.toUpperCase() as MeasureType : undefined;
        const measures = await this.measureRepository.findAllByCustomer(customerCode, type);

        if (measures.length === 0) {
            throw new MeasureErrors.MeasureNotFound('Nenhum registro encontrado');
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

    private isValidMeasureType(type: string): boolean {
        return Object.values(MeasureType).includes(type.toUpperCase() as MeasureType);
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
