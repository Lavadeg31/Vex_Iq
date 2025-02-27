import React from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { theme } from '../theme';
import { GeometricBackground } from '../components/GeometricBackground';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Svg, { Path, Circle } from 'react-native-svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeIllustration = () => (
  <Svg width="200" height="200" viewBox="0 0 200 200">
    {/* Robot icon */}
    <Circle cx="100" cy="100" r="60" fill={theme.colors.primary} opacity="0.1" />
    <Path
      d="M100 50
         C 120 50, 140 70, 140 90
         C 140 110, 120 130, 100 130
         C 80 130, 60 110, 60 90
         C 60 70, 80 50, 100 50"
      stroke={theme.colors.primary}
      strokeWidth="2"
      fill="none"
    />
    {/* Timer elements */}
    <Circle cx="160" cy="40" r="20" fill={theme.colors.secondary} opacity="0.1" />
    <Circle cx="40" cy="160" r="15" fill={theme.colors.accent} opacity="0.2" />
    {/* Calculator elements */}
    <Path
      d="M150 150 L170 170 M150 170 L170 150"
      stroke={theme.colors.primary}
      strokeWidth="2"
      opacity="0.5"
    />
  </Svg>
);

type IconName = 'timer' | 'calculator' | 'book-open-variant' | 'chart-line';

const FeatureItem = ({ icon, title }: { icon: IconName; title: string }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons 
      name={icon} 
      size={24} 
      color={theme.colors.primary}
      style={styles.featureIcon}
    />
    <Text style={styles.featureText}>{title}</Text>
  </View>
);

export const Welcome: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <GeometricBackground />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <WelcomeIllustration />
          <Text style={styles.title}>Vexify</Text>
          <Text style={styles.subtitle}>
            Your VEX IQ Rapid Relay companion for scoring, timing, and rules
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem icon="timer" title="Match Timer" />
          <FeatureItem icon="calculator" title="Score Calculator" />
          <FeatureItem icon="book-open-variant" title="Rules Assistant" />
          <FeatureItem icon="chart-line" title="Performance Tracking" />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Get Started
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          style={[styles.button, styles.secondaryButton]}
          contentStyle={styles.buttonContent}
        >
          Create Account
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 24,
  },
  features: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.roundness,
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featureIcon: {
    marginRight: 16,
    backgroundColor: `${theme.colors.primary}10`,
    padding: 8,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backdrop,
  },
  button: {
    marginVertical: 8,
    borderRadius: theme.roundness,
  },
  buttonContent: {
    height: 48,
  },
  secondaryButton: {
    borderColor: theme.colors.primary,
  },
}); 