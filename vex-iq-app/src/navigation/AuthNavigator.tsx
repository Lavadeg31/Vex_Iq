import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Login } from '../screens/Login';
import { Register } from '../screens/Register';
import { RootStackParamList } from '../types';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ title: 'Create Account' }}
      />
    </Stack.Navigator>
  );
}; 