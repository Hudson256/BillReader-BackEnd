import { injectable, inject } from 'inversify';
import { Measure, MeasureType } from '../../../domain/entities/Measure';
import { IMeasureRepository } from '../../../domain/interfaces/IMeasureRepository';

@injectable()
export class MeasureRepository implements IMeasureRepository {
    private measures: Measure[] = [];
    private dbConnection: any; // Substitua 'any' pelo tipo correto da sua conexão de banco de dados

    constructor(@inject('DbConnection') dbConnection: any) { // Substitua 'any' pelo tipo correto da sua conexão de banco de dados
        this.dbConnection = dbConnection;
    }

    async save(measure: Measure): Promise<void> {
        this.measures.push(measure);
    }

    async update(measure: Measure): Promise<void> {
        const index = this.measures.findIndex(m => m.measureUuid === measure.measureUuid);
        if (index !== -1) {
            this.measures[index] = measure;
        }
    }

    async findByUuid(uuid: string): Promise<Measure | null> {
        return this.measures.find(m => m.measureUuid === uuid) || null;
    }

    async findByMonthAndType(customerCode: string, measureType: MeasureType, measureDate: Date): Promise<Measure | null> {
        const startOfMonth = new Date(measureDate.getFullYear(), measureDate.getMonth(), 1);
        const endOfMonth = new Date(measureDate.getFullYear(), measureDate.getMonth() + 1, 0);

        const measure = await this.dbConnection.measures.findOne({
            where: {
                customerCode,
                measureType,
                measureDatetime: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            }
        });

        return measure ? new Measure(
            measure.measureUuid,
            measure.customerCode,
            measure.measureDatetime,
            measure.measureType,
            measure.measureValue,
            measure.imageUrl
        ) : null;
    }

    async findAllByCustomer(customerCode: string, measureType?: 'WATER' | 'GAS'): Promise<Measure[]> {
        return this.measures.filter(m => 
            m.customerCode === customerCode &&
            (measureType ? m.measureType === measureType : true)
        );
    }
}
