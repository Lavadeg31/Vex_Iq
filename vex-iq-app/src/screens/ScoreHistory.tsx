import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { theme, styles as globalStyles } from '../theme';
import { GeometricBackground } from '../components/GeometricBackground';
import { Score } from '../types';
import { format } from 'date-fns';
import { getUserScores } from '../utils/db';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export const ScoreHistory: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchScores = useCallback(async () => {
    try {
      if (user) {
        console.log('Fetching scores for user:', user.id);
        setLoading(true);
        const userScores = await getUserScores(user.id);
        console.log('Fetched scores:', userScores);
        setScores(userScores);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
      setError('Failed to load scores');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh scores when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchScores();
    }, [fetchScores])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <GeometricBackground />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GeometricBackground />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {error ? (
          <Card style={[globalStyles.card, styles.errorCard]}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        ) : scores.length === 0 ? (
          <Card style={[globalStyles.card, styles.emptyCard]}>
            <Card.Content>
              <Text style={styles.emptyText}>No scores recorded yet</Text>
            </Card.Content>
          </Card>
        ) : (
          scores.map((score, index) => (
            <Card key={score.id} style={[globalStyles.card, styles.scoreCard]}>
              <Card.Content>
                <View style={styles.headerRow}>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{score.score}</Text>
                    <Text style={styles.pointsText}>points</Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                      {format(new Date(score.timestamp), 'MMM d, yyyy')}
                    </Text>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.modeChip,
                        score.mode === 'skills' && styles.skillsChip,
                      ]}
                      textStyle={styles.modeChipText}
                    >
                      {score.mode}
                    </Chip>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Balls</Text>
                    <Text style={styles.detailValue}>{score.balls}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Switches</Text>
                    <Text style={styles.detailValue}>{score.switches}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Passes</Text>
                    <Text style={styles.detailValue}>{score.passes}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: theme.colors.errorContainer,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
  scoreCard: {
    marginBottom: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  pointsText: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  modeChip: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
  },
  modeChipText: {
    color: theme.colors.primary,
    textTransform: 'capitalize',
    fontSize: 12,
  },
  skillsChip: {
    borderColor: theme.colors.secondary,
  },
  divider: {
    marginVertical: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
}); 