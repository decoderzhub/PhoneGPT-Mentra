import dotenv from 'dotenv';

dotenv.config();

export const config = {
  packageName: process.env.PACKAGE_NAME ?? (() => { throw new Error('PACKAGE_NAME is not set in .env file'); })(),
  mentraosApiKey: process.env.MENTRAOS_API_KEY ?? (() => { throw new Error('MENTRAOS_API_KEY is not set in .env file'); })(),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? (() => { throw new Error('ANTHROPIC_API_KEY is not set in .env file'); })(),
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
  port: parseInt(process.env.PORT || '8112'),
  backendUrl: process.env.BACKEND_URL || 'http://localhost:8112',
  llmModel: process.env.LLM_MODEL || 'claude-3-haiku-20240307'
};
