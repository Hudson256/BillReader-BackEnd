import { Container } from 'inversify';
import { MeasureRepository } from '../infrastructure/db/repositories/MeasureRepository';
import { IMeasureRepository } from '../domain/interfaces/IMeasureRepository';
import { MeasureService } from '../application/services/MeasureService';
import { GeminiAPI } from '../infrastructure/external/GeminiAPI';
import { MeasureController } from '../infrastructure/http/controllers/MeasureController';

const container = new Container();

container.bind<IMeasureRepository>('IMeasureRepository').to(MeasureRepository);
container.bind<GeminiAPI>(GeminiAPI).toSelf();
container.bind<MeasureService>(MeasureService).toSelf();
container.bind<MeasureController>(MeasureController).toSelf();

export { container };
