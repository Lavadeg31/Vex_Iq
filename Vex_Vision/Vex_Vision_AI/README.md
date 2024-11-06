# Rapid Relay AI Scorer

1. Install requirements:
   ```
   pip install -r requirements.txt
   ```

2. Run the scorer:
   ```
   python vision_ai.py 0  # For webcam
   python vision_ai.py path/to/video.mp4  # For video file
   ```
# In depth 


## Rapid Relay AI Scorer

An AI-powered scoring system for VEX Robotics Rapid Relay competition.
## Inportants ONLY works with APPLE SILICON M2+ recomended
### Installation

1. Install Python 3.9 or higher if you haven't already:
   - Download from [python.org](https://www.python.org/downloads/)
   - Make sure to check "Add Python to PATH" during installation

2. Install required packages:
   ```bash
   pip3 install -r requirements.txt
   ```

## Usage

1. Connect your webcam

2. Run the scorer:
   ```bash
   python3 vision_ai.py 0
   ```
   - Use `0` for default webcam
   - Use `1`, `2`, etc. for additional webcams
   - Or use a video file path: `python3 vision_ai.py path/to/video.mp4`

3. Controls:
   - Press `r` to reset score
   - Press `q` to quit

## Requirements

Create a `requirements.txt` file with:
```txt
ultralytics>=8.0.0
opencv-python>=4.8.0
numpy>=1.24.0
torch>=2.0.0
```

## Troubleshooting

1. If webcam doesn't open:
   - Make sure your webcam is connected
   - Try a different webcam index (0, 1, 2)
   - Check webcam permissions in system settings

2. If model fails to load:
   - Ensure `best.pt` is in the same directory as `vision_ai.py`

3. For Apple Silicon (M1/M2) users:
   - The program is optimized for Apple Silicon
   - MPS (Metal Performance Shaders) will be used automatically

## Files Needed
- `vision_ai.py` - Main program
- `best.pt` - AI model weights
- `requirements.txt` - Package requirements

## Support
For issues or questions, please open an issue on the GitHub repository.
```
