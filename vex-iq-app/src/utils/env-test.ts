import { OPENAI_API_KEY, JWT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY } from '@env';

// Test function to verify environment variables
export const testEnvVariables = () => {
  const missingVars: string[] = [];
  
  if (!OPENAI_API_KEY) missingVars.push('OPENAI_API_KEY');
  if (!JWT_SECRET) missingVars.push('JWT_SECRET');
  if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missingVars.push('SUPABASE_ANON_KEY');
  if (!GEMINI_API_KEY) missingVars.push('GEMINI_API_KEY');

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '));
    return false;
  }

  return true;
};

// Call the test function immediately when this file is imported
testEnvVariables(); 