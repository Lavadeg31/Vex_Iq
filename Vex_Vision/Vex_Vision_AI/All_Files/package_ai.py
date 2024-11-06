import os
import shutil
import zipfile

def create_package():
    # Define package name and create directory
    package_name = "rapid_relay_scorer"
    if os.path.exists(package_name):
        shutil.rmtree(package_name)
    os.makedirs(package_name)

    # Files to include
    files_to_copy = [
        "vision_ai.py",
        "requirements.txt",  # You'll need to create this
        "runs/detect/vex_ball_detector2/weights/best.pt"  # Your model file
    ]

    # Copy files
    for file_path in files_to_copy:
        if os.path.exists(file_path):
            if os.path.isfile(file_path):
                # Copy file
                dest = os.path.join(package_name, os.path.basename(file_path))
                shutil.copy2(file_path, dest)
            else:
                # Copy directory structure
                dest = os.path.join(package_name, os.path.basename(os.path.dirname(file_path)))
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                shutil.copy2(file_path, dest)
        else:
            print(f"Warning: {file_path} not found")

    # Create requirements.txt if it doesn't exist
    if not os.path.exists("requirements.txt"):
        with open(os.path.join(package_name, "requirements.txt"), "w") as f:
            f.write("""ultralytics
opencv-python
numpy
torch
""")

    # Create README
    with open(os.path.join(package_name, "README.md"), "w") as f:
        f.write("""# Rapid Relay AI Scorer

1. Install requirements:
   ```
   pip install -r requirements.txt
   ```

2. Run the scorer:
   ```
   python vision_ai.py 0  # For webcam
   python vision_ai.py path/to/video.mp4  # For video file
   ```
""")

    # Create zip file
    shutil.make_archive(package_name, 'zip', package_name)
    print(f"Package created: {package_name}.zip")

if __name__ == "__main__":
    create_package()