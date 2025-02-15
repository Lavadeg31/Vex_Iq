import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Button, Switch, List, IconButton } from 'react-native-paper';
import { theme, styles as globalStyles } from '../theme';
import { GeometricBackground } from './GeometricBackground';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const INITIAL_TIME = 60; // 1 minute in seconds

export const Timer: React.FC = () => {
  const [time, setTime] = useState(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null);
  const [hasCountdown, setHasCountdown] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();
  const mainSoundRef = useRef<Audio.Sound | null>(null);
  const countdownSoundRef = useRef<Audio.Sound | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animation for countdown and last 10 seconds
  const pulseAnimation = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
    ]).start();
  };

  useEffect(() => {
    // Set up audio session
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        await loadSounds();
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };
    
    setupAudio();
    return () => {
      stopAndResetAudio();
    };
  }, []);

  const loadSounds = async () => {
    try {
      if (mainSoundRef.current) {
        await mainSoundRef.current.unloadAsync();
      }
      if (countdownSoundRef.current) {
        await countdownSoundRef.current.unloadAsync();
      }

      const mainSound = new Audio.Sound();
      const countdownSound = new Audio.Sound();

      await mainSound.loadAsync(require('../../assets/timer2.mp3'));
      await countdownSound.loadAsync(require('../../assets/timer.mp3'));

      mainSoundRef.current = mainSound;
      countdownSoundRef.current = countdownSound;

      // Set up status update handlers
      mainSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsRunning(false);
          setTime(0);
        }
      });

      countdownSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          // Countdown sound finished
        }
      });
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  };

  const stopAndResetAudio = async () => {
    try {
      if (mainSoundRef.current) {
        try {
          await mainSoundRef.current.stopAsync();
          await mainSoundRef.current.unloadAsync();
        } catch (e) {
          // Ignore stop errors
        }
        mainSoundRef.current = null;
      }
      if (countdownSoundRef.current) {
        try {
          await countdownSoundRef.current.stopAsync();
          await countdownSoundRef.current.unloadAsync();
        } catch (e) {
          // Ignore stop errors
        }
        countdownSoundRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const clearAllIntervals = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = undefined;
    }
  };

  const startMainTimer = async () => {
    clearAllIntervals();
    setIsRunning(true);
    setTime(INITIAL_TIME - 1); // Start at exactly 1:00

    if (!isMuted && !hasCountdown) {
      try {
        await loadSounds(); // Reload sounds before playing
        if (mainSoundRef.current) {
          await mainSoundRef.current.setPositionAsync(0);
          await mainSoundRef.current.playAsync();
        }
      } catch (error) {
        console.error('Error playing main sound:', error);
      }
    }

    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearAllIntervals();
          setIsRunning(false);
          return 0;
        }
        if (prevTime <= 11) { // Animate for last 10 seconds
          pulseAnimation();
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const startCountdown = async () => {
    clearAllIntervals();
    setCountdownNumber(3);
    pulseAnimation();

    if (!isMuted) {
      try {
        await loadSounds(); // Reload sounds before playing
        if (countdownSoundRef.current) {
          await countdownSoundRef.current.setPositionAsync(0);
          await countdownSoundRef.current.playAsync();
        }
      } catch (error) {
        console.error('Error playing countdown sound:', error);
      }
    }

    countdownRef.current = setInterval(() => {
      setCountdownNumber((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = undefined;
          setCountdownNumber(null);
          startMainTimer();
          return null;
        }
        pulseAnimation();
        return prev - 1;
      });
    }, 1000);
  };

  const toggleTimer = async () => {
    if (!isRunning) {
      if (hasCountdown) {
        await startCountdown();
      } else {
        await startMainTimer();
      }
    } else {
      clearAllIntervals();
      setIsRunning(false);
      await stopAndResetAudio();
    }
  };

  const resetTimer = async () => {
    clearAllIntervals();
    setIsRunning(false);
    setTime(INITIAL_TIME);
    setCountdownNumber(null);
    await stopAndResetAudio();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <GeometricBackground />
      <View style={styles.content}>
        <Animated.Text 
          style={[
            styles.timerText,
            { 
              transform: [{ scale: scaleAnim }],
              color: time <= 10 ? theme.colors.error : theme.colors.primary,
              fontSize: countdownNumber ? 120 : 72, // Bigger font for countdown
            }
          ]}
        >
          {countdownNumber ?? formatTime(time)}
        </Animated.Text>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={toggleTimer}
            style={[globalStyles.button, styles.button]}
            icon={isRunning ? "pause" : "play"}
            buttonColor={isRunning ? theme.colors.error : theme.colors.primary}
          >
            {isRunning ? 'Stop' : 'Start'}
          </Button>
          <Button
            mode="outlined"
            onPress={resetTimer}
            style={[globalStyles.button, styles.button]}
            icon="refresh"
          >
            Reset
          </Button>
        </View>

        <List.Item
          title="Use Countdown"
          description="Toggle between countdown and regular timer"
          left={props => <List.Icon {...props} icon={hasCountdown ? "timer-outline" : "timer"} />}
          right={() => (
            <Switch
              value={hasCountdown}
              onValueChange={setHasCountdown}
              disabled={isRunning}
              color={theme.colors.primary}
            />
          )}
          style={styles.settingItem}
        />

        <List.Item
          title="Sound"
          description="Toggle timer sounds"
          left={props => <List.Icon {...props} icon={isMuted ? "volume-off" : "volume-high"} />}
          right={() => (
            <Switch
              value={!isMuted}
              onValueChange={(value) => setIsMuted(!value)}
              disabled={isRunning}
              color={theme.colors.primary}
            />
          )}
          style={styles.settingItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 150,
  },
  timerText: {
    fontWeight: 'bold',
    marginBottom: 32,
    includeFontPadding: false,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 32,
  },
  button: {
    marginHorizontal: 8,
    minWidth: 120,
  },
  settingItem: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    marginVertical: 4,
  },
}); 