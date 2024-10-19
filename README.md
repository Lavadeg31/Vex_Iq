<h1>🤖 VEX IQ Engineering Progress</h1>

<h2>🗓️ Timeline of Robot Development</h2>

<ul>
  <li>🛠️ <strong>October 1, 2024:</strong> Started to build a drivetrain based on <a href="https://www.youtube.com/watch?v=s7D9m8zyjXw">this design</a>.</li>
  <li>🎯 <strong>October 7, 2024:</strong> Started building the catapult based on <a href="https://www.youtube.com/watch?v=s7D9m8zyjXw">this design</a>.</li>
  <li>🔧 <strong>October 8, 2024:</strong> Finished the drivetrain and now moving on to the tensioning system.</li>
  <li>⚙️ <strong>October 11, 2024:</strong> Finished tensioning system, now moving onto the catapult.</li>
  <li>📦 <strong>October 13, 2024:</strong> Finished catapult, now making intake rollers.</li>
  <li>🚀 <strong>October 14, 2024:</strong> Finished robot, now working on quality of life improvements.</li>
  <li>🧭 <strong>October 15, 2024:</strong> Added distance sensor to detect when the catapult is lowered and to stop movement.</li>
  <li>💻 <strong>October 16, 2024:</strong> Added code to use this distance sensor (Patch V1.0.1).</li>
  <li>🔧 <strong>October 16, 2024:</strong> Robot Patch - Added the following improvements:
    <ul>
      <li>🧰 Added distance sensor to detect when the catapult is lowered.</li>
      <li>🎯 Added forks to auto-align with the goal.</li>
      <li><img src="https://drive.google.com/uc?export=view&id=1ZNG2jHQ961ZELO_ajBjYdYBAcSXll_pN" width="320" height="240" alt="Forks auto-aligning with the goal"></li>
      <li>🔩 Added more spacers to stop the catapult from snapping.</li>
      <li><img src="https://drive.google.com/uc?export=view&id=1ZKGmLjjbHSQrlEYexskxUADkgNdorwI1" width="320" height="240" alt="Added more spacers"></li>
    </ul>
  </li>
  <li>💡 <strong>October 17, 2024:</strong> Added LED's and partial autonomous support.</li>
  <li><img src="https://drive.google.com/uc?export=view&id=1ZIPiKen6hNFqtu9KZxp5RYmaBFwr8djo" width="320" height="240" alt="Added LEDs and partial autonomous support"></li>
  <li><img src="https://drive.google.com/uc?export=view&id=1Z3xB95rD8FSyWe5R6VnV6L_ka7s4RHF7" width="320" height="240" alt="Added LEDs"></li>
</ul>

<h2>🛠️ Code Changes</h2>

<h3 style="text-align: center;">Version 1.0.2</h3>
<ul>
  <li>🎮 Added partial autonomous support</li>
  <li>⏳ Changed the amount of time the tensioner rotates to improve accuracy</li>
  <li>💡 Added LED support on ports 12 and 9</li>
</ul>

<h3 style="text-align: center;">Version 1.0.1</h3>
<ul>
  <li>⏳ Added timer</li>
  <li>⚙️ Added automatic lowering and detection when the catapult is lowered</li>
  <li>🎮 Added 1 button to both wind-up catapult and to release</li>
  <li>🔄 Preset wind back strength changed up by around 0.3 rotations to make it go in</li>
  <li>🕒 L3 now starts a 1-minute timer with a sound at 35, 25, and 0 seconds remaining</li>
  <li>🔒 Also stops all movement after the timer is finished</li>
  <li>🔄 R3 does not reset movement from being stopped after the timer finishes</li>
  <li>🛠️ Added clearer motor names (launcher, tensioning, launcher_detector, intake)</li>
  <li>📝 Added comments to make the code clear</li>
</ul>

<img src="https://drive.google.com/uc?export=view&id=10YiGo5kJg9R6v5dYBrejcqZxZJ4yqYhf" width="320" height="240" alt="Image of recent robot changes">

<p>Full Changelog: <a href="https://github.com/Lavadeg31/Vex_Iq/commits/Code">Code V1.0.1 Changelog</a></p>

<h2>📄 Patch Notes</h2>
<ul>
  <li><strong>Patch V1.0.1 (October 16, 2024):</strong> Integrated distance sensor to halt movement when the catapult is in the lowered position.</li>
  <li><img src="https://drive.google.com/uc?export=view&id=1DFVyXuCuYE1jloaBbeH7jvf7zQaiYeNb" width="320" height="240" alt="Catapult sensor integration"></li>
</ul>

<h2>⏲️ Timer Notes</h2>
<ul>
  <li>⏳ We implemented a timer that starts with a 3-second countdown and then runs for 1 minute.</li>
  <li>🎵 During the countdown, an audio file (`Timer.mp3`) plays a beep at each second: 3, 2, 1.</li>
  <li>⌛ The timer can be controlled using a start button.</li>
  <li>🔄 You can toggle the visibility of the timer using the "Timer On/Off" toggle.</li>
  <li>🖱️ <a href="https://lavadeg31.github.io/Vex_Iq/Calc.html">Try the Timer Here!</a></li>
</ul>
