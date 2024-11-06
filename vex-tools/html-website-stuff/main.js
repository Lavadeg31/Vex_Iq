// Global variables
let mode = 'teamwork';
let isRunning = false;
let timerInterval = null;
let countdownInterval = null;
let countdown = 3;
let timeLeft = 60;
let scores = [];
let timerAudio = new Audio('Timer.mp3');
let timerAudioNoCountdown = new Audio('Timer2.mp3');
let charts = {};
let pausedTime = 0;
let secretCode = '';
let secretTimer = null;

// Add this near the top of your file, after the global variables
const chartConfig = {
  responsive: true,
  maintainAspectRatio: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 15,
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
};

// ... existing code ...

document.addEventListener('DOMContentLoaded', function() {
  // Add these timer button event listeners
  const startPauseButton = document.getElementById('startPauseButton');
  const resetButton = document.getElementById('resetButton');
  
  if (startPauseButton) {
    startPauseButton.addEventListener('click', startPauseTimer);
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', resetTimer);
  }

  // ... rest of the DOMContentLoaded code ...
});

// Update the calculateScores function to handle dark mode text
function calculateScores() {
  // ... existing calculation code ...

  let resultElement = document.getElementById('result');
  if(scoreInvalid) {
    resultElement.style.color = "red";
    resultElement.innerHTML = "Illegal Score: " + score.toString();
  } else {
    resultElement.style.removeProperty('color'); // Remove any inline color
    resultElement.classList.remove('text-black'); // Remove any explicit black color
    resultElement.classList.add('text-base-content'); // Use theme-aware text color
    resultElement.innerHTML = "Total Points: " + score.toString();
  }

  return score;
}

// Utility Functions
function calculateMovingAverage(scores, window) {
  return scores.map((_, index, array) => 
    array.slice(Math.max(0, index - window + 1), index + 1)
         .reduce((sum, num) => sum + num, 0) / Math.min(index + 1, window)
  );
}

