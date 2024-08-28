import 'reflect-metadata';
import { MeasureService } from './MeasureService';
import { IMeasureRepository } from '../../domain/interfaces/IMeasureRepository';
import { GeminiAPI } from '../../infrastructure/external/GeminiAPI';
import { Measure, MeasureType } from '../../domain/entities/Measure';
import { MeasureErrors } from '../../domain/exceptions/MeasureErrors';

jest.mock('validator', () => ({
    isBase64: jest.fn().mockImplementation((str) => str === 'validBase64String')
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
        const validBase64Image = 'validBase64String';
        const mockDate = new Date('2023-01-01');

        it('deve fazer upload de uma nova medição com sucesso', async () => {
            mockRepository.findByMonthAndType.mockResolvedValue(null);
            mockGeminiAPI.processImage.mockResolvedValue({
                measureUuid: 'mock-uuid',
                measureValue: 100,
                imageUrl: 'http://example.com/image.jpg'
            });

            const result = await measureService.uploadMeasure(validBase64Image, 'CUST001', mockDate, MeasureType.WATER);

            expect(result).toEqual({
                image_url: 'http://example.com/image.jpg',
                measure_value: 100,
                measure_uuid: 'mock-uuid'
            });
        });

        it('deve lançar erro para relatório duplicado', async () => {
            mockRepository.findByMonthAndType.mockResolvedValue({} as any);

            await expect(
                measureService.uploadMeasure(validBase64Image, 'CUST001', mockDate, MeasureType.WATER)
            ).rejects.toThrow(MeasureErrors.DoubleReport);
        });

        it('deve lançar erro para imagem inválida', async () => {
            await expect(
                measureService.uploadMeasure('invalid-base64', 'CUST001', mockDate, MeasureType.WATER)
            ).rejects.toThrow(MeasureErrors.InvalidData);
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

        it('deve lançar erro para confirmação duplicada', async () => {
            const mockMeasure = new Measure('uuid123', 'CUST001', new Date(), MeasureType.WATER, 100, 'url');
            mockMeasure.confirm(100);
            mockRepository.findByUuid.mockResolvedValue(mockMeasure);

            await expect(
                measureService.confirmMeasure('uuid123', 110)
            ).rejects.toThrow(MeasureErrors.ConfirmationDuplicate);
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

            const result = await measureService.listMeasures('CUST001', MeasureType.WATER);

            expect(result.measures).toHaveLength(1);
            expect(result.measures[0]).toHaveProperty('measure_type', MeasureType.WATER);
        });

        it('deve lançar erro quando nenhuma medição é encontrada', async () => {
            mockRepository.findAllByCustomer.mockResolvedValue([]);

            await expect(
                measureService.listMeasures('CUST001')
            ).rejects.toThrow(MeasureErrors.MeasuresNotFound);
        });
    });
});
