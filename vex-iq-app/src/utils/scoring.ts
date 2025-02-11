export const calculateScore = (balls: number, switches: number, passes: number, mode: 'teamwork' | 'skills'): [number, boolean] => {
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