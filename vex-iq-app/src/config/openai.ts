import OpenAI from 'openai';
import { OPENAI_API_KEY, GEMINI_API_KEY } from '@env';

if (!OPENAI_API_KEY) {
  console.error('OpenAI API key is missing. Please check your .env file.');
}

if (!GEMINI_API_KEY) {
  console.error('Gemini API key is missing. Please check your .env file.');
}

console.log('OpenAI API Key exists:', !!OPENAI_API_KEY);
console.log('OpenAI API Key length:', OPENAI_API_KEY?.length || 0);
console.log('Gemini API Key exists:', !!GEMINI_API_KEY);

// OpenAI client
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || 'missing-api-key',
  dangerouslyAllowBrowser: true // Only for development, use backend in production
});

// Gemini client
export const gemini = new OpenAI({
  apiKey: GEMINI_API_KEY || 'missing-api-key',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  dangerouslyAllowBrowser: true // Only for development, use backend in production
});

// Ensure MAX_TOKENS is within GPT model limits
export const MAX_TOKENS = 500; // Default value is safe 