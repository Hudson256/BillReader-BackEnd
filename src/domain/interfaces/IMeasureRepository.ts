import { Measure, MeasureType } from '../entities/Measure';

export interface IMeasureRepository {
    save(measure: Measure): Promise<void>;
    update(measure: Measure): Promise<void>;
    findByUuid(uuid: string): Promise<Measure | null>;
    findByMonthAndType(customerCode: string, measureType: MeasureType, measureDate: Date): Promise<Measure | null>;
    findAllByCustomer(customerCode: string, measureType?: MeasureType): Promise<Measure[]>;
}
