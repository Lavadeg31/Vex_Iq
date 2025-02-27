import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

if (!OPENAI_API_KEY) {
  console.error('OpenAI API key is missing. Please check your .env file.');
}

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || 'missing-api-key',
  dangerouslyAllowBrowser: true // Only for development, use backend in production
});

export const MAX_TOKENS = 500; 