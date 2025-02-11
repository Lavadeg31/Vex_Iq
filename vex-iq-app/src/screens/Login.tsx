import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';
import { GeometricBackground } from '../components/GeometricBackground';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const Login: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <GeometricBackground />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.triangle} />
            <View style={styles.triangleStroke} />
          </View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>Vexify</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            outlineColor={theme.colors.primary}
            activeOutlineColor={theme.colors.primary}
            right={<TextInput.Icon icon="email" />}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            outlineColor={theme.colors.primary}
            activeOutlineColor={theme.colors.primary}
            right={<TextInput.Icon icon="lock" />}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            loading={loading}
            disabled={loading}
          >
            Log In
          </Button>

          <Text style={styles.orText}>Or</Text>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Register')}
            style={styles.signUpButton}
            textColor={theme.colors.primary}
          >
            Sign Up
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 32,
    borderRightWidth: 32,
    borderBottomWidth: 55,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
    top: 4,
  },
  triangleStroke: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 28,
    borderRightWidth: 28,
    borderBottomWidth: 48,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: theme.colors.primary,
    top: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.background,
  },
  loginButton: {
    marginTop: 8,
    height: 48,
    justifyContent: 'center',
  },
  signUpButton: {
    borderColor: theme.colors.primary,
    height: 48,
    justifyContent: 'center',
  },
  orText: {
    textAlign: 'center',
    color: theme.colors.placeholder,
    marginVertical: 16,
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
}); 