<h1>🤖 VEX IQ Engineering Progress</h1>

<h2>🗓️ Timeline of Robot Development</h2>

<ul>
  <li>🛠️ <strong>October 1, 2024:</strong> Started to build a drivetrain based on <a href="https://www.youtube.com/watch?v=s7D9m8zyjXw">this</a> design.</li>
  <li>🎯 <strong>October 7, 2024:</strong> Started building the catapult based on <a href="https://www.youtube.com/watch?v=s7D9m8zyjXw">this</a> design.</li>
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
      <li>🔩 Added more spacers to stop the catapult from snapping.</li>
    </ul>
  </li>
  <li>💪 <strong>October 17, 2024:</strong> Added stronger catapult arms to prevent snapping.</li>
  <li>🤖 <strong>October 17, 2024:</strong> Working on autonomous functionality.</li>
</ul>

<h2>🛠️ Code Changes</h2>
<img src="https://drive.google.com/uc?export=view&id=1lLHsCRge37VqNAeLUzrfINSX6MapjgZA" alt="Alt Text" width="640" height="480">

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

<p>
    Full Changelog: 
    <a href="https://github.com/Lavadeg31/Vex_Iq/commits/Code">Code V1.0.1 Changelog</a>
</p>

<h2>📄 Patch Notes</h2>
<ul>
  <li><strong>Patch V1.0.1 (October 16, 2024):</strong> Integrated distance sensor to halt movement when the catapult is in the lowered position.
      
  <img src="https://drive.google.com/uc?export=view&id=1DFVyXuCuYE1jloaBbeH7jvf7zQaiYeNb" alt="Alt Text" width="500" height="480">
  </li>
</ul>
