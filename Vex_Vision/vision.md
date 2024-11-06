

# Rapid Relay Scorer Documentation

## Installation Requirements
- Python 3.8 or higher
- Webcam or video file
- Required packages:
```bash
pip install opencv-python numpy
```

## Quick Start

### 1. Clone or Download
```bash
git clone <github.com/Lavadeg31/Vex_Iq>
# or download and extract the ZIP file
```

### 2. Running the Program

#### For Webcam:
```bash
python vision.py 0
```

#### For Video File:
```bash
python vision.py path/to/video.mp4
```

## Setup Process

1. **Color Calibration**
   - When first launched, you'll be prompted to calibrate yellow ball detection
   - Click on a yellow ball in the frame
   - Press 'r' to resample if needed
   - Press 'c' when satisfied with the color detection

2. **Goal Detection**
   - The program will attempt automatic goal detection
   - Red boxes will show the detection areas
   - Goals must be clearly visible in the frame

## Controls

### During Operation
- `1` - Stop processing and quit
- `r` - Reset scores
- `s` - Save current scores to file

### Scoring System (Skills Mode)
- Each ball scored = Current switch multiplier
- Switch values: [1, 4, 8, 10, 12]
- Maximum 4 switches
- Example scoring:
  - 5 balls with 2 switches = 5 × 8 + 2 × 1 = 42 points
  - 14 balls with 4 switches = 14 × 12 + 4 × 1 = 172 points

## Troubleshooting

### Common Issues:

1. **Camera Not Found**
   ```bash
   Error: Could not open video source
   ```
   - Check webcam connection
   - Try a different camera number (e.g., `python vision.py 1`)

2. **Missing Dependencies**
   ```bash
   ModuleNotFoundError: No module named 'cv2'
   ```
   - Install required packages:
   ```bash
   pip install opencv-python numpy
   ```

3. **Poor Ball Detection**
   - Ensure good lighting
   - Recalibrate yellow color (restart program)
   - Make sure balls are clearly visible

## File Output

When using the 's' key to save scores, a file will be created:
```
scores_YYYYMMDD-HHMMSS.txt
```
Contains:
- Timestamp
- Balls Scored
- Switches Cleared
- Total Score

## System Requirements

### Windows
- Windows 10 or higher
- Python 3.8+
- Webcam drivers installed

### macOS
- macOS 10.14 or higher
- Python 3.8+
- Camera permissions enabled

### Linux
- Recent distribution (Ubuntu 20.04+, etc.)
- Python 3.8+
- OpenCV dependencies:
```bash
sudo apt-get update
sudo apt-get install python3-opencv
```

## Command Line Arguments
```bash
python vision.py [source]
```
- `source`: 
  - `0` for default webcam
  - `1`, `2`, etc. for additional cameras
  - Path to video file (e.g., `videos/match.mp4`)

## Development Notes

### Key Classes
```python
class RapidRelayScorer:
    def __init__(self):
        self.score = {
            'goals': 0,
            'switches': 0,
            'total': 0
        }
```

### Important Methods
- `process_video()` - Main processing loop
- `check_scoring()` - Scoring logic
- `sample_yellow_color()` - Color calibration

