import 'reflect-metadata';
import { MeasureService } from './MeasureService';
import { IMeasureRepository } from '../../domain/interfaces/IMeasureRepository';
import { GeminiAPI } from '../../infrastructure/external/GeminiAPI';
import { Measure, MeasureType } from '../../domain/entities/Measure';
import { MeasureErrors } from '../../domain/exceptions/MeasureErrors';

jest.mock('../../infrastructure/external/GeminiAPI');
jest.mock('../../config/logger', () => ({
    logger: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    },
}));

describe('MeasureService', () => {
    let measureService: MeasureService;
    let mockRepository: jest.Mocked<IMeasureRepository>;
    let mockGeminiAPI: jest.Mocked<GeminiAPI>;

    beforeEach(() => {
        mockRepository = {
            save: jest.fn(),
            update: jest.fn(),
            findByUuid: jest.fn(),
            findByMonthAndType: jest.fn(),
            findAllByCustomer: jest.fn(),
        };
        mockGeminiAPI = {
            processImage: jest.fn(),
        } as unknown as jest.Mocked<GeminiAPI>;

        measureService = new MeasureService(mockRepository, mockGeminiAPI);
    });

    describe('uploadMeasure', () => {
        it('deve fazer upload de uma nova medição com sucesso', async () => {
            const validBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
            const mockCustomerCode = 'CUST001';
            const mockMeasureDatetime = new Date();
            const mockMeasureType = MeasureType.WATER;

            mockRepository.findByMonthAndType.mockResolvedValue(null);
            mockGeminiAPI.processImage.mockResolvedValue({
                measureUuid: 'uuid123',
                measureValue: 100,
                imageUrl: 'http://example.com/image.jpg',
            });

            const result = await measureService.uploadMeasure(
                validBase64Image,
                mockCustomerCode,
                mockMeasureDatetime,
                mockMeasureType
            );

            expect(result).toEqual({
                image_url: 'http://example.com/image.jpg',
                measure_value: 100,
                measure_uuid: 'uuid123',
            });
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('deve lançar erro para tipo de medição inválido', async () => {
            const validBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
            await expect(
                measureService.uploadMeasure(validBase64Image, 'CUST001', new Date(), 'INVALID' as MeasureType)
            ).rejects.toThrow(MeasureErrors.InvalidData);
        });

        it('deve lançar erro para relatório duplicado', async () => {
            const validBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
            const mockDate = new Date();
            mockRepository.findByMonthAndType.mockResolvedValue(new Measure('uuid', 'CUST001', mockDate, MeasureType.WATER, 100, 'url'));

            await expect(
                measureService.uploadMeasure(validBase64Image, 'CUST001', mockDate, MeasureType.WATER)
            ).rejects.toThrow(MeasureErrors.ConfirmationDuplicate);
        });
    });

    describe('confirmMeasure', () => {
        it('deve confirmar uma medição com sucesso', async () => {
            const mockMeasure = new Measure('uuid123', 'CUST001', new Date(), MeasureType.WATER, 100, 'url');
            mockRepository.findByUuid.mockResolvedValue(mockMeasure);

            const result = await measureService.confirmMeasure('uuid123', 110);

            expect(result).toEqual({ success: true });
            expect(mockRepository.update).toHaveBeenCalled();
        });

        it('deve lançar erro para medição não encontrada', async () => {
            mockRepository.findByUuid.mockResolvedValue(null);

            await expect(
                measureService.confirmMeasure('nonexistent', 100)
            ).rejects.toThrow(MeasureErrors.MeasureNotFound);
        });
    });

    describe('listMeasures', () => {
        it('deve listar medições para um cliente', async () => {
            const mockMeasures = [
                new Measure('uuid1', 'CUST001', new Date(), MeasureType.WATER, 100, 'url1'),
                new Measure('uuid2', 'CUST001', new Date(), MeasureType.GAS, 200, 'url2'),
            ];
            mockRepository.findAllByCustomer.mockResolvedValue(mockMeasures);

            const result = await measureService.listMeasures('CUST001');

            expect(result).toEqual({
                customer_code: 'CUST001',
                measures: expect.arrayContaining([
                    expect.objectContaining({ measure_uuid: 'uuid1' }),
                    expect.objectContaining({ measure_uuid: 'uuid2' }),
                ]),
            });
        });

        it('deve filtrar medições por tipo', async () => {
            const mockMeasures = [
                new Measure('uuid1', 'CUST001', new Date(), MeasureType.WATER, 100, 'url1'),
            ];
            mockRepository.findAllByCustomer.mockResolvedValue(mockMeasures);

            const result = await measureService.listMeasures('CUST001', 'WATER');

            expect(result.measures).toHaveLength(1);
            expect(result.measures[0]).toHaveProperty('measure_type', 'WATER');
        });
    });
});
