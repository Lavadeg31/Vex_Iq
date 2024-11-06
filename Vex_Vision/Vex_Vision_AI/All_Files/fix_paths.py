import os

# Get absolute path to training_data directory
current_dir = os.path.dirname(os.path.abspath(__file__))
training_dir = os.path.join(current_dir, 'training_data')

# Create data.yaml with absolute paths
yaml_content = f"""
path: {training_dir}  # Dataset root directory
train: {os.path.join(training_dir, 'images')}  # Train images
val: {os.path.join(training_dir, 'images')}    # Validation images

# Classes
names:
  0: ball  # Yellow VEX IQ ball
"""

with open('data.yaml', 'w') as f:
    f.write(yaml_content.strip())

print("Created data.yaml with correct paths")
print(f"Training directory: {training_dir}")