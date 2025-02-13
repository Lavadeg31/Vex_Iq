# Scoring
## How it works
Scoring is very complicated in Rapid relay. The scores can vary from teamwork to skills mode. That is why the code is so complicated. This code is scoring logic all the apps i have made for this notebook I will walk you through the logic.
### Logic
```
    function calculateScores() {
      let score = 0; # This sets the score to 0
      let scoreInvalid = false;  # This assigns the invalid Boolian expresson to false (or 0)
```
⬆️ That is the start of the code for the scoring logic. ⬆️ That code assigns the score to 0 and the invalid score to false. We are using boolian expressions to determine if the score is valid or not.
```
      let balls = document.getElementById('goals-display').value; # This gets the value of the goals display
      let switches = document.getElementById('switches-display').value; # This gets the value of the switches display
      let passes = document.getElementById('passes-display').value; # This gets the value of the passes display
```
⬆️ That code gets the value of the goals, switches, and passes. we are using the id of the display to get the value of the goals, switches, and passes. that the humain inputted into the app, website, or chrome extension.
```
      let matchType = (mode === 'teamwork') ? 0 : 1; # This assigns the match type to 0 or 1
```
⬆️ That code assigns the match type to 0 or 1. This is because the match type is either teamwork or skills mode.
```
      balls = (balls == "") ? 0 : parseInt(balls);
      switches = (switches == "") ? 0 : parseInt(switches);
      passes = (passes == "") ? 0 : parseInt(passes);
```
⬆️ That code assigns the goals, switches, and passes to 0 if the value is empty.
```
      if(switches == 0 && passes > 4 && matchType == 0) {
        passes = 4;
      }
      else if(passes > balls && matchType == 0 && switches != 0) {
        passes = balls;
      }
```
⬆️ That code assigns the passes to the balls if the passes are greater than the balls and the switches are not 0.
```
      const switchKey = [1,4,8,10,12,12,12,12,12]; # This is the score key for the teamwork mode.
      let scoreKey = (matchType == 0) ? [1,1,switchKey[switches]] : [switchKey[switches],1,0]; # This is the score key for the skills mode.
```
⬆️ That code assigns the score key to the switch key. This array is the score key for the teamwork mode. That is the array that is used to score the goals, switches, and passes.
```
      let matchData = [balls, switches, passes];
      matchData = matchData.map(function(currentElement) {
        return currentElement == "" ? 0 : parseInt(currentElement);
      });

      for(let i=0; i<3; i++) {
        score += matchData[i] * scoreKey[i];
      }
```
⬆️ That code assigns the score to the match data. This is the score for the teamwork mode.
```

      if(matchType == 0) {
        document.getElementById('passes-group').style.display = "block";
      } else {
        document.getElementById('passes-group').style.display = "none";
      }
```
⬆️ That code assigns the passes group to the block or none. This is because the passes group is only used in the teamwork mode.
```
      scoreInvalid = (Math.min.apply(Math, matchData) < 0 || matchData[1] > 4);
      let resultElement = document.getElementById('result');
      if(scoreInvalid) {
        resultElement.style.color = "red";
        resultElement.innerHTML = "Illegal Score: " + score.toString();
      } else {
        resultElement.style.color = "white";
        resultElement.innerHTML = "Total Points: " + score.toString();
      }
```
⬆️ That code assigns the score to the result element. This is the score for the teamwork mode.
```
      return score;
    }
``` 
