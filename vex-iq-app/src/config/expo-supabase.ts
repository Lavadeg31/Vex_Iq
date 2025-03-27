import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

// Export Expo Public variables for Supabase
export const SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL || 'https://pvhhlkahhxusrosazqdy.supabase.co';
export const SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aGhsa2FoaHh1c3Jvc2F6cWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMDE4OTEsImV4cCI6MjA1MTY3Nzg5MX0.BXb40H7f8cmqSWuZNO-ZX6B-5WEXX-jXIfXpn47ubOc';

// Log configuration status for debugging
console.log('Expo Supabase URL available:', !!EXPO_PUBLIC_SUPABASE_URL);
console.log('Expo Supabase key available:', !!EXPO_PUBLIC_SUPABASE_ANON_KEY); 