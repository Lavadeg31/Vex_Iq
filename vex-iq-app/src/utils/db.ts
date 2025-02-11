import { createClient } from '@supabase/supabase-js';
import { Score, User, Settings, AuthResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import * as Crypto from 'expo-crypto';
import encode from 'jwt-encode';
import { jwtDecode } from 'jwt-decode';

const JWT_SECRET = '80c91fc9ca627596633abbe15bde89e876fafcf605ad9ca35bfee176eab9c5f4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to hash passwords
const hashPassword = async (password: string): Promise<string> => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
};

// Helper function to generate JWT token
const generateToken = (user: { id: string; email: string }): string => {
  const payload = {
    id: user.id,
    email: user.email,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  };
  return encode(payload, JWT_SECRET);
};

// Helper function to handle database errors
const handleDatabaseError = (error: unknown, operation: string): never => {
  console.error(`Database ${operation} error:`, error);
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    if (error.message.includes('Network request failed')) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = error.code;
    if (errorCode === 'PGRST116') {
      throw new Error('Resource not found');
    }
    if (errorCode === '23505') {
      throw new Error('This email is already registered');
    }
  }
  
  throw new Error(`Failed to ${operation}. Please try again later.`);
};

// Helper function to handle network timeouts
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error && error.message === 'Request timed out') {
      throw new Error('The server is taking too long to respond. Please try again.');
    }
    throw error;
  }
};

interface DatabaseResponse<T> {
  data: T | null;
  error: any;
}

// User functions
export const createUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const passwordHash = await hashPassword(password);
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking existing user:', checkError);
      throw new Error('Failed to check existing user');
    }

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Insert new user with all required fields from schema
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash
      }])
      .select('id, email')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      throw new Error('Failed to create user');
    }

    if (!newUser) {
      throw new Error('User creation succeeded but no user was returned');
    }

    // Generate JWT token
    const token = generateToken(newUser);

    // Store token in AsyncStorage
    await AsyncStorage.setItem('authToken', token);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: email.split('@')[0], // Generate username from email
      },
      token,
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

export const validateUser = async (email: string, password: string): Promise<AuthResponse | null> => {
  try {
    const passwordHash = await hashPassword(password);

    // Check user credentials
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error validating user:', error);
      return null;
    }

    if (!user) {
      console.error('User not found');
      return null;
    }

    // Compare password hashes
    if (user.password_hash !== passwordHash) {
      console.error('Invalid password');
      return null;
    }

    // Generate JWT token
    const token = generateToken(user);

    // Store token in AsyncStorage
    await AsyncStorage.setItem('authToken', token);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: email.split('@')[0], // Generate username from email
      },
      token,
    };
  } catch (error) {
    console.error('Validate user error:', error);
    return null;
  }
};

// Score functions
export const saveScore = async (score: Omit<Score, 'id' | 'timestamp'>): Promise<Score> => {
  try {
    const response = await supabase
      .from('scores')
      .insert([{
        user_id: score.userId,
        balls: score.balls,
        switches: score.switches,
        passes: score.passes,
        mode: score.mode,
        score: score.score
      }])
      .select('id, user_id, balls, switches, passes, mode, score, created_at')
      .single();

    const { data, error } = response as DatabaseResponse<{
      id: string;
      user_id: string;
      balls: number;
      switches: number;
      passes: number;
      mode: 'teamwork' | 'skills';
      score: number;
      created_at: string;
    }>;

    if (error) {
      return handleDatabaseError(error, 'save score');
    }

    if (!data) {
      throw new Error('Failed to save score. No data returned.');
    }

    return {
      id: data.id,
      userId: data.user_id,
      balls: data.balls,
      switches: data.switches,
      passes: data.passes,
      mode: data.mode,
      score: data.score,
      timestamp: data.created_at
    };
  } catch (error) {
    return handleDatabaseError(error, 'save score');
  }
};

export const getUserScores = async (userId: string): Promise<Score[]> => {
  try {
    const response = await supabase
      .from('scores')
      .select('id, user_id, balls, switches, passes, mode, score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data, error } = response as DatabaseResponse<Array<{
      id: string;
      user_id: string;
      balls: number;
      switches: number;
      passes: number;
      mode: 'teamwork' | 'skills';
      score: number;
      created_at: string;
    }>>;

    if (error) {
      return handleDatabaseError(error, 'fetch scores');
    }

    if (!data) {
      return [];
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      balls: item.balls,
      switches: item.switches,
      passes: item.passes,
      mode: item.mode,
      score: item.score,
      timestamp: item.created_at
    }));
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error && 
        typeof error.message === 'string' && error.message.includes('internet connection')) {
      throw error;
    }
    return handleDatabaseError(error, 'fetch scores');
  }
};

// Settings functions
export const getUserSettings = async (userId: string): Promise<Settings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*, user_id as userId')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If settings don't exist, create default settings
      if (error.code === 'PGRST116') {
        const defaultSettings = {
          user_id: userId,
          theme: 'light',
          notifications_enabled: true,
          language: 'en'
        };
        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert([defaultSettings])
          .select('*, user_id as userId')
          .single();

        if (createError) {
          console.error('Error creating settings:', createError);
          throw new Error('Failed to create settings');
        }
        return newSettings;
      }
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }

    return data;
  } catch (error) {
    console.error('Get user settings error:', error);
    throw error;
  }
};

export const updateUserSettings = async (userId: string, settings: Partial<Settings>): Promise<Settings> => {
  try {
    // First check if settings exist for the user
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error('Failed to check existing settings');
    }

    if (!existingSettings) {
      // Create default settings if they don't exist
      const defaultSettings = {
        user_id: userId,
        theme: settings.theme || 'light',
        notifications_enabled: true,
        language: 'en'
      };

      const { data: newSettings, error: createError } = await supabase
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (createError) {
        throw new Error('Failed to create settings');
      }

      return newSettings;
    }

    // Update existing settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update({
        theme: settings.theme,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to update settings');
    }

    return updatedSettings;
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
};

// Session functions
export const validateSession = async (token: string): Promise<User | null> => {
  try {
    // Decode and verify JWT token
    const decoded = jwtDecode(token) as { id: string; email: string; exp: number };
    
    // Check if token is expired
    if (decoded.exp < Date.now()) {
      await AsyncStorage.removeItem('authToken');
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      username: decoded.email.split('@')[0],
    };
  } catch (error) {
    await AsyncStorage.removeItem('authToken');
    return null;
  }
};

// Helper function to get the auth token from storage
const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    throw new Error('No auth token found');
  }
  return token;
};

export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    // Delete all related data first
    await supabase.from('scores').delete().eq('user_id', userId);
    await supabase.from('settings').delete().eq('user_id', userId);
    await supabase.from('sessions').delete().eq('user_id', userId);
    
    // Finally delete the user
    const { error } = await supabase.from('users').delete().eq('id', userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user account');
    }
  } catch (error) {
    console.error('Delete user account error:', error);
    throw error;
  }
}; 