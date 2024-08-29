import 'reflect-metadata';
import { MeasureRepository } from './MeasureRepository';
import { Measure, MeasureType } from '../../../domain/entities/Measure';

describe('MeasureRepository', () => {
    let repository: MeasureRepository;
    let mockDbConnection: any;

    beforeEach(() => {
        mockDbConnection = {
            measures: {
                findOne: jest.fn(),

            }
        };
        repository = new MeasureRepository(mockDbConnection);
    });

    describe('save', () => {
        it('deve salvar uma nova medição', async () => {
            const measure = new Measure('uuid1', 'CUST001', new Date(), MeasureType.WATER, 100, 'url1');
            await repository.save(measure);
            const found = await repository.findByUuid('uuid1');
            expect(found).toEqual(measure);
        });
    });

    describe('update', () => {
        it('deve atualizar uma medição existente', async () => {
            const measure = new Measure('uuid1', 'CUST001', new Date(), MeasureType.WATER, 100, 'url1');
            await repository.save(measure);
            measure.confirm(110);
            await repository.update(measure);
            const found = await repository.findByUuid('uuid1');
            expect(found?.isConfirmed).toBe(true);
            expect(found?.confirmedValue).toBe(110);
        });
    });

    describe('findByMonthAndType', () => {
        it('deve encontrar uma medição pelo mês e tipo', async () => {
            const mockMeasure = {
                measureUuid: 'uuid1',
                customerCode: 'CUST001',
                measureDatetime: new Date('2023-01-15'),
                measureType: MeasureType.WATER,
                measureValue: 100,
                imageUrl: 'http://example.com/image.jpg'
            };

            mockDbConnection.measures.findOne.mockResolvedValue(mockMeasure);

            const result = await repository.findByMonthAndType('CUST001', MeasureType.WATER, new Date('2023-01-15'));

            expect(result).toBeInstanceOf(Measure);
            expect(result?.measureUuid).toBe('uuid1');
        });

    });

    describe('findAllByCustomer', () => {
        it('deve encontrar todas as medições de um cliente', async () => {
            const measure1 = new Measure('uuid1', 'CUST001', new Date(), MeasureType.WATER, 100, 'url1');
            const measure2 = new Measure('uuid2', 'CUST001', new Date(), MeasureType.GAS, 200, 'url2');
            await repository.save(measure1);
            await repository.save(measure2);
            const found = await repository.findAllByCustomer('CUST001');
            expect(found).toHaveLength(2);
            expect(found).toEqual(expect.arrayContaining([measure1, measure2]));
        });

        it('deve filtrar medições por tipo', async () => {
            const measure1 = new Measure('uuid1', 'CUST001', new Date(), MeasureType.WATER, 100, 'url1');
            const measure2 = new Measure('uuid2', 'CUST001', new Date(), MeasureType.GAS, 200, 'url2');
            await repository.save(measure1);
            await repository.save(measure2);
            const found = await repository.findAllByCustomer('CUST001', MeasureType.WATER);
            expect(found).toHaveLength(1);
            expect(found[0]).toEqual(measure1);
        });
    });
});