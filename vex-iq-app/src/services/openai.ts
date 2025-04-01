/h/import { openai, gemini, MAX_TOKENS } from '../config/openai';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const MODELS = {
  '4o': 'gpt-4o',
  '4o_mini': 'gpt-4o-mini',
  'ft_model': 'ft:gpt-4o-mini-2024-07-18:personal::B51ts1qH',
  'gemini': 'gemini-2.0-flash'
} as const;

// Array of waiting messages to display while the AI is thinking
const WAITING_MESSAGES = [
  "Please wait while I think about that...",
  "Generating a response for you...",
  "Processing your request...",
  "Looking up information...",
  "Analyzing your question...",
  "Thinking...",
  "Crafting a thoughtful response...",
  "Working on your answer...",
  "Just a moment while I generate a response..."
];

/**
 * Returns a random waiting message
 */
export const getWaitingMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * WAITING_MESSAGES.length);
  return WAITING_MESSAGES[randomIndex];
};

/**
 * Returns a progress message that indicates the AI is still working
 * @param seconds Number of seconds elapsed
 */
export const getProgressMessage = (seconds: number): string => {
  if (seconds < 5) {
    return "Starting to process your request...";
  } else if (seconds < 10) {
    return "Working on your response...";
  } else if (seconds < 20) {
    return "This is taking a bit longer than usual, but I'm still working on it...";
  } else if (seconds < 25) {
    return "Erm I think the servers are cooked";
  } else if (seconds < 30) {
    return "Just Quit";
  } else {
    return "Still processing. This might take a moment for complex questions...";
  }
};

export const getChatResponse = async (
  messages: Message[], 
  modelKey: keyof typeof MODELS = '4o_mini',
  isAdmin: boolean = false
): Promise<string> => {
  try {
    console.log('Making API call with messages:', messages);
    console.log('Using model:', MODELS[modelKey]);
    
    // For the fine-tuned model, use specific settings to match the playground
    const isFinetuned = modelKey === 'ft_model';
    const isGemini = modelKey === 'gemini';
    
    // Log detailed information for the fine-tuned model
    if (isFinetuned) {
      console.log('USING FINE-TUNED MODEL WITH SPECIAL PARAMETERS');
      console.log('System prompt length:', messages[0]?.content?.length || 0);
      console.log('User query length:', messages[messages.length - 1]?.content?.length || 0);
    }

    if (isGemini) {
      console.log('USING GEMINI MODEL WITH GROUNDING');
    }
    
    // Choose the appropriate client based on the model
    const client = isGemini ? gemini : openai;
    
    // Validate messages array
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided');
    }
    
    // Ensure messages are properly formatted
    const validatedMessages = messages.filter(msg => {
      return msg && typeof msg.content === 'string' && 
             ['user', 'system', 'assistant'].includes(msg.role);
    });
    
    if (validatedMessages.length === 0) {
      throw new Error('No valid messages provided');
    }
    
    // Create options with only valid properties for the API
    const apiOptions = {
      model: MODELS[modelKey],
      messages: validatedMessages,
      max_tokens: isFinetuned ? 16000 : (isAdmin ? undefined : MAX_TOKENS),
      temperature: isFinetuned ? 0.9 : 1,
    };
    
    // Add fine-tuned specific parameters only when using that model
    if (isFinetuned) {
      Object.assign(apiOptions, {
        top_p: 1,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });
    }
    
    // Add Gemini-specific parameters only for Gemini
    if (isGemini && validatedMessages[0]?.content) {
      Object.assign(apiOptions, {
        grounding: true,
        grounding_sources: [
          {
            type: "text",
            content: validatedMessages[0].content
          }
        ]
      });
    }
    
    console.log('Sending API request with options:', JSON.stringify(apiOptions));
    
    const completion = await client.chat.completions.create(apiOptions);

    console.log('API response status:', completion.choices?.[0]?.finish_reason);
    console.log('Response length:', completion.choices?.[0]?.message?.content?.length || 0);

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from API');
    }

    return completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'I apologize, but there seems to be an issue with the API configuration. Please try again later.';
      }
      if (error.message.includes('network')) {
        return 'I apologize, but I\'m having trouble connecting to the server. Please check your internet connection and try again.';
      }
      if (error.message.includes('rate limit')) {
        return 'I apologize, but we\'ve hit the API rate limit. Please try again in a moment.';
      }
      if (error.message.includes('content filter')) {
        return 'I apologize, but the request was flagged by the content filter. Please rephrase your question.';
      }
      if (error.message.includes('context window')) {
        return 'I apologize, but your question is too complex for the current context window. Please try asking a more specific question.';
      }
      if (error.message.includes('400') || error.message.includes('status code')) {
        return 'I apologize, but there was an error processing your request. This might be due to the complexity of your question or an issue with the service. Please try a simpler question or try again later.';
      }
    }
    
    // Generic error message as a fallback
    return 'I apologize, but I encountered an error while processing your request. Please try again with a simpler question or check back later.';
  }
}; 
