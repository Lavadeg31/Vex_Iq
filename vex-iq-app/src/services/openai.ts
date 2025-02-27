import { openai, MAX_TOKENS } from '../config/openai';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const MODELS = {
  '4o': 'gpt-4o',
  '4o_mini': 'gpt-4o-mini',
  'ft_model': 'ft:gpt-4o-mini-2024-07-18:personal::B51ts1qH'
} as const;

export const getChatResponse = async (
  messages: Message[], 
  modelKey: keyof typeof MODELS = '4o_mini',
  isAdmin: boolean = false
): Promise<string> => {
  try {
    console.log('Making OpenAI API call with messages:', messages);
    console.log('Using model:', MODELS[modelKey]);
    
    // For the fine-tuned model, use specific settings to match the playground
    const isFinetuned = modelKey === 'ft_model';
    
    // Log detailed information for the fine-tuned model
    if (isFinetuned) {
      console.log('USING FINE-TUNED MODEL WITH SPECIAL PARAMETERS');
      console.log('System prompt length:', messages[0]?.content?.length || 0);
      console.log('User query length:', messages[messages.length - 1]?.content?.length || 0);
    }
    
    const completion = await openai.chat.completions.create({
      model: MODELS[modelKey],
      messages,
      // Use different settings for fine-tuned model
      max_tokens: isFinetuned ? 4000 : (isAdmin ? undefined : MAX_TOKENS), // Increased for fine-tuned model
      temperature: isFinetuned ? 0.2 : 0.7, // Lower temperature for more deterministic responses
      // Match playground defaults for fine-tuned models
      top_p: isFinetuned ? 0.9 : undefined,
      presence_penalty: isFinetuned ? 0.1 : undefined, // Slight penalty to avoid repetition
      frequency_penalty: isFinetuned ? 0.1 : undefined, // Slight penalty to avoid repetition
    });

    console.log('OpenAI API response status:', completion.choices?.[0]?.finish_reason);
    console.log('Response length:', completion.choices?.[0]?.message?.content?.length || 0);

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from OpenAI API');
    }

    return completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'I apologize, but there seems to be an issue with the API configuration. Please try again later.';
      }
      if (error.message.includes('network')) {
        return 'I apologize, but I\'m having trouble connecting to the server. Please check your internet connection and try again.';
      }
      if (error.message.includes('rate limit')) {
        return 'I apologize, but we\'ve hit the OpenAI rate limit. Please try again in a moment.';
      }
      if (error.message.includes('content filter')) {
        return 'I apologize, but the request was flagged by the content filter. Please rephrase your question.';
      }
      if (error.message.includes('context window')) {
        return 'I apologize, but your question is too complex for the current context window. Please try asking a more specific question.';
      }
    }
    throw new Error('Failed to get response from AI assistant');
  }
}; 