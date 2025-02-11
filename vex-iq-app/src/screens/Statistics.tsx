import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, useWindowDimensions } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { theme, styles as globalStyles, chartConfig } from '../theme';
import { GeometricBackground } from '../components/GeometricBackground';
import { Score } from '../types';
import { getUserScores } from '../utils/db';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

export const Statistics: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.min(windowWidth - 48, 600); // Max width of 600px, minimum padding of 24px on each side

  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchScores = useCallback(async () => {
    try {
      if (user) {
        setLoading(true);
        const userScores = await getUserScores(user.id);
        setScores(userScores.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
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

  // Calculate average scores
  const teamworkScores = scores.filter(score => score.mode === 'teamwork');
  const skillsScores = scores.filter(score => score.mode === 'skills');
  
  const avgTeamwork = teamworkScores.length
    ? Math.round(teamworkScores.reduce((acc, curr) => acc + curr.score, 0) / teamworkScores.length)
    : 0;
  
  const avgSkills = skillsScores.length
    ? Math.round(skillsScores.reduce((acc, curr) => acc + curr.score, 0) / skillsScores.length)
    : 0;

  // Prepare data for line chart
  const lineData = {
    labels: scores.map(score => format(new Date(score.timestamp), 'MM/dd')).slice(-7),
    datasets: [{
      data: scores.map(score => score.score).slice(-7),
      color: (opacity = 1) => theme.colors.primary,
      strokeWidth: 2,
    }],
  };

  // Prepare data for bar chart
  const barData = {
    labels: ['Teamwork', 'Skills'],
    datasets: [{
      data: [avgTeamwork, avgSkills],
    }],
  };

  return (
    <View style={styles.container}>
      <GeometricBackground />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {scores.length === 0 ? (
          <Card style={[globalStyles.card, styles.emptyCard]}>
            <Card.Content>
              <Text style={styles.emptyText}>No scores recorded yet</Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card style={[globalStyles.card, styles.statsCard]}>
              <Card.Content>
                <Text style={styles.title}>Score History</Text>
                <Text style={styles.subtitle}>Last 7 matches</Text>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={lineData}
                    width={chartWidth}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                  />
                </View>
              </Card.Content>
            </Card>

            <Card style={[globalStyles.card, styles.statsCard]}>
              <Card.Content>
                <Text style={styles.title}>Average Scores by Mode</Text>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={barData}
                    width={chartWidth}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars
                    yAxisLabel=""
                    yAxisSuffix=""
                  />
                </View>
              </Card.Content>
            </Card>

            <Card style={[globalStyles.card, styles.statsCard, styles.summaryCard]}>
              <Card.Content>
                <Text style={styles.title}>Summary</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Teamwork Average</Text>
                    <Text style={styles.summaryValue}>{avgTeamwork}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Skills Average</Text>
                    <Text style={styles.summaryValue}>{avgSkills}</Text>
                  </View>
                </View>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Matches</Text>
                    <Text style={styles.summaryValue}>{scores.length}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Best Score</Text>
                    <Text style={styles.summaryValue}>
                      {Math.max(...scores.map(score => score.score))}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </>
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
    padding: 24,
    paddingBottom: 120, // Increased to avoid bottom drawer
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  statsCard: {
    width: '100%',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chart: {
    borderRadius: theme.roundness,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  summaryCard: {
    maxWidth: 600, // Match the chart max width
  },
}); 