import { DefaultTheme } from 'react-native-paper';
import { ViewStyle } from 'react-native';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4B6BFB',
    secondary: '#6B7FD7',
    background: '#F8F9FF',
    surface: '#FFFFFF',
    error: '#FF4B60',
    text: '#1A1F36',
    onSurface: '#1A1F36',
    disabled: '#A0A3BD',
    placeholder: '#6E7191',
    backdrop: 'rgba(26, 31, 54, 0.5)',
    notification: '#FF4B60',
    accent: '#6B7FD7',
  },
  roundness: 16,
  animation: {
    scale: 1.0,
  },
};

export const geometricBackgroundStyle: ViewStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: -1,
  opacity: 0.6,
} as const;

export const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

export const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: theme.roundness,
    elevation: 4,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bottomBar: {
    height: 64,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    marginVertical: 8,
    borderRadius: theme.roundness,
    height: 48,
  },
  input: {
    marginVertical: 8,
    backgroundColor: theme.colors.surface,
    height: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    color: theme.colors.text,
  },
}; 