import { OPENAI_API_KEY, JWT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Test function to verify environment variables
export const testEnvVariables = () => {
  console.log('==================== ENVIRONMENT VARIABLE TEST ====================');
  console.log('OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
  console.log('OPENAI_API_KEY length:', OPENAI_API_KEY?.length || 0);
  console.log('OPENAI_API_KEY starts with:', OPENAI_API_KEY?.substring(0, 10) + '...');
  
  console.log('JWT_SECRET exists:', !!JWT_SECRET);
  console.log('JWT_SECRET length:', JWT_SECRET?.length || 0);
  
  console.log('SUPABASE_URL exists:', !!SUPABASE_URL);
  console.log('SUPABASE_URL:', SUPABASE_URL);
  
  console.log('SUPABASE_ANON_KEY exists:', !!SUPABASE_ANON_KEY);
  console.log('SUPABASE_ANON_KEY length:', SUPABASE_ANON_KEY?.length || 0);
  console.log('==================== END TEST ====================');
  
  return {
    openaiKeyValid: OPENAI_API_KEY?.startsWith('sk-'),
    jwtSecretValid: JWT_SECRET?.length > 20,
    supabaseUrlValid: SUPABASE_URL?.includes('supabase.co'),
    supabaseKeyValid: SUPABASE_ANON_KEY?.length > 20,
  };
};

// Call the test function immediately when this file is imported
testEnvVariables(); 