import { SUPABASE_URL as ENV_SUPABASE_URL, SUPABASE_ANON_KEY as ENV_SUPABASE_ANON_KEY } from '@env';

// Fallback to hardcoded values if environment variables are not available
export const SUPABASE_URL = ENV_SUPABASE_URL || 'https://pvhhlkahhxusrosazqdy.supabase.co';
export const SUPABASE_ANON_KEY = ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aGhsa2FoaHh1c3Jvc2F6cWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMDE4OTEsImV4cCI6MjA1MTY3Nzg5MX0.BXb40H7f8cmqSWuZNO-ZX6B-5WEXX-jXIfXpn47ubOc';

// Log configuration status for debugging
console.log('Supabase URL from env:', !!ENV_SUPABASE_URL);
console.log('Supabase key from env:', !!ENV_SUPABASE_ANON_KEY); 