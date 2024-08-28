import 'reflect-metadata';
import { MeasureController } from './MeasureController';
import { MeasureService } from '../../../application/services/MeasureService';
import { MeasureType } from '../../../domain/entities/Measure';
import { MeasureErrors } from '../../../domain/exceptions/MeasureErrors';

jest.mock('../../../application/services/MeasureService');

describe('MeasureController', () => {
    let measureController: MeasureController;
    let mockMeasureService: jest.Mocked<MeasureService>;

    beforeEach(() => {
        mockMeasureService = {
            uploadMeasure: jest.fn(),
            confirmMeasure: jest.fn(),
            listMeasures: jest.fn(),
        } as unknown as jest.Mocked<MeasureService>;

        measureController = new MeasureController(mockMeasureService);
    });

    describe('uploadMeasure', () => {
        it('deve fazer upload de uma medição com sucesso', async () => {
            const mockReq = {
                body: {
                    image: 'base64image',
                    customer_code: 'CUST001',
                    measure_datetime: '2023-01-01T00:00:00Z',
                    measure_type: MeasureType.WATER,
                },
            } as any;
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;
            const mockNext = jest.fn();

            mockMeasureService.uploadMeasure.mockResolvedValue({
                image_url: 'http://example.com/image.jpg',
                measure_value: 100,
                measure_uuid: 'uuid123',
            });

            await measureController.uploadMeasure(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                image_url: 'http://example.com/image.jpg',
                measure_value: 100,
                measure_uuid: 'uuid123',
            });
        });

        it('deve chamar next com erro em caso de falha', async () => {
            const mockReq = {
                body: {
                    image: 'base64image',
                    customer_code: 'CUST001',
                    measure_datetime: '2023-01-01T00:00:00Z',
                    measure_type: MeasureType.WATER,
                },
            } as any;
            const mockRes = {} as any;
            const mockNext = jest.fn();

            const mockError = new Error('Erro de teste');
            mockMeasureService.uploadMeasure.mockRejectedValue(mockError);

            await measureController.uploadMeasure(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

});