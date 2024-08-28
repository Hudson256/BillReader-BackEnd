import axios from 'axios';
import { injectable } from 'inversify';
import { config } from '../../config/env';

@injectable()
export class GeminiAPI {
    private readonly baseUrl: string = config.geminiApiUrl;

    public async processImage(image: string): Promise<{ measureUuid: string; measureValue: number; imageUrl: string }> {
        try {
            const response = await axios.post(`${this.baseUrl}/process-image`, { image });
            return response.data;
        } catch (error) {
            throw new Error('Falha ao processar imagem.');
        }
    }
}
