import cv2
import os
import time
import sys
from tqdm import tqdm

def collect_training_data(video_path, frame_interval=30):
    """
    Collect training data from video
    frame_interval: save every Nth frame
    """
    # Create directories
    if not os.path.exists('training_data'):
        os.makedirs('training_data/images')
        os.makedirs('training_data/labels')
    
    # Open video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video at {video_path}")
        return
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    saved_count = 0
    frame_num = 0
    selections = []  # Move selections to outer scope
    current_frame = None  # Store current frame
    
    BALL_RADIUS = 40  # Increased ball circle size
    
    print("\nData Collection Started:")
    print("- Click to mark balls")
    print("- Press 'c' to confirm and save frame")
    print("- Press 'r' to reset ball marks")
    print("- Press 's' to skip frame")
    print("- Press 'q' to quit")

    def mouse_callback(event, x, y, flags, param):
        nonlocal selections, current_frame
        if event == cv2.EVENT_LBUTTONDOWN:
            selections.append((x, y))
            # Redraw frame with all selections
            display = current_frame.copy()
            for ball_x, ball_y in selections:
                cv2.circle(display, (ball_x, ball_y), BALL_RADIUS, (0, 255, 0), 2)  # Larger circle
                cv2.circle(display, (ball_x, ball_y), 3, (0, 0, 255), -1)  # Slightly larger center point
            cv2.putText(display, f"Frame: {frame_num}/{total_frames} | Balls marked: {len(selections)}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.imshow('Collect Data', display)

    # Create window and set mouse callback
    cv2.namedWindow('Collect Data')
    cv2.setMouseCallback('Collect Data', mouse_callback)

    # Progress bar
    pbar = tqdm(total=total_frames, desc="Processing frames")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_num += 1
        pbar.update(1)
        
        # Process every Nth frame
        if frame_num % frame_interval != 0:
            continue
        
        current_frame = frame.copy()
        selections = []  # Reset selections for new frame
        
        while True:
            # Show frame
            display = current_frame.copy()
            # Draw existing selections
            for x, y in selections:
                cv2.circle(display, (x, y), BALL_RADIUS, (0, 255, 0), 2)  # Larger circle
                cv2.circle(display, (x, y), 3, (0, 0, 255), -1)  # Slightly larger center point
            
            cv2.putText(display, f"Frame: {frame_num}/{total_frames} | Balls marked: {len(selections)}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.imshow('Collect Data', display)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('c') and selections:  # Confirm and save
                # Save image
                img_path = f'training_data/images/ball_{saved_count:04d}.jpg'
                cv2.imwrite(img_path, current_frame)
                
                # Save annotations in YOLO format
                height, width = current_frame.shape[:2]
                label_path = f'training_data/labels/ball_{saved_count:04d}.txt'
                with open(label_path, 'w') as f:
                    for x, y in selections:
                        # Convert to YOLO format (class x_center y_center width height)
                        x_center = x / width
                        y_center = y / height
                        # Use BALL_RADIUS for consistent size
                        w = (BALL_RADIUS * 2) / width
                        h = (BALL_RADIUS * 2) / height
                        f.write(f'0 {x_center} {y_center} {w} {h}\n')
                
                saved_count += 1
                print(f"\nSaved frame {saved_count} with {len(selections)} balls")
                break
                
            elif key == ord('r'):  # Reset selections
                selections = []
                
            elif key == ord('s'):  # Skip frame
                break
                
            elif key == ord('q'):  # Quit
                cap.release()
                cv2.destroyAllWindows()
                return
    
    pbar.close()
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\nCollection complete!")
    print(f"Saved {saved_count} frames with annotations")
    
    # Create data.yaml for training
    yaml_content = f"""
path: training_data  # Dataset root directory
train: images  # Train images
val: images    # Validation images

# Classes
names:
  0: ball  # Yellow VEX IQ ball
"""
    
    with open('data.yaml', 'w') as f:
        f.write(yaml_content.strip())
    
    print("\nCreated data.yaml for training")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python collect_data.py <path_to_video> [frame_interval]")
        sys.exit(1)
    
    video_path = sys.argv[1]
    frame_interval = int(sys.argv[2]) if len(sys.argv) > 2 else 30
    
    collect_training_data(video_path, frame_interval)