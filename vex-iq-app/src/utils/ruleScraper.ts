import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_PROMPT } from '../components/Rules';

const RULES_CACHE_KEY = 'vexify_rules_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface RulesCache {
  text: string;
  timestamp: number;
}

function cleanHtml(html: string): string {
  // Remove script and style tags and their contents
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Extract content from heading tags
  const headings = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
  const paragraphs = html.match(/<p[^>]*>([^<]+)<\/p>/gi) || [];
  const listItems = html.match(/<li[^>]*>([^<]+)<\/li>/gi) || [];

  let rulesText = '';

  // Process headings
  headings.forEach(heading => {
    const level = heading.match(/<h([1-6])/)?.[1] || '1';
    const text = heading.replace(/<[^>]+>/g, '').trim();
    if (text) {
      rulesText += `\n${'#'.repeat(parseInt(level))} ${text}\n\n`;
    }
  });

  // Process paragraphs
  paragraphs.forEach(p => {
    const text = p.replace(/<[^>]+>/g, '').trim();
    if (text) {
      rulesText += `${text}\n\n`;
    }
  });

  // Process list items
  listItems.forEach(li => {
    const text = li.replace(/<[^>]+>/g, '').trim();
    if (text) {
      rulesText += `* ${text}\n`;
    }
  });

  return rulesText.trim();
}

export async function scrapeRules(): Promise<string> {
  try {
    // Check cache first
    const cachedData = await AsyncStorage.getItem(RULES_CACHE_KEY);
    if (cachedData) {
      const cache: RulesCache = JSON.parse(cachedData);
      const now = Date.now();
      
      // If cache is still valid, use it
      if (now - cache.timestamp < CACHE_EXPIRY) {
        console.log('Using cached rules');
        return cache.text;
      }
    }

    console.log('Scraping fresh rules');
    const response = await axios.get('https://www.vexrobotics.com/rapid-relay-manual');
    const rulesText = cleanHtml(response.data);

    // Cache the new rules
    const cacheData: RulesCache = {
      text: rulesText,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(RULES_CACHE_KEY, JSON.stringify(cacheData));

    return rulesText;
  } catch (error) {
    console.error('Error scraping rules:', error);
    // If scraping fails, try to use cached data even if expired
    try {
      const cachedData = await AsyncStorage.getItem(RULES_CACHE_KEY);
      if (cachedData) {
        const cache: RulesCache = JSON.parse(cachedData);
        console.log('Using expired cache due to scraping error');
        return cache.text;
      }
    } catch (cacheError) {
      console.error('Cache retrieval failed:', cacheError);
    }
    throw new Error('Failed to scrape rules and no cache available');
  }
}

export async function updateInitialPrompt(): Promise<string> {
  try {
    const rules = await scrapeRules();
    return `You are a VEX IQ robotics competition rules expert for the Rapid Relay game. You help students, mentors, and judges understand the rules and scoring. You have access to the complete rulebook below.

When answering questions:
1. First cite the specific section of the rules you're referencing
2. Format your response using proper markdown (e.g., **bold**, *italic*, ### headers)
3. Use bullet points and numbered lists where appropriate
4. Include direct quotes from the manual when relevant
5. If a rule isn't covered in the manual, clearly state that

Here is the complete rulebook:

${rules}

Always format your responses in proper markdown and cite the relevant rules.`;
  } catch (error) {
    console.error('Error updating initial prompt:', error);
    return INITIAL_PROMPT; // Fallback to existing prompt if scraping fails
  }
} 