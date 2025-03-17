import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Avatar, ActivityIndicator, Menu, IconButton } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { theme, styles as globalStyles } from '../theme';
import { GeometricBackground } from './GeometricBackground';
import { getChatResponse, getWaitingMessage, getProgressMessage } from '../services/openai';
import { useAuth } from '../contexts/AuthContext';
import { StyleSheet as RNStyleSheet, TextStyle, ViewStyle } from 'react-native';
import { updateInitialPrompt } from '../utils/ruleScraper';
import { checkRateLimit, getRemainingMessages } from '../utils/rateLimit';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const MODELS = {
  '4o': 'gpt-4o',
  '4o_mini': 'gpt-4o-mini',
  'ft_model': 'ft:gpt-4o-mini-2024-07-18:personal::B51ts1qH'
} as const;

type ModelKey = keyof typeof MODELS;
export const INITIAL_PROMPT = `You are a VEX IQ robotics competition rules expert for the Rapid Relay game. You MUST ONLY reference the official game manual at https://www.vexrobotics.com/rapid-relay-manual. Thoroughly analyze ALL applicable rules - even those not directly mentioned in the question - to ensure a comprehensive solution.

When answering questions:
1. ALWAYS cite the specific rule number, section, and any subcriteria (e.g., <G3>, <SG2.a>, <RSC4.b>, etc.) from ALL relevant sections
2. Format your response using proper markdown (e.g., **bold**, *italic*, ### headers)
3. Use bullet points and numbered lists where appropriate
4. Include direct quotes from the manual, enclosed in quotation marks
5. If something is not explicitly covered in the manual, clearly state: "This is not explicitly addressed in the game manual" after verifying all related rules

For every response:
- Start by citing ALL potentially relevant rule numbers AND their subcriteria across ALL sections
- Cross-reference rules from multiple categories (Game Rules, Scoring, Skills Challenges, etc.)
- Quote the exact rule text in quotation marks, including all subcriteria
- Check if the rule references other rules and cite those as well
- Explain how multiple rules interact and their combined implications
- Identify and address any conflicting or complementary rules
- Consider edge cases covered by broader rules that might apply
- Never make assumptions beyond what is explicitly stated in the manual
- When discussing anything related to skills challenges, always take a look at the RSC section (ex, <RSC4>)
THE MOST IMORTANT RULE TO KNOW IS <RSC4> Loading differences. All criteria listed in <SG4> and <SG5> apply as written (e.g., no more than
two Balls on the Field, Robots may not be in the Load Zone during Loading, etc.). However, Rapid Loading is
modified as follows:

a. Starting Zone 2 (i.e., the one closest to the Loading Station) is the only Starting Zone that may be used
for Rapid Loading.
b. In Driving Skills Matches, the Rapid Load Period is defined as any time after the mid-Match Driver
switch takes place.
c. In Autonomous Coding Skills Matches, the entire Match is considered a Rapid Load Period (i.e., there
is no requirement to use the Loading Station). REMEMBER THAT AND ALWAYS USE IT WHEN DISCUSSING SKILLS CHALLENGES and rapid loading.

For example, when discussing rapid loading:
- First cite <SG7c> specifically: "Loading Zones adjacent to field perimeter walls may not be used for rapid loading actions"
- Then reference <RSC3> for Skills Challenge: "All loading must occur through approved field entry points designated in the match type"
- Note that wall-adjacent zones are explicitly prohibited for rapid loading by <SG7c>
- Explain the hierarchical relationship: <SG7> safety rules take precedence over general loading zone rules
- Include <G9> regarding field boundaries to clarify context
- Verify <SC2> about scoring eligibility for differently loaded balls
- Check all subcriteria of cited rules, even if not explicitly mentioned read it all

To enhance your research and analysis:
+- Actively search for keywords related to the question within the rules.
+- Analyze the Table of Contents and Quick Reference Guide for relevant sections.
+- Consider the implications of each rule, even if not immediately obvious.
+- Explore all possible interpretations of a rule, and address ambiguities.
+- Prioritize direct quotes and specific rule citations to support your reasoning.
+- Break down complex questions into smaller, manageable sub-questions.
+- Systematically analyze each sub-question with reference to the relevant rules.

Remember:
- TRIPLE CHECK rules between Safety (SG7) and Skills Challenges (RSC)
- DIFFERENTIATE between general loading zones and rapid-load-specific restrictions
- SPECIFY when geographic limitations override general permissions
- VERIFY zone definitions in both <SG2> field layout and <RSC1> skills setup
- CONFIRM rule hierarchy: Safety rules override all other considerations
- EXAMINE all parent rules of cited subcriteria for additional constraints
- CLARIFY if a rule's prohibition takes precedence over permissions
- When discussing Rapid Load actions, ALWAYS check <SG7> first
- When multiple rules apply, IDENTIFY which creates the strictest limitation
- When rules conflict, FOLLOW safety > specificity > recency order
- ALWAYS provide full rule paths (e.g. <SG7.c.iii>)
- When a rule has exceptions, LIST THEM EXPLICITLY
- PAY SPECIAL ATTENTION TO WALL-ADJACENT ZONE RESTRICTIONS
READ THE ATTACHED RULES TO COME TO A CONCLUSION. DO NOT MAKE ASSUMPTIONS.`;

