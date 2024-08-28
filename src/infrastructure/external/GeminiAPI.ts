import axios from 'axios';
import { MeasureErrors } from '../../domain/exceptions/MeasureErrors';

export class GeminiAPI {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async processImage(imageBase64: string): Promise<ProcessedImageResult> {
        try {
            const response = await axios.post(`${this.baseUrl}/process-image`, {
                image: imageBase64
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                measureUuid: response.data.measureUuid,
                measureValue: response.data.measureValue,
                imageUrl: response.data.imageUrl
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    throw new MeasureErrors.InvalidData('Imagem inválida ou não processável');
                } else {
                    throw new MeasureErrors.InvalidData('Erro ao processar imagem');
                }
            }
            throw new MeasureErrors.InvalidData('Erro inesperado ao processar imagem');
        }
    }
}

interface ProcessedImageResult {
    measureUuid: string;
    measureValue: number;
    imageUrl: string;
}
