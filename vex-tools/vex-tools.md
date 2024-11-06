

# VEX-Tools Suite

A comprehensive toolset for VEX IQ Rapid Relay scoring, analysis, and vision processing.

## Features
- Real-time score calculation for VEX IQ Rapid Relay
- Vision-based ball and goal detection
- Performance analytics and statistics
- Cross-platform support
- Data import/export capabilities

## Quick Links
- [Chrome Extension](https://chromewebstore.google.com/detail/vex-iq-calculator/aandmkklddpghampkpkdpopemddnhhij)
- [GitHub Repository](your-repo-link)

## Installation

### Chrome Extension
1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/vex-iq-calculator/aandmkklddpghampkpkdpopemddnhhij)
2. Click "Add to Chrome"
3. Accept permissions when prompted

### Vision System

#### Prerequisites
- Python 3.8 or higher
- Webcam or video input device

#### Windows
```bash
# Install Python from python.org
# Install pip if not included
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py

# Install requirements
pip install opencv-python numpy
```

#### macOS
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python

# Install requirements
pip3 install opencv-python numpy
```

#### Linux
```bash
# Install Python and dependencies
sudo apt update
sudo apt install python3 python3-pip
sudo apt install python3-opencv

# Install requirements
pip3 install opencv-python numpy
```

## Usage

### Score Calculator (Chrome Extension)
1. Click the VEX Tools icon in Chrome
2. Select mode (Skills/Teamwork)
3. Input scores using the interface
4. View statistics and charts
5. Export/Import data as needed

### Vision System
```bash
# Run with webcam
python vision.py 0

# Run with video file
python vision.py path/to/video.mp4
```

#### Controls
- '1' - Stop and quit
- 'r' - Reset scores
- 's' - Save scores

## Development Setup

### Requirements
- Node.js and npm
- Python 3.8+
- Git

### Setup
```bash
# Clone repository
git clone <repository-url>
cd vex-tools

# Install dependencies
npm install
pip install -r requirements.txt

# Build CSS
npm run build

# Development mode
npm run watch
```

## Project Structure
```
vex-tools/
├── assets/              # Static assets
├── dist/               # Distribution files
├── icons/              # Extension icons
├── scripts/            # External scripts
├── src/                # Source files
│   ├── css/
│   └── js/
├── Vision/             # Vision processing
├── Calculator.html     # Main calculator
├── manifest.json       # Extension manifest
└── package.json        # NPM configuration
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## Troubleshooting

### Common Issues

#### Camera Access
- **Windows**: Check Device Manager
- **macOS**: System Preferences → Security & Privacy → Camera
- **Linux**: Check permissions with `ls -l /dev/video*`

#### Extension Issues
1. Clear browser cache
2. Reinstall extension
3. Check console for errors

#### Vision System
1. Verify camera connection
2. Check Python version
3. Reinstall dependencies

## License
This project is licensed under CC-BY - see the creative commons website for details

## Acknowledgments
- [Lars van de Griend](https://github.com/Lavadeg31) - Original Calculator
- OpenCV community
- VEX IQ community

## Support
- Open an issue on GitHub
- Contact via [your contact method]

## Things I Want to do
- [ ] Additional analytics features
- [ ] Enhanced vision processing
- [ ] Mobile support
- [ ] Real-time collaboration


## FAQ

### Q: How accurate is the vision system?
A: The vision system is optimized for standard competition conditions with proper lighting.

### Q: Can I use this for official competitions?
A: The calculator can be used for practice and unofficial scoring. Always refer to official rules and scoring systems during competitions.

### Q: How do I backup my data?
A: Use the export function in the Chrome extension to save your data as JSON.

## Contact
- GitHub: Lavadeg31
- Email: vandegriendlars@gmail.com

