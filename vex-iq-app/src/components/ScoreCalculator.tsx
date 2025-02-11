import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, Card, Divider } from 'react-native-paper';
import { theme, styles as globalStyles } from '../theme';
import { GeometricBackground } from './GeometricBackground';
import { useAuth } from '../contexts/AuthContext';
import { saveScore } from '../utils/db';

const calculateScore = (balls: number, switches: number, passes: number, mode: 'teamwork' | 'skills'): [number, boolean] => {
  let score = 0;
  const matchType = mode === 'teamwork' ? 0 : 1;

  // Adjust passes based on rules
  let adjustedPasses = passes;
  if (switches === 0 && passes > 4 && matchType === 0) {
    adjustedPasses = 4;
  } else if (passes > balls && matchType === 0 && switches !== 0) {
    adjustedPasses = balls;
  }

  const switchKey = [1, 4, 8, 10, 12, 12, 12, 12, 12];
  const scoreKey = matchType === 0 
    ? [1, 1, switchKey[switches]] 
    : [switchKey[switches], 1, 0];

  const matchData = [balls, switches, adjustedPasses];
  
  // Calculate total score
  for (let i = 0; i < 3; i++) {
    score += matchData[i] * scoreKey[i];
  }

  // Check if score is invalid
  const isInvalid = Math.min(...matchData) < 0 || matchData[1] > 4;

  return [score, isInvalid];
};

export const ScoreCalculator: React.FC = () => {
  const [balls, setBalls] = useState('0');
  const [switches, setSwitches] = useState('0');
  const [passes, setPasses] = useState('0');
  const [mode, setMode] = useState<'teamwork' | 'skills'>('teamwork');
  const [score, setScore] = useState<number | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const [breakdown, setBreakdown] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleClear = useCallback(() => {
    setBalls('0');
    setSwitches('0');
    setPasses('0');
    setScore(null);
    setIsInvalid(false);
    setBreakdown([]);
    setError('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) {
      setError('Please log in to save scores');
      return;
    }

    if (!score || isInvalid) {
      setError('Please calculate a valid score first');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await saveScore({
        userId: user.id,
        balls: parseInt(balls) || 0,
        switches: parseInt(switches) || 0,
        passes: parseInt(passes) || 0,
        mode,
        score,
      });
      setError('Score saved successfully!');
    } catch (err) {
      setError('Failed to save score');
      console.error('Error saving score:', err);
    } finally {
      setSaving(false);
    }
  }, [user, score, isInvalid, balls, switches, passes, mode]);

  const handleCalculate = useCallback(() => {
    const ballsNum = parseInt(balls) || 0;
    const switchesNum = parseInt(switches) || 0;
    const passesNum = parseInt(passes) || 0;
    
    const [calculatedScore, invalid] = calculateScore(
      ballsNum,
      switchesNum,
      passesNum,
      mode
    );

    // Calculate breakdown
    const switchKey = [1, 4, 8, 10, 12, 12, 12, 12, 12];
    let breakdownText: string[] = [];
    
    if (mode === 'teamwork') {
      let adjustedPasses = passesNum;
      if (switchesNum === 0 && passesNum > 4) {
        adjustedPasses = 4;
      } else if (passesNum > ballsNum && switchesNum !== 0) {
        adjustedPasses = ballsNum;
      }

      breakdownText = [
        `Balls: ${ballsNum} × 1 = ${ballsNum}`,
        `Switches: ${switchesNum} × 1 = ${switchesNum}`,
        `Passes: ${adjustedPasses} × ${switchKey[switchesNum]} = ${adjustedPasses * switchKey[switchesNum]}`,
        switchesNum === 0 && passesNum > 4 ? '(Passes capped at 4 when no switches)' : '',
        passesNum > ballsNum && switchesNum !== 0 ? '(Passes capped at number of balls)' : ''
      ].filter(text => text !== '');
    } else {
      breakdownText = [
        `Balls: ${ballsNum} × ${switchKey[switchesNum]} = ${ballsNum * switchKey[switchesNum]}`,
        `Switches: ${switchesNum} × 1 = ${switchesNum}`,
        'Passes are not counted in Skills mode'
      ];
    }

    setScore(calculatedScore);
    setIsInvalid(invalid);
    setBreakdown(breakdownText);
  }, [balls, switches, passes, mode]);

  return (
    <View style={styles.wrapper}>
      <GeometricBackground />
      <ScrollView style={styles.container}>
        <Card style={[globalStyles.card, styles.modeCard]}>
          <Card.Content>
            <Text style={styles.modeTitle}>Game Mode</Text>
            <SegmentedButtons
              value={mode}
              onValueChange={value => setMode(value as 'teamwork' | 'skills')}
              buttons={[
                { value: 'teamwork', label: 'Teamwork' },
                { value: 'skills', label: 'Skills' },
              ]}
              style={styles.segmentedButton}
            />
            <Text style={styles.modeDescription}>
              {mode === 'teamwork' 
                ? 'In Teamwork mode, passes are worth the switch value (max 4 passes without switches)'
                : 'In Skills mode, balls are worth the switch value'}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[globalStyles.card, styles.inputCard]}>
          <Card.Content>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Balls</Text>
                <TextInput
                  value={balls}
                  onChangeText={setBalls}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Switches</Text>
                <TextInput
                  value={switches}
                  onChangeText={setSwitches}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Passes</Text>
                <TextInput
                  value={passes}
                  onChangeText={setPasses}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                  disabled={mode === 'skills'}
                />
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleCalculate}
              style={[globalStyles.button, styles.calculateButton]}
            >
              Calculate Score
            </Button>
          </Card.Content>
        </Card>

        {score !== null && (
          <Card style={[globalStyles.card, styles.resultCard]}>
            <Card.Content>
              <Text style={[styles.scoreText, isInvalid && styles.invalidScore]}>
                {score}
              </Text>
              <Text style={styles.pointsText}>points</Text>

              {isInvalid && (
                <Text style={styles.invalidText}>
                  Invalid input combination
                </Text>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={[globalStyles.button, styles.actionButton]}
                  loading={saving}
                  disabled={saving || isInvalid || !score}
                  icon="content-save"
                >
                  Save
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleClear}
                  style={[globalStyles.button, styles.actionButton]}
                  icon="refresh"
                >
                  Clear
                </Button>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Divider style={styles.divider} />

              <View style={styles.breakdownContainer}>
                <Text style={styles.breakdownTitle}>Score Breakdown</Text>
                {breakdown.map((line, index) => (
                  <Text key={index} style={styles.breakdownText}>{line}</Text>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  modeCard: {
    marginBottom: 16,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.primary,
  },
  modeDescription: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: 8,
  },
  segmentedButton: {
    marginBottom: 8,
  },
  inputCard: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  calculateButton: {
    marginTop: 8,
  },
  resultCard: {
    marginTop: 16,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: 16,
  },
  invalidScore: {
    color: theme.colors.error,
  },
  invalidText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  breakdownContainer: {
    padding: 16,
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text,
  },
  breakdownText: {
    fontSize: 14,
    color: theme.colors.text,
    marginVertical: 4,
  },
}); 