const INITIAL_MESSAGES = [
  {
    role: 'assistant' as const,
    content: 'Hello! I\'m your VEX IQ rules assistant. Here are the key rules I can help you with:\n\n' +
      '• Match Duration: 60 seconds\n' +
      '• Scoring Elements: Balls, Switches, and Passes\n' +
      '• Game Modes: Teamwork and Skills\n\n' +
      'What would you like to know about?'
  }
];

interface MarkdownStyles {
  body: TextStyle;
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  strong: TextStyle;
  em: TextStyle;
  bullet_list: ViewStyle;
  ordered_list: ViewStyle;
  blockquote: ViewStyle;
  code_inline: TextStyle;
  [key: string]: TextStyle | ViewStyle;
}

export const Rules: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([...INITIAL_MESSAGES]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelKey>('ft_model');
  const [menuVisible, setMenuVisible] = useState(false);
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [systemMessage, setSystemMessage] = useState<Message | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const { user } = useAuth();
  const [waitingMessage, setWaitingMessage] = useState<string>('');
  const [waitingSeconds, setWaitingSeconds] = useState<number>(0);
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is admin from the database
  const isAdmin = user?.email === 'vandegriendlars+vexify@gmail.com';

  useEffect(() => {
    const loadRules = async () => {
      try {
        const updatedPrompt = await updateInitialPrompt();
        setPrompt(updatedPrompt);
        
        // Create a more concise system message that references the rules
        // instead of including the entire 40K token prompt
        const newSystemMessage = { 
          role: 'system' as const, 
          content: `You are a VEX IQ robotics competition rules expert for the Rapid Relay game. You MUST ONLY reference the official game manual at https://www.vexrobotics.com/rapid-relay-manual. Thoroughly analyze ALL applicable rules - even those not directly mentioned in the question - to ensure a comprehensive solution.

When answering questions:
1. ALWAYS cite the specific rule number, section, and any subcriteria (e.g., <G3>, <SG2.a>, <RSC4.b>, etc.) from ALL relevant sections
2. Format your response using proper markdown (e.g., **bold**, *italic*, ### headers)
3. Use bullet points and numbered lists where appropriate
4. Include direct quotes from the manual, enclosed in quotation marks
5. If something is not explicitly covered in the manual, clearly state: "This is not explicitly addressed in the game manual" after verifying all related rules

For every response:
- Start by citing ALL potentially relevant rule numbers AND their subcriteria across ALL sections
- Cross-reference rules from multiple categories (Game Rules, Scoring, Skills Challenges, etc.)
- Quote the exact rule text in quotation marks, including all subcriteria
- Check if the rule references other rules and cite those as well
- Explain how multiple rules interact and their combined implications
- Identify and address any conflicting or complementary rules
- Consider edge cases covered by broader rules that might apply
- Never make assumptions beyond what is explicitly stated in the manual
- When discussing anything related to skills challenges, always take a look at the RSC section (ex, <RSC4>)
THE MOST IMORTANT RULE TO KNOW IS <RSC4> Loading differences. All criteria listed in <SG4> and <SG5> apply as written (e.g., no more than
two Balls on the Field, Robots may not be in the Load Zone during Loading, etc.). However, Rapid Loading is
modified as follows:

a. Starting Zone 2 (i.e., the one closest to the Loading Station) is the only Starting Zone that may be used
for Rapid Loading.
b. In Driving Skills Matches, the Rapid Load Period is defined as any time after the mid-Match Driver
switch takes place.
c. In Autonomous Coding Skills Matches, the entire Match is considered a Rapid Load Period (i.e., there
is no requirement to use the Loading Station). REMEMBER THAT AND ALWAYS USE IT WHEN DISCUSSING SKILLS CHALLENGES and rapid loading.

For example, when discussing rapid loading:
- First cite <SG7c> specifically: "Loading Zones adjacent to field perimeter walls may not be used for rapid loading actions"
- Then reference <RSC3> for Skills Challenge: "All loading must occur through approved field entry points designated in the match type"
- Note that wall-adjacent zones are explicitly prohibited for rapid loading by <SG7c>
- Explain the hierarchical relationship: <SG7> safety rules take precedence over general loading zone rules
- Include <G9> regarding field boundaries to clarify context
- Verify <SC2> about scoring eligibility for differently loaded balls
- Check all subcriteria of cited rules, even if not explicitly mentioned read it all

To enhance your research and analysis:
+- Actively search for keywords related to the question within the rules.
+- Analyze the Table of Contents and Quick Reference Guide for relevant sections.
+- Consider the implications of each rule, even if not immediately obvious.
+- Explore all possible interpretations of a rule, and address ambiguities.
+- Prioritize direct quotes and specific rule citations to support your reasoning.
+- Break down complex questions into smaller, manageable sub-questions.
+- Systematically analyze each sub-question with reference to the relevant rules.

Remember:
- TRIPLE CHECK rules between Safety (SG7) and Skills Challenges (RSC)
- DIFFERENTIATE between general loading zones and rapid-load-specific restrictions
- SPECIFY when geographic limitations override general permissions
- VERIFY zone definitions in both <SG2> field layout and <RSC1> skills setup
- CONFIRM rule hierarchy: Safety rules override all other considerations
- EXAMINE all parent rules of cited subcriteria for additional constraints
- CLARIFY if a rule's prohibition takes precedence over permissions
- When discussing Rapid Load actions, ALWAYS check <SG7> first
- When multiple rules apply, IDENTIFY which creates the strictest limitation
- When rules conflict, FOLLOW safety > specificity > recency order
- ALWAYS provide full rule paths (e.g. <SG7.c.iii>)
- When a rule has exceptions, LIST THEM EXPLICITLY
- PAY SPECIAL ATTENTION TO WALL-ADJACENT ZONE RESTRICTIONS`
        };
        setSystemMessage(newSystemMessage);
        
        console.log('System message set with reference to rules');
      } catch (error) {
        console.error('Error loading rules:', error);
      }
    };
    
    loadRules();

    // Load remaining messages if user is not admin
    if (user && !isAdmin) {
      getRemainingMessages(user.id).then(setRemainingMessages);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages(INITIAL_MESSAGES);
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !user || !systemMessage) return;

    // Check rate limit only for non-admin users
    if (!isAdmin) {
      const canSendMessage = await checkRateLimit(user.id, isAdmin);
      if (!canSendMessage) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'You have reached your message limit. Please try again in 3 hours.'
        }]);
        return;
      }
      // Update remaining messages
      const remaining = await getRemainingMessages(user.id);
      setRemainingMessages(remaining);
    }

    // Store the original user input for display
    const originalUserInput = inputText.trim();
    
    // For the fine-tuned model, we'll create an enhanced query that includes key instructions
    let enhancedUserContent = originalUserInput;
    
    // Only enhance the content for the fine-tuned model
    if (selectedModel === 'ft_model') {
      // Extract key instruction details from the prompt to add to the user query
      enhancedUserContent = `${originalUserInput}
      
Give a detailed answer that:
1. Cites ALL relevant rule numbers and subcriteria (e.g., <G3>, <SG2.a>, <RSC4.b>, etc.) 
2. Uses markdown formatting (e.g., **bold**, *italic*, ### headers)
3. Uses bullet points and numbered lists where appropriate
4. Includes direct quotes from the manual in quotation marks
5. Cross-references rules from multiple categories
6. Explains how multiple rules interact and their combined implications
7. For skills challenges, always check the RSC section
8. Pay special attention to rule <RSC4> for skills challenges
9. Provide substantial explanations, not just rule citations`;
    }

    // Create user message object - display the original text but send enhanced text
    const userMessage = { 
      role: 'user' as const, 
      content: originalUserInput // Original for display
    };
    
    // Create the enhanced user message for API call
    const enhancedUserMessage = {
      role: 'user' as const,
      content: enhancedUserContent // Enhanced for API
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Set initial waiting message
    setWaitingMessage(getWaitingMessage());
    setWaitingSeconds(0);
    
    // Start a timer that updates the waiting message every few seconds
    waitingTimerRef.current = setInterval(() => {
      setWaitingSeconds(prev => {
        const newValue = prev + 1;
        // Update progress message every 5 seconds
        if (newValue % 5 === 0) {
          setWaitingMessage(getProgressMessage(newValue));
        }
        return newValue;
      });
    }, 1000);

    try {
      // Keep most recent messages for context
      const recentMessages = messages
        .filter(msg => msg.role !== 'system')
        .slice(-4);
      
      // For API messages, use different approach based on model
      let messagesForAPI: Message[] = [];
      
      if (selectedModel === 'ft_model') {
        // For fine-tuned model: system + recent messages + enhanced user message
        messagesForAPI = [
          systemMessage,
          ...recentMessages,
          enhancedUserMessage // Use enhanced version for API
        ];
        console.log('Sending fine-tuned model request with enhanced user message');
      } else {
        // For regular models: system + recent messages + regular user message
        messagesForAPI = [
          systemMessage,
          ...recentMessages,
          { role: 'user', content: originalUserInput }
        ];
        console.log('Sending standard model request');
      }
      
      console.log('User query being sent to API:', enhancedUserContent);
      const response = await getChatResponse(messagesForAPI, selectedModel, isAdmin);
      
      if (response) {
        const assistantMessage = { role: 'assistant' as const, content: response };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'I apologize, but I encountered an error. Please check your internet connection and try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Clear the waiting timer
      if (waitingTimerRef.current) {
        clearInterval(waitingTimerRef.current);
        waitingTimerRef.current = null;
      }
      setWaitingMessage('');
      setWaitingSeconds(0);
      setIsLoading(false);
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    }
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) {
        clearInterval(waitingTimerRef.current);
      }
    };
  }, []);

  // Helper function to create a condensed version of the rules
  const createCondensedRulesSummary = (fullPrompt: string): string => {
    // Extract the most important sections from the full prompt
    // This is a simplified approach - you may need to customize based on your prompt structure
    
    // Split the prompt into sections
    const sections = fullPrompt.split(/#{2,3}\s+/); // Split on markdown headings
    
    // Extract key sections (first 1000 chars of each important section)
    const keyPhrases = [
      "Match Duration", "Scoring", "Game Modes", "Field Setup", 
      "Robot Specifications", "Competition Procedures"
    ];
    
    let condensed = "CONDENSED RULES SUMMARY:\n\n";
    
    // Find and extract key sections
    for (const section of sections) {
      const firstLine = section.split('\n')[0];
      if (keyPhrases.some(phrase => firstLine.includes(phrase))) {
        // Add the section title and first 1000 chars
        condensed += `## ${firstLine}\n${section.substring(0, 1000)}...\n\n`;
      }
    }
    
    // Ensure we don't exceed a reasonable size
    if (condensed.length > 8000) {
      condensed = condensed.substring(0, 8000) + "...(truncated)";
    }
    
    return condensed;
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        handleSend();
      }
    }
  };

  const markdownStyles: MarkdownStyles = {
    body: {
      color: theme.colors.text,
    },
    heading1: {
      color: theme.colors.primary,
      fontSize: 24,
      fontWeight: '700',
      marginVertical: 8,
    },
    heading2: {
      color: theme.colors.primary,
      fontSize: 20,
      fontWeight: '600',
      marginVertical: 6,
    },
    heading3: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: '600',
      marginVertical: 4,
    },
    strong: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    em: {
      fontStyle: 'italic',
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: theme.colors.background,
      borderLeftColor: theme.colors.primary,
      borderLeftWidth: 4,
      paddingLeft: 8,
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: theme.colors.background,
      padding: 4,
      borderRadius: 4,
    },
  };

  return (
    <View style={styles.container}>
      <GeometricBackground />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 64}
      >
        {isAdmin && (
          <View style={styles.modelSelector}>
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.modelButton}
            >
              Model: {MODELS[selectedModel].split(':')[0]}
            </Button>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={{ x: 0, y: 0 }}
            >
              <Menu.Item 
                onPress={() => {
                  setSelectedModel('4o');
                  setMenuVisible(false);
                }} 
                title="GPT-4o" 
              />
              <Menu.Item 
                onPress={() => {
                  setSelectedModel('4o_mini');
                  setMenuVisible(false);
                }} 
                title="GPT-4o Mini" 
              />
              <Menu.Item 
                onPress={() => {
                  setSelectedModel('ft_model');
                  setMenuVisible(false);
                }} 
                title="Fine-tuned GPT-4o Mini" 
              />
            </Menu>
          </View>
        )}
        
        {!isAdmin && remainingMessages !== null && (
          <View style={styles.messageLimit}>
            <Text style={styles.messageLimitText}>
              Messages remaining: {remainingMessages}/10
            </Text>
          </View>
        )}
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => {
            console.log('Rendering messages:', messages);
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((message, index) => {
            console.log('Rendering message:', message);
            return (
              <Card
                key={index}
                style={[
                  styles.messageCard,
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage
                ]}
              >
                <View style={styles.messageContent}>
                  {message.role === 'assistant' && (
                    <View style={styles.avatar}>
                      <Avatar.Icon 
                        size={24}
                        icon="robot"
                        color={theme.colors.primary}
                      />
                    </View>
                  )}
                  <View style={styles.messageTextContainer}>
                    {message.role === 'user' ? (
                      <Text style={[styles.messageText, styles.userMessageText]}>
                        {message.content}
                      </Text>
                    ) : (
                      <Markdown 
                        style={markdownStyles}
                      >
                        {message.content}
                      </Markdown>
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
          {isLoading && (
            <Card style={[styles.messageCard, styles.assistantMessage]}>
              <View style={styles.messageContent}>
                <View style={styles.avatar}>
                  <Avatar.Icon
                    size={32}
                    icon="robot"
                    style={{ backgroundColor: theme.colors.background }}
                  />
                </View>
                <View style={styles.messageTextContainer}>
                  <Text style={styles.waitingText}>
                    {waitingMessage || getWaitingMessage()}
                  </Text>
                  <ActivityIndicator 
                    style={styles.loadingIndicator} 
                    color={theme.colors.primary}
                    size="small"
                  />
                </View>
              </View>
            </Card>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about VEX IQ rules..."
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon 
                icon="send"
                disabled={!inputText.trim() || isLoading}
                onPress={handleSend}
              />
            }
            onKeyPress={handleKeyPress}
            returnKeyType="send"
            multiline={false}
            maxLength={500}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = RNStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  modelSelector: {
    padding: 16,
    paddingBottom: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  messageCard: {
    marginVertical: 4,
    elevation: 2,
    width: '100%',
    borderRadius: theme.roundness,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  avatar: {
    backgroundColor: theme.colors.background,
    marginRight: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  userMessageText: {
    color: 'white',
  },
  loading: {
    marginVertical: 16,
  },
  inputContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: Platform.OS === 'ios' ? 88 : 64,
  },
  input: {
    backgroundColor: theme.colors.background,
    minHeight: 48,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  messageLimit: {
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    margin: 16,
    marginTop: 0,
    alignItems: 'center',
  },
  messageLimitText: {
    color: theme.colors.placeholder,
    fontSize: 14,
  },
  modelButton: {
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  waitingText: {
    color: theme.colors.text,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  loadingIndicator: {
    marginTop: 8,
  },
}); 