function encodeBase64(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

function decodeBase64(str) {
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

function deleteLastScore() {
  if (scores.length > 0) {
    scores.pop();
    saveScores();
    updateLiveScores();
    updateScoreHistory();
    updateStatistics();
    if (document.getElementById('showAllGraphs')?.checked) {
      updateGraphs();
    }
    showToast('Last score deleted', 'info');
  } else {
    showToast('No scores to delete', 'warning');
  }
}

// Theme and Mode Functions
function toggleTheme() {
  const body = document.body;
  const isDark = body.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
  chrome.storage.sync.set({ theme: newTheme });
  
  // Update charts with new theme
  if (document.getElementById('showAllGraphs').checked) {
    updateGraphs();
  }
}

function toggleMode() {
  const modeToggle = document.getElementById('mode-toggle');
  mode = modeToggle.checked ? 'skills' : 'teamwork';
  const passesGroup = document.getElementById('passes-group');
  const inputsGrid = document.getElementById('score-inputs-grid');
  
  if (mode === 'skills') {
    passesGroup.style.display = 'none';
    inputsGrid.classList.remove('md:grid-cols-3');
    inputsGrid.classList.add('md:grid-cols-2', 'max-w-2xl', 'mx-auto');
  } else {
    passesGroup.style.display = 'block';
    inputsGrid.classList.add('md:grid-cols-3');
    inputsGrid.classList.remove('md:grid-cols-2', 'max-w-2xl', 'mx-auto');
  }
  calculateScores();
}

// Timer Functions
function updateTimerDisplay(minutes, seconds) {
  const minutesDisplay = document.getElementById('timer-minutes');
  const secondsDisplay = document.getElementById('timer-seconds');
  
  if (minutesDisplay && secondsDisplay) {
    minutesDisplay.style.setProperty('--value', minutes);
    secondsDisplay.style.setProperty('--value', seconds);
  }
}

function startPauseTimer() {
  const startPauseButton = document.getElementById("startPauseButton");
  const displayCountdown = document.getElementById("countdown-toggle")?.checked || false;

  if (!isRunning) {
    isRunning = true;
    if (startPauseButton) {
      startPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m-9-3a9 9 0 1118 0 9 9 0 01-18 0z" />
        </svg>
      `;
    }

    if (pausedTime > 0) {
      timeLeft = pausedTime;
      startMainTimer();
    } else if (displayCountdown && countdown > 0) {
      timerAudio.currentTime = 0;
      timerAudio.play().catch(e => {
        console.log('Audio play failed:', e);
        startMainTimer();
      });
      
      updateTimerDisplay(0, countdown);
      countdownInterval = setInterval(() => {
        countdown--;
        updateTimerDisplay(0, countdown);
        if (countdown === 0) {
          clearInterval(countdownInterval);
          countdown = 3;
          startMainTimer();
        }
      }, 1000);
    } else {
      timerAudioNoCountdown.currentTime = 0;
      timerAudioNoCountdown.play().catch(e => {
        console.log('Audio play failed:', e);
        startMainTimer();
      });
      startMainTimer();
    }
  } else {
    pauseTimer();
    if (startPauseButton) {
      startPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        </svg>
      `;
    }
  }
}

function startMainTimer() {
  timeLeft = 60;
  updateTimerDisplay(Math.floor(timeLeft / 60), timeLeft % 60);
  
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(Math.floor(timeLeft / 60), timeLeft % 60);
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      const startPauseButton = document.getElementById("startPauseButton");
      if (startPauseButton) {
        startPauseButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        `;
      }
      // Stop any playing audio
      timerAudio.pause();
      timerAudio.currentTime = 0;
      timerAudioNoCountdown.pause();
      timerAudioNoCountdown.currentTime = 0;
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  clearInterval(countdownInterval);
  isRunning = false;
  pausedTime = timeLeft;

  timerAudio.pause();
  timerAudio.currentTime = 0;
  timerAudioNoCountdown.pause();
  timerAudioNoCountdown.currentTime = 0;
}

function resetTimer() {
  clearInterval(timerInterval);
  clearInterval(countdownInterval);
  isRunning = false;
  countdown = 3;
  timeLeft = 60;
  pausedTime = 0;
  updateTimerDisplay(0, 60);
  
  const startPauseButton = document.getElementById("startPauseButton");
  if (startPauseButton) {
    startPauseButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      </svg>
    `;
  }
  
  timerAudio.pause();
  timerAudio.currentTime = 0;
  timerAudioNoCountdown.pause();
  timerAudioNoCountdown.currentTime = 0;
}

// Score Functions
function calculateScores() {
  let score = 0;
  let scoreInvalid = false;

  let balls = document.getElementById('goals-display').value;
  let switches = document.getElementById('switches-display').value;
  let passes = document.getElementById('passes-display').value;

  let matchType = (mode === 'teamwork') ? 0 : 1;

  balls = (balls == "") ? 0 : parseInt(balls);
  switches = (switches == "") ? 0 : parseInt(switches);
  passes = (passes == "") ? 0 : parseInt(passes);

  if(switches == 0 && passes > 4 && matchType == 0) {
    passes = 4;
  }
  else if(passes > balls && matchType == 0 && switches != 0) {
    passes = balls;
  }

  const switchKey = [1,4,8,10,12,12,12,12,12];
  let scoreKey = (matchType == 0) ? [1,1,switchKey[switches]] : [switchKey[switches],1,0];

  let matchData = [balls, switches, passes];
  matchData = matchData.map(function(currentElement) {
    return currentElement == "" ? 0 : parseInt(currentElement);
  });

  for(let i=0; i<3; i++) {
    score += matchData[i] * scoreKey[i];
  }

  if(matchType == 0) {
    document.getElementById('passes-group').style.display = "block";
  } else {
    document.getElementById('passes-group').style.display = "none";
  }

  scoreInvalid = (Math.min.apply(Math, matchData) < 0 || matchData[1] > 4);
  let resultElement = document.getElementById('result');
  if(scoreInvalid) {
    resultElement.style.color = "red";
    resultElement.innerHTML = "Illegal Score: " + score.toString();
  } else {
    resultElement.style.removeProperty('color'); // Remove any inline color
    resultElement.classList.remove('text-black'); // Remove any explicit black color
    resultElement.classList.add('text-base-content'); // Use theme-aware text color
    resultElement.innerHTML = "Total Points: " + score.toString();
  }

  return score;
}

function adjustValue(field, change) {
  const input = document.getElementById(`${field}-display`);
  if (!input) return;
  
  if (field === 'switches') {
    handleSecretCode(Math.abs(change).toString());
  }
  
  let value = parseInt(input.value) + change;
  input.value = Math.max(0, value);
  if (field === 'switches') {
    input.value = Math.min(4, input.value);
  }
  calculateScores();
}

function resetValues() {
  const fields = ['goals', 'switches', 'passes'];
  fields.forEach(field => {
    const input = document.getElementById(`${field}-display`);
    if (input) input.value = '0';
  });
  calculateScores();
}

// Table Functions
function updateLiveScores() {
  const table = document.getElementById('liveScoreTable');
  if (!table) return;
  
  table.innerHTML = '';
  
  const recentScores = [...scores].reverse().slice(0, 5);
  
  recentScores.forEach(entry => {
    const row = document.createElement('tr');
    const score = typeof entry === 'object' ? entry.score : entry;
    const date = typeof entry === 'object' ? entry.date : new Date().toLocaleDateString();
    
    row.innerHTML = `
      <td class="text-center text-sm">${score || 0}</td>
      <td class="text-center text-sm">${date || new Date().toLocaleDateString()}</td>
    `;
    table.appendChild(row);
  });

  // Fill empty rows
  const emptyRows = 5 - recentScores.length;
  for (let i = 0; i < emptyRows; i++) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="text-center text-sm">-</td>
      <td class="text-center text-sm">-</td>
    `;
    table.appendChild(row);
  }
}
function updateScoreHistory() {
  const historyColumns = document.getElementById('scoreHistoryColumns');
  if (!historyColumns) return;
  
  historyColumns.innerHTML = '';
  
  if (scores.length === 0) {
    const columnDiv = createHistoryColumn(0, 0);
    historyColumns.appendChild(columnDiv);
    return;
  }
  
  const itemsPerColumn = 10;
  const numberOfColumns = Math.ceil(scores.length / itemsPerColumn);
  
  for (let col = 0; col < numberOfColumns; col++) {
    const startIndex = col * itemsPerColumn;
    const endIndex = Math.min((col + 1) * itemsPerColumn, scores.length);
    const columnDiv = createHistoryColumn(startIndex, endIndex);
    historyColumns.appendChild(columnDiv);
  }
}

function createHistoryColumn(startIndex, endIndex) {
  const columnDiv = document.createElement('div');
  columnDiv.className = 'overflow-x-auto';
  
  const table = document.createElement('table');
  table.className = 'table table-zebra w-full';
  
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Attempt</th>
      <th>Score</th>
      <th>Date</th>
    </tr>
  `;
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  
  for (let i = startIndex; i < endIndex; i++) {
    const row = document.createElement('tr');
    row.className = 'hover:bg-base-200 transition-colors duration-200';
    const entry = scores[i];
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${entry.score || entry}</td>
      <td>${entry.date || new Date().toLocaleDateString()}</td>
    `;
    tbody.appendChild(row);
  }
  
  table.appendChild(tbody);
  columnDiv.appendChild(table);
  return columnDiv;
}
function updateGraphs() {
  console.log('Updating graphs...');
  destroyCharts();
  const colors = getThemeColors();
  
  const ctx1 = document.getElementById('scoreHistory')?.getContext('2d');
  const ctx2 = document.getElementById('movingAverage')?.getContext('2d');
  const ctx3 = document.getElementById('scoreDistribution')?.getContext('2d');
  const ctx4 = document.getElementById('progressionChart')?.getContext('2d');

  console.log('Contexts:', { ctx1, ctx2, ctx3, ctx4 });

  if (scores.length === 0) {
    console.log('No scores available');
    return;
  }

  const scoreValues = scores.map(entry => typeof entry === 'object' ? entry.score : entry);
  const dates = scores.map(entry => typeof entry === 'object' ? entry.date : '');

  console.log('Score values:', scoreValues);
  console.log('Dates:', dates);

  try {
    // Score History Chart
    if (ctx1) {
      console.log('Creating score history chart...');
      charts.history = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            label: 'Score History',
            data: scoreValues,
            borderColor: colors.primary,
            backgroundColor: colors.primary + '20',
            fill: true,
            tension: 0.1
          }]
        },
        options: chartConfig
      });
    }

    // Moving Average Chart
    if (ctx2) {
      console.log('Creating moving average chart...');
      const movingAverages = calculateMovingAverage(scoreValues, 5);
      charts.average = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            label: 'Actual Scores',
            data: scoreValues,
            borderColor: colors.primary,
            backgroundColor: 'transparent',
            borderWidth: 1,
            pointRadius: 3
          }, {
            label: '5-Match Average',
            data: movingAverages,
            borderColor: colors.secondary,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0
          }]
        },
        options: chartConfig
      });
    }

    // Score Distribution Chart
    if (ctx3) {
      console.log('Creating distribution chart...');
      const bins = {};
      const binSize = 5;
      scoreValues.forEach(score => {
        const bin = Math.floor(score / binSize) * binSize;
        bins[bin] = (bins[bin] || 0) + 1;
      });

      const labels = Object.keys(bins).sort((a, b) => Number(a) - Number(b));
      const data = labels.map(key => bins[key]);

      charts.distribution = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: labels.map(l => `${l}-${Number(l) + binSize - 1}`),
          datasets: [{
            label: 'Frequency',
            data: data,
            backgroundColor: colors.primary + '80',
            borderColor: colors.primary,
            borderWidth: 1
          }]
        },
        options: chartConfig
      });
    }

    // Progression Chart
    if (ctx4) {
      console.log('Creating progression chart...');
      const progressionData = scoreValues.map((score, index) => ({
        x: index + 1,
        y: score
      }));

      const bestFitLine = calculateBestFitLine(progressionData);

      charts.progression = new Chart(ctx4, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Scores',
            data: progressionData,
            backgroundColor: colors.primary,
            pointRadius: 6,
            pointHoverRadius: 8
          }, {
            label: 'Trend Line',
            data: bestFitLine,
            type: 'line',
            borderColor: colors.secondary,
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 2,
            borderDash: [5, 5]
          }]
        },
        options: {
          ...chartConfig,
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Attempt Number'
              },
              min: 1,  // Start from 1
              max: Math.max(scoreValues.length, 10),  // Set max to number of scores or 10, whichever is larger
              ticks: {
                stepSize: 1,  // Show whole numbers only
                maxTicksLimit: 10  // Limit number of ticks to prevent overcrowding
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Score'
              }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error creating charts:', error);
  }
}
// Statistics Functions
function updateStatistics() {
  if (scores.length === 0) {
    document.getElementById('averageScore').textContent = '0';
    document.getElementById('highScore').textContent = '0';
    document.getElementById('totalAttempts').textContent = '0';
    document.getElementById('scoreChange').textContent = 'No change';
    document.getElementById('lastScore').textContent = 'Last: 0';
    return;
  }
  
  const scoreValues = scores.map(entry => entry.score || entry);
  const total = scoreValues.reduce((a, b) => a + b, 0);
  const avg = total / scores.length;
  const max = Math.max(...scoreValues);
  
  document.getElementById('averageScore').textContent = avg.toFixed(1);
  document.getElementById('highScore').textContent = max;
  document.getElementById('totalAttempts').textContent = scores.length;
  document.getElementById('lastScore').textContent = `Last: ${scoreValues[scoreValues.length - 1]}`;
  
  if (scores.length > 1) {
    const change = ((scoreValues[scoreValues.length - 1] - scoreValues[scoreValues.length - 2]) / scoreValues[scoreValues.length - 2] * 100).toFixed(1);
    document.getElementById('scoreChange').textContent = `${change}% from last`;
  }
}

// Add these functions before the DOMContentLoaded event listener

function addToTable() {
  const currentScore = calculateScores();
  if (!document.getElementById('result').style.color.includes('red')) {
    const scoreEntry = {
      score: currentScore,
      date: new Date().toLocaleDateString()
    };
    scores.push(scoreEntry);
    saveScores();
    updateLiveScores();
    updateScoreHistory();
    updateStatistics();
    resetValues();
  }
}
// Update the export function to use base64
function exportScores() {
  const data = {
    scores: scores,
    timestamp: new Date().toISOString()
  };
  
  // Convert to base64
  const jsonString = JSON.stringify(data.scores); // Just encode the scores array
  const base64Data = btoa(jsonString);
  
  // Create text file with base64 content
  const blob = new Blob([base64Data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scores_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Update the import function to handle both base64 and regular JSON
function handleFile(event) {
  event.preventDefault(); // Prevent default behavior
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const content = e.target.result;
        let parsedScores;

        // Try parsing as base64 first
        try {
          const decodedContent = atob(content.trim());
          parsedScores = JSON.parse(decodedContent);
        } catch (base64Error) {
          // If base64 fails, try parsing as regular JSON
          try {
            const jsonData = JSON.parse(content);
            parsedScores = jsonData.scores || jsonData;
          } catch (jsonError) {
            throw new Error('Invalid file format');
          }
        }

        // Validate that we have an array of scores
        if (Array.isArray(parsedScores)) {
          scores = parsedScores;
          saveScores();
          updateLiveScores();
          updateScoreHistory();
          updateStatistics();
          if (document.getElementById('showAllGraphs')?.checked) {
            updateGraphs();
          }
          showToast('Scores imported successfully', 'success');
        } else {
          throw new Error('Invalid scores format');
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        showToast('Error importing scores: Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  }
  // Reset file input
  event.target.value = '';
}

function addScrollShadows() {
  const scrollContainers = document.querySelectorAll('.overflow-x-auto');
  scrollContainers.forEach(container => {
    container.addEventListener('scroll', function() {
      const maxScroll = this.scrollWidth - this.clientWidth;
      this.classList.toggle('shadow-left', this.scrollLeft > 0);
      this.classList.toggle('shadow-right', this.scrollLeft < maxScroll);
    });
  });
}

// Add function to save scores
function saveScores() {
  // Save to sync storage (limited to 102,400 bytes)
  chrome.storage.sync.set({ 'savedScores': scores }, function() {
    if (chrome.runtime.lastError) {
      // If sync storage fails, fall back to local storage
      chrome.storage.local.set({ 'savedScores': scores }, function() {
        console.log('Scores saved to local storage');
      });
    } else {
      console.log('Scores saved to sync storage');
    }
  });
}

// Add function to load scores
function loadScores() {
  // Try to load from sync storage first
  chrome.storage.sync.get(['savedScores'], function(result) {
    if (chrome.runtime.lastError || !result.savedScores) {
      // If sync fails or is empty, try local storage
      chrome.storage.local.get(['savedScores'], function(localResult) {
        if (localResult.savedScores) {
          scores = localResult.savedScores;
          updateLiveScores();
          updateScoreHistory();
          updateStatistics();
          if (document.getElementById('showAllGraphs').checked) {
            updateGraphs();
          }
        }
      });
    } else {
      scores = result.savedScores;
      updateLiveScores();
      updateScoreHistory();
      updateStatistics();
      if (document.getElementById('showAllGraphs').checked) {
        updateGraphs();
      }
    }
  });
}

// Add this function to get theme-aware colors
function getThemeColors() {
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    primary: computedStyle.getPropertyValue('--p') || '#570df8',
    secondary: computedStyle.getPropertyValue('--s') || '#f000b8',
    text: computedStyle.getPropertyValue('--bc') || '#1f2937',
    background: computedStyle.getPropertyValue('--b1') || '#ffffff'
  };
}

function destroyCharts() {
  Object.values(charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  charts = {};
}

// Add this helper function for calculating the best fit line
function calculateBestFitLine(data) {
  if (data.length < 2) return [];
  
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  data.forEach(point => {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return [
    { x: data[0].x, y: slope * data[0].x + intercept },
    { x: data[data.length - 1].x, y: slope * data[data.length - 1].x + intercept }
  ];
}

// Helper function for toast notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type} fixed bottom-4 right-4 z-50`;
  toast.innerHTML = `
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Base64 encoding/decoding helper functions
function encodeBase64(str) {
  return btoa(encodeURIComponent(str));
}

function decodeBase64(str) {
  return decodeURIComponent(atob(str));
}

// Add this function to handle the secret code
function handleSecretCode(input) {
  // Clear the previous timer
  if (secretTimer) {
    clearTimeout(secretTimer);
  }

  // Add the new digit to the code
  secretCode += input;

  // Set a timer to clear the code after 2 seconds of inactivity
  secretTimer = setTimeout(() => {
    secretCode = '';
  }, 2000);

  // Check if the code matches
  if (secretCode === '0987654321') {
    if (scores.length > 0) {
      scores.pop(); // Remove the last score
      saveScores(); // Save the updated scores
      updateLiveScores();
      updateScoreHistory();
      updateStatistics();
      if (document.getElementById('showAllGraphs')?.checked) {
        updateGraphs();
      }
      showToast('Last score deleted', 'info');
    }
    secretCode = ''; // Reset the code
  }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Fix analytics toggle
  const showAllGraphs = document.getElementById('showAllGraphs');
  const chartGrid = document.getElementById('chartGrid');
  
  if (showAllGraphs && chartGrid) {
    chartGrid.style.display = 'none';
    
    showAllGraphs.addEventListener('change', function() {
      chartGrid.style.display = this.checked ? 'grid' : 'none';
      if (this.checked) {
        destroyCharts();
        updateGraphs();
      }
    });
  }

  // Load saved scores
  loadScores();

  // Update chart data handling

  // Theme controller
  const themeController = document.querySelector('.theme-controller');
  if (themeController) {
    chrome.storage.sync.get(['theme'], function(result) {
      const savedTheme = result.theme || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.body.setAttribute('data-theme', savedTheme);
      themeController.checked = savedTheme === 'dark';
    });
    
    themeController.addEventListener('change', function() {
      const theme = this.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      chrome.storage.sync.set({ theme: theme });
    });
  }

  // Timer controls
  const timerToggle = document.getElementById('timer-toggle');
  const timerSection = document.getElementById('timer-section');
  if (timerToggle) {
    timerToggle.addEventListener('change', function() {
      timerSection.classList.toggle('hidden', !this.checked);
      if (this.checked === false) {
        resetTimer();
      }
    });
  }

  // Calculator controls
  const buttons = {
    'increase-goals': () => adjustValue('goals', 1),
    'decrease-goals': () => adjustValue('goals', -1),
    'increase-switches': () => adjustValue('switches', 1),
    'decrease-switches': () => adjustValue('switches', -1),
    'increase-passes': () => adjustValue('passes', 1),
    'decrease-passes': () => adjustValue('passes', -1)
  };

  Object.entries(buttons).forEach(([className, handler]) => {
    const button = document.querySelector(`.${className}`);
    if (button) {
      button.addEventListener('click', handler);
    }
  });

  // Initialize other controls
  const eventListeners = {
    'clearButton': { event: 'click', handler: resetValues },
    'addScoreButton': { event: 'click', handler: addToTable },
    'exportButton': { event: 'click', handler: exportScores },
    'fileInput': { event: 'change', handler: handleFile },
    'mode-toggle': { event: 'change', handler: toggleMode },
    'deleteLastButton': { event: 'click', handler: deleteLastScore },
    'showAdvancedStats': {
      event: 'change',
      handler: function() {
        document.getElementById('statisticsBox').style.display = 
          this.checked ? 'block' : 'none';
      }
    }
  };

  // Initialize all event listeners
  for (const [id, config] of Object.entries(eventListeners)) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(config.event, config.handler);
    }
  }


  // Initialize mode
  const modeToggle = document.getElementById('mode-toggle');
  if (modeToggle) {
    modeToggle.checked = mode === 'skills';
    document.getElementById('passes-group').style.display = 
      mode === 'teamwork' ? 'block' : 'none';
  }
  // Initialize statistics and calculations
  updateStatistics();
  calculateScores();
  addScrollShadows();
});

