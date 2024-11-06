import os
import shutil
import zipfile

def create_package():
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create directory structure
    package_dir = os.path.join(current_dir, 'vex_scorer')
    os.makedirs(os.path.join(package_dir, 'Vision'), exist_ok=True)
    os.makedirs(os.path.join(package_dir, 'models', 'detect'), exist_ok=True)
    
    # Copy main code
    vision_ai_path = os.path.join(current_dir, 'Vision', 'vision_ai.py')
    if not os.path.exists(vision_ai_path):
        print(f"Error: Could not find {vision_ai_path}")
        return
    
    shutil.copy(
        vision_ai_path,
        os.path.join(package_dir, 'Vision', 'vision_ai.py')
    )
    
    # Copy model files
    model_path = os.path.join(current_dir, 'Vision', 'runs', 'detect', 'vex_ball_detector2')
    if not os.path.exists(model_path):
        print(f"Error: Could not find model at {model_path}")
        return
        
    shutil.copytree(
        model_path,
        os.path.join(package_dir, 'models', 'detect', 'vex_ball_detector2'),
        dirs_exist_ok=True
    )
    
    # Create requirements.txt
    requirements = """ultralytics==8.0.196
opencv-python==4.8.1.78
numpy==1.24.3
torch==2.1.0"""
    
    with open(os.path.join(package_dir, 'requirements.txt'), 'w') as f:
        f.write(requirements)
    
    # Create README
    readme = """# VEX IQ Ball Scorer

## Setup
1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the scorer:
   ```bash
   python Vision/vision_ai.py 0  # For webcam
   python Vision/vision_ai.py path/to/video.mp4  # For video file
   ```
"""
    
    with open(os.path.join(package_dir, 'README.md'), 'w') as f:
        f.write(readme)
    
    # Create zip file
    zip_path = os.path.join(current_dir, 'vex_scorer.zip')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(package_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, package_dir)
                zipf.write(file_path, arcname)
    
    # Clean up temporary directory
    shutil.rmtree(package_dir)
    
    print(f"Package created: {zip_path}")
    print("\nContents:")
    with zipfile.ZipFile(zip_path, 'r') as zipf:
        for file in zipf.namelist():
            print(f"  {file}")

if __name__ == "__main__":
    create_package()