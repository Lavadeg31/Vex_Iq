export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Score {
  id: string;
  userId: string;
  balls: number;
  switches: number;
  passes: number;
  mode: 'teamwork' | 'skills';
  score: number;
  timestamp: string;
}

export interface Settings {
  id: string;
  userId: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageLimit {
  id: string;
  userId: string;
  messageCount: number;
  lastReset: string;
}

export interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  initialTime: number;
}

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Timer: undefined;
  ScoreCalculator: undefined;
  Rules: undefined;
  History: undefined;
  Profile: undefined;
  Settings: undefined;
}; 