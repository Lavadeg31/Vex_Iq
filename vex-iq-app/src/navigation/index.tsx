import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Timer } from '../components/Timer';
import { ScoreCalculator } from '../components/ScoreCalculator';
import { ScoreHistory } from '../screens/ScoreHistory';
import { Statistics } from '../screens/Statistics';
import { Profile } from '../screens/Profile';
import { theme } from '../theme';
import { GeometricBackground } from '../components/GeometricBackground';
import { View, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AuthNavigator } from './AuthNavigator';

const Tab = createBottomTabNavigator();

const TabBarIcon = (props: {
  focused: boolean;
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}) => {
  return (
    <MaterialCommunityIcons
      name={props.name}
      size={24}
      color={props.focused ? theme.colors.primary : theme.colors.disabled}
    />
  );
};

export const Navigation = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <GeometricBackground />
        {!user ? (
          <AuthNavigator />
        ) : (
          <Tab.Navigator
            screenOptions={{
              tabBarStyle: {
                height: Platform.OS === 'ios' ? 88 : 64,
                paddingBottom: Platform.OS === 'ios' ? 24 : 8,
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
                borderTopWidth: 0,
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.disabled,
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginBottom: Platform.OS === 'ios' ? 24 : 8,
              },
              headerStyle: {
                backgroundColor: 'transparent',
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: theme.colors.text,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Tab.Screen
              name="Timer"
              component={Timer}
              options={{
                title: 'Match Timer',
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} name="timer-outline" />
                ),
              }}
            />
            <Tab.Screen
              name="ScoreCalculator"
              component={ScoreCalculator}
              options={{
                title: 'Calculator',
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} name="calculator-variant-outline" />
                ),
              }}
            />
            <Tab.Screen
              name="History"
              component={ScoreHistory}
              options={{
                title: 'History',
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} name="history" />
                ),
              }}
            />
            <Tab.Screen
              name="Statistics"
              component={Statistics}
              options={{
                title: 'Stats',
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} name="chart-line" />
                ),
              }}
            />
            <Tab.Screen
              name="Profile"
              component={Profile}
              options={{
                title: 'Profile',
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} name="account-circle-outline" />
                ),
              }}
            />
          </Tab.Navigator>
        )}
      </View>
    </NavigationContainer>
  );
}; 