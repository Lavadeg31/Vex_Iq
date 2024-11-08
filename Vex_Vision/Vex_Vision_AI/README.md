# Rapid Relay AI Scorer
## The first part will be about instalation and the 2nd part will be about how it works through YOLO
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

  

# Ball Detection AI Model

## Overview
The project implements YOLOv8 (You Only Look Once version 8), a object detection model, trained for detecting balls in VEX Rapid Relay YOLOv8 is used for its great balance of speed and how it does not make many mistakes, making it very good for this use case.

## Training Through Human Input

### The Learning Process
The AI model learns through supervised learning, where humans provide the "ground truth" for correct ball detection:

#### Human Input Phase ( Lars Input Phase )
- A person watches video footage frame-by-frame
- For each selected frame, a person clicks on each visible ball
- Each click makes an overlay specifying:
  - The ball's exact center position
  - A consistent bounding box (40-pixel radius)
- Multiple ball\rked in each frame
- Humans can verify and correct their annotations before saving

#### How The AI Learns From This
1. **Pattern Recognition**
   - The model looks at the pixel data around each human-marked ball
   - It learns visual patterns like:
     - The ball's circular shape
     - Color patterns and variations
     - Shadows and lighting effects
     - Different angles and partial views

2. **Feature Extraction**
   - The AI develops internal representations of what makes a "ball"
   - It learns to ignore irrelevant background elements
   - Builds understanding of ball appearances in various contexts

3. **Training Iterations**
   - The model makes predictions on training images
   - Compares its predictions to human annotations
   - Adjusts its internal parameters to reduce errors
   - Repeats this process 100 times (epochs) to refine accuracy

## Training Tools and Infrastructure

### Software Stack
- **Ultralytics YOLOv8**: Core detection framework
- **OpenCV**: Image processing and annotation interface
- **PyTorch**: Deep learning backend
- **Python**: Primary programming language

### Hardware Requirements
- Capable CPU for data processing
- GPU recommended for faster training (though not required)
- Sufficient RAM for batch processing
- Webcam or video input device for data collection

### Training Pipeline

#### 1. Data Collection Process
The data collection system (`collect_data.py`) implements a sophisticated annotation workflow:
- Processes video files frame-by-frame with configurable intervals
- Provides an interactive GUI for precise ball marking
- Uses a 40-pixel radius for consistent ball sizing
- Automatically converts pixel coordinates to YOLO's normalized format (0-1 range)
- Generates both images and corresponding label files in real-time
- Maintains consistent numbering across multiple collection sessions

#### 2. Dataset Organization
The dataset follows YOLO's expected structure:
- Images stored as JPG files in `datasets/training_data/images/train/`
- Labels stored as TXT files in `datasets/training_data/labels/train/`
- Each label file contains: `<class_id> <x_center> <y_center> <width> <height>`
- All coordinates are normalized between 0 and 1
- Single class (ball) is represented as class_id 0

#### 3. Training Configuration
Detailed training parameters:
- 100 epochs for thorough model accurack
- Batch size of 16 for memory efficiency
- Image size of 640x640 pixels
- Automatic learning rate scheduling
- Early stopping capability
- Model checkpointing for best weights
- Validation during training

#### 4. Hardware Optimization
Hardware detection and utilization:
- Automatically detects available hardware acceleration
- Prioritizes Metal Performance Shaders (MPS) on Mac devices
- CPU fallback with optimized operations
- Configurable batch sizes based on available memory
- Memory management during inference

## Post-Training Optimization
- Frame skipping for processing speed improvments
- Batched rendering operations
- Optimized video capture settings
- Memory-efficient frame buffer management
- Silent inference mode to reduce overhead
- Real-time FPS monitoring and adjustment
- Score validation system with pending score states

This AI make a accurate autonomous scoring system that make very little mistakes


