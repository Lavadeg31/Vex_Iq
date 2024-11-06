

# Rapid Relay Scorer - Complete Installation Guide

## Installing Python

### Windows
1. Download Python from [python.org](https://www.python.org/downloads/)
   - Click "Download Python 3.x.x"
   - **IMPORTANT**: Check "Add Python to PATH" during installation
2. Verify installation:
```bash
python --version
```

### macOS
1. Using Homebrew (recommended):
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python
```

2. Or download from [python.org](https://www.python.org/downloads/macos/)

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3 python3-pip
```

## Installing pip (if not included with Python)

### Windows
```bash
# Download get-pip.py
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

# Install pip
python get-pip.py
```

### macOS/Linux
```bash
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
```

## Installing Required Packages

### Windows
```bash
# Update pip
python -m pip install --upgrade pip

# Install requirements
pip install opencv-python numpy
```

### macOS
```bash
# Install Xcode command line tools
xcode-select --install

# Update pip
python3 -m pip install --upgrade pip

# Install requirements
pip3 install opencv-python numpy
```

### Linux
```bash
# Install OpenCV dependencies
sudo apt update
sudo apt install -y python3-opencv
sudo apt install -y libopencv-dev

# Install Python packages
pip3 install opencv-python numpy
```


## Verifying Installation

```bash
# Check Python
python --version  # or python3 --version

# Check pip
pip --version    # or pip3 --version

# Test OpenCV
python -c "import cv2; print(cv2.__version__)"
```

## Running the Program

1. Navigate to program directory:
```bash
cd path/to/rapid-relay-scorer
```

2. Run with webcam:
```bash
# Windows
python vision.py 0

# macOS/Linux
python3 vision.py 0
```

3. Run with video file:
```bash
# Windows
python vision.py path/to/video.mp4

# macOS/Linux
python3 vision.py path/to/video.mp4
```

If you encounter any other issues, please check:
1. All dependencies are installed
2. Camera permissions are granted
3. Python and pip are in PATH
4. You're in the correct directory

## Troubleshooting Common Issues

### Python Not Found
```bash
'python' is not recognized as an internal or external command
```
**Fix:**
1. Windows: Reinstall Python, checking "Add Python to PATH"
2. Or add manually to PATH:
   - Windows: Search "Environment Variables" → Edit PATH → Add Python paths
   - macOS/Linux: Add to ~/.bashrc or ~/.zshrc:
     ```bash
     export PATH="/usr/local/bin/python3:$PATH"
     ```

### pip Not Found
```bash
'pip' is not recognized...
```
**Fix:**
```bash
# Windows
py -m ensurepip --upgrade

# macOS/Linux
python3 -m ensurepip --upgrade
# If that works but pip does not try pip3 instead of pip
```

### OpenCV Installation Fails

#### Windows
```bash
# Install Visual C++ Redistributable
# Download from Microsoft website or:
winget install Microsoft.VCRedist.2015+.x64
```

#### Linux
```bash
# Install build tools
sudo apt install build-essential cmake pkg-config

# Install OpenCV dependencies
sudo apt install -y libopencv-dev python3-opencv
```

#### macOS
```bash
# Install OpenCV via Homebrew
brew install opencv
```

### Camera Access Issues

#### Windows
1. Settings → Privacy & Security → Camera
2. Enable camera access

#### macOS
1. System Preferences → Security & Privacy → Camera
2. Allow access for Terminal/Python

#### Linux
```bash
# Check camera
ls /dev/video*

# Install v4l-utils
sudo apt install v4l-utils

# List cameras
v4l2-ctl --list-devices
```

### Permission Errors

#### Linux
```bash
# Add user to video group
sudo usermod -a -G video $USER

# Fix USB camera permissions
sudo chmod 666 /dev/video0
```

#### macOS
```bash
# Fix permissions
sudo chmod -R 755 /usr/local/lib/python3.*/site-packages
```


