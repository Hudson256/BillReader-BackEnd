import dotenv from 'dotenv';

dotenv.config();

export const config = {
    geminiApiUrl: process.env.GEMINI_API_URL || 'http://localhost:3000',
    port: process.env.PORT || 3000,
};
