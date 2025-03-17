import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { Navigation } from './src/navigation';
import { theme } from './src/theme';
import { testEnvVariables } from './src/utils/env-test';

export default function App() {
  useEffect(() => {
    // Test environment variables on app startup
    const envTest = testEnvVariables();
    console.log('Environment test results:', envTest);
    
    // Show warnings for any invalid env variables
    if (!envTest.openaiKeyValid) {
      console.warn('⚠️ OpenAI API key appears to be invalid or missing');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
