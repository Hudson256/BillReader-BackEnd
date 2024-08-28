import { Measure, MeasureType } from './Measure';

describe('Measure', () => {
    it('deve criar uma nova medição', () => {
        const measure = new Measure('uuid1', 'CUST001', new Date(), MeasureType.WATER, 100, 'url1');
        expect(measure.measureUuid).toBe('uuid1');
        expect(measure.customerCode).toBe('CUST001');
        expect(measure.measureType).toBe(MeasureType.WATER);
        expect(measure.measureValue).toBe(100);
        expect(measure.imageUrl).toBe('url1');
        expect(measure.isConfirmed).toBe(false);
        expect(measure.confirmedValue).toBeNull();
    });

    describe('confirm', () => {
        it('deve confirmar uma medição', () => {
            const measure = new Measure('uuid1', 'CUST001', new Date(), MeasureType.WATER, 100, 'url1');
            measure.confirm(110);
            expect(measure.isConfirmed).toBe(true);
            expect(measure.confirmedValue).toBe(110);
        });

        it('deve lançar erro ao tentar confirmar uma medição já confirmada', () => {
            const measure = new Measure('uuid1', 'CUST001', new Date(), MeasureType.WATER, 100, 'url1');
            measure.confirm(110);
            expect(() => measure.confirm(120)).toThrow('Medição já confirmada');
        });
    });
});
