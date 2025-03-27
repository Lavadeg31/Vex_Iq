import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/expo-supabase';
import { MessageLimit } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  }
});

const MESSAGE_LIMIT = 10;
const RESET_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export const checkRateLimit = async (userId: string, isAdmin: boolean): Promise<boolean> => {
  if (isAdmin) {
    return true; // No rate limiting for admins
  }

  try {
    // Get or create message limit record
    let { data: limit, error } = await supabase
      .from('message_limits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking rate limit:', error);
      return false;
    }

    const now = new Date();

    // If no limit exists or it's time to reset, create/update with fresh values
    if (!limit || now.getTime() - new Date(limit.last_reset).getTime() >= RESET_INTERVAL) {
      const { data: newLimit, error: updateError } = await supabase
        .from('message_limits')
        .upsert({
          user_id: userId,
          message_count: 1,
          last_reset: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single();

      if (updateError) {
        console.error('Error updating rate limit:', updateError);
        return false;
      }

      return true;
    }

    // Check if user has exceeded limit
    if (limit.message_count >= MESSAGE_LIMIT) {
      const timeUntilReset = new Date(limit.last_reset).getTime() + RESET_INTERVAL - now.getTime();
      console.log(`Rate limit exceeded. Reset in ${Math.ceil(timeUntilReset / (60 * 1000))} minutes`);
      return false;
    }

    // Increment message count
    const { error: incrementError } = await supabase
      .from('message_limits')
      .update({
        message_count: limit.message_count + 1,
        updated_at: now.toISOString()
      })
      .eq('user_id', userId);

    if (incrementError) {
      console.error('Error incrementing message count:', incrementError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Rate limit error:', error);
    return false;
  }
};

export const getRemainingMessages = async (userId: string): Promise<number> => {
  try {
    const { data: limit, error } = await supabase
      .from('message_limits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No record found, user has full limit
      return MESSAGE_LIMIT;
    }

    if (error) {
      console.error('Error fetching message limit:', error);
      return 0; // Return 0 on error to prevent potential overuse
    }

    const now = new Date();
    const timeSinceReset = now.getTime() - new Date(limit.last_reset).getTime();
    
    if (timeSinceReset >= RESET_INTERVAL) {
      return MESSAGE_LIMIT;
    }

    const remaining = Math.max(0, MESSAGE_LIMIT - limit.message_count);
    console.log(`User ${userId} has ${remaining} messages remaining. Reset in ${Math.ceil((RESET_INTERVAL - timeSinceReset) / (60 * 1000))} minutes`);
    return remaining;
  } catch (error) {
    console.error('Error getting remaining messages:', error);
    return 0; // Return 0 on error to prevent potential overuse
  }
}; 