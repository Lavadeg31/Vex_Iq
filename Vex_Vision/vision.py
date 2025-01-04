#888     888                            8888888  .d88888b.  
#888     888                              888   d88P" "Y88b 
#888     888                              888   888     888 
#Y88b   d88P  .d88b.  888  888            888   888     888 
# Y88b d88P  d8P  Y8b `Y8bd8P'            888   888     888 
#  Y88o88P   88888888   X88K              888   888 Y8b 888 
#   Y888P    Y8b.     .d8""8b.            888   Y88b.Y8b88P 
#    Y8P      "Y8888  888  888 88888888 8888888  "Y888888"  
#                                                      Y8b  
#                                                           
#                                                           
#888888b.                888                                
#888  "88b               888                                
#888  .88P               888                                
#8888888K.  888  888     888       8888b.  888d888 .d8888b  
#888  "Y88b 888  888     888          "88b 888P"   88K      
#888    888 888  888     888      .d888888 888     "Y8888b. 
#888   d88P Y88b 888     888      888  888 888          X88 
#8888888P"   "Y88888     88888888 "Y888888 888      88888P' 
#                888                                        
#           Y8b d88P                                        
#            "Y88P"                                         

import cv2
import numpy as np
import time  # Add this import
from collections import deque
import sys

class RapidRelayScorer:
    def __init__(self):
        """Initialize the scorer"""
        self.goals = []
        self.score = {
            'goals': 0,
            'switches': 0,
            'total': 0
        }
        self.last_score_time = {}
        self.switches_cleared = set()
        self.total_switches_cleared = 0
        self.lower_yellow = None
        self.upper_yellow = None
        self.goal_states = {i: {'last_empty': 0, 'is_empty': True} for i in range(4)}

    def setup_goal_wall(self, frame):
        """Setup the goal wall region first"""
        print("\nGoal Wall Setup Instructions:")
        print("1. Click 4 corners of the goal wall (clockwise from top-left)")
        print("2. Press 'r' to reset points")
        print("3. Press 'c' when done")
        
        points = []
        
        def mouse_callback(event, x, y, flags, param):
            if event == cv2.EVENT_LBUTTONDOWN and len(points) < 4:
                points.append((x, y))
    
        cv2.namedWindow('Setup Goal Wall')
        cv2.setMouseCallback('Setup Goal Wall', mouse_callback)
        
        while True:
            display_frame = frame.copy()
            
            # Draw points and lines
            for i, point in enumerate(points):
                cv2.circle(display_frame, point, 3, (0, 255, 0), -1)
                if i > 0:
                    cv2.line(display_frame, points[i-1], point, (0, 255, 0), 2)
            if len(points) == 4:
                cv2.line(display_frame, points[-1], points[0], (0, 255, 0), 2)
            
            cv2.imshow('Setup Goal Wall', display_frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('c') and len(points) == 4:
                self.wall_points = np.array(points)
                self.auto_select_goals(frame)  # Pass the frame parameter
                break
            elif key == ord('r'):
                points = []
                print("Points reset")
        
        cv2.destroyWindow('Setup Goal Wall')

    def auto_select_goals(self, frame):
        """Automatically detect goals with manual fallback"""
        try:
            # Convert to HSV for yellow detection
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            
            # Define yellow range for the goal borders
            lower_yellow = np.array([20, 100, 100], dtype=np.uint8)
            upper_yellow = np.array([35, 255, 255], dtype=np.uint8)
            
            # Create yellow mask
            yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
            
            # Find contours
            contours, _ = cv2.findContours(yellow_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter and sort contours
            goal_contours = []
            for contour in contours:
                peri = cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, 0.04 * peri, True)
                
                if len(approx) == 4 and cv2.contourArea(contour) > 1000:
                    x, y, w, h = cv2.boundingRect(contour)
                    aspect_ratio = float(w)/h
                    
                    if 0.7 < aspect_ratio < 1.3:
                        goal_contours.append(approx)
            
            # If we didn't find exactly 4 goals, fall back to manual selection
            if len(goal_contours) != 4:
                print("Automatic detection failed. Falling back to manual selection...")
                self.manual_select_goals(frame)
                return
            
            # Sort and store the goals
            def get_contour_position(contour):
                M = cv2.moments(contour)
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    return (cy, cx)
                return (0, 0)
            
            goal_contours = sorted(goal_contours, key=get_contour_position)
            
            self.goals = []
            for contour in goal_contours:
                corners = contour.reshape(-1, 2)
                corners = sort_points(corners)
                self.goals.append(corners)
            
            print(f"Successfully detected {len(self.goals)} goals automatically")
            
        except Exception as e:
            print(f"Error in automatic detection: {e}")
            print("Falling back to manual selection...")
            self.manual_select_goals(frame)

    def manual_select_goals(self, frame):
        """Manually select the 4 goals"""
        print("\nManual Goal Selection:")
        print("For each goal (starting from top-left, clockwise):")
        print("1. Click 4 corners clockwise from top-left")
        print("2. Press 'r' to reset current goal")
        print("3. Press 'c' when done with current goal")
        
        self.goals = []
        
        for goal_num in range(4):
            points = []
            
            def mouse_callback(event, x, y, flags, param):
                if event == cv2.EVENT_LBUTTONDOWN and len(points) < 4:
                    points.append((x, y))
            
            cv2.namedWindow('Select Goals')
            cv2.setMouseCallback('Select Goals', mouse_callback)
            
            print(f"\nSelecting Goal {goal_num + 1}")
            while True:
                display_frame = frame.copy()
                
                # Draw existing goals
                for i, goal in enumerate(self.goals):
                    cv2.polylines(display_frame, [np.array(goal)], True, (0, 255, 0), 2)
                    center = np.mean(goal, axis=0).astype(int)
                    cv2.putText(display_frame, f"G{i+1}", (center[0]-10, center[1]-10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                # Draw current points
                for i, point in enumerate(points):
                    cv2.circle(display_frame, point, 3, (0, 255, 0), -1)
                    if i > 0:
                        cv2.line(display_frame, points[i-1], point, (0, 255, 0), 2)
                if len(points) == 4:
                    cv2.line(display_frame, points[-1], points[0], (0, 255, 0), 2)
                
                cv2.imshow('Select Goals', display_frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord('c') and len(points) == 4:
                    self.goals.append(np.array(points))
                    break
                elif key == ord('r'):
                    points = []
                    print("Points reset for current goal")
            
        cv2.destroyWindow('Select Goals')
        print("Manual goal selection complete")

    def check_scoring(self, frame):
        """Check for yellow in each goal using exact JavaScript scoring logic"""
        try:
            current_time = time.time()
            
            # Convert to HSV for yellow detection
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            yellow_mask = cv2.inRange(hsv, self.lower_yellow, self.upper_yellow)
            
            # First pass: detect balls with sensitive detection
            for i in range(4):
                points = np.array(self.goals[i])
                center = np.mean(points, axis=0).astype(int)
                width = np.max(points[:, 0]) - np.min(points[:, 0])
                height = np.max(points[:, 1]) - np.min(points[:, 1])
                
                # Large detection area (1/4 of goal size)
                center_points = np.array([
                    [center[0] - width//4, center[1] - height//4],
                    [center[0] + width//4, center[1] - height//4],
                    [center[0] + width//4, center[1] + height//4],
                    [center[0] - width//4, center[1] + height//4]
                ], dtype=np.int32)
                
                cv2.polylines(frame, [center_points], True, (0, 0, 255), 1)
                
                center_mask = np.zeros(frame.shape[:2], dtype=np.uint8)
                cv2.fillPoly(center_mask, [center_points], 255)
                
                center_yellow = cv2.bitwise_and(yellow_mask, center_mask)
                yellow_pixels = np.sum(center_yellow > 0)
                
                was_empty = self.goal_states[i]['is_empty']
                is_empty = yellow_pixels <= 50
                
                if is_empty and not was_empty:
                    self.goal_states[i]['last_empty'] = current_time
                elif not is_empty and was_empty:
                    self.goal_states[i]['entered_time'] = current_time
                
                self.goal_states[i]['is_empty'] = is_empty
            
            # Second pass: score calculation
            for i in range(4):
                if not self.goal_states[i]['is_empty']:
                    last_time = self.last_score_time.get(i, 0)
                    last_empty = self.goal_states[i]['last_empty']
                    entered_time = self.goal_states[i].get('entered_time', 0)
                    
                    if (current_time - last_time >= 0.75 and
                        last_empty > 0 and
                        entered_time - last_empty >= 0.3 and
                        current_time - entered_time <= 0.2):
                        
                        # Count the ball
                        self.last_score_time[i] = current_time
                        self.score['goals'] += 1
                        
                        # Update switches if new goal
                        if (i not in self.switches_cleared and 
                            self.total_switches_cleared < 4):
                            self.switches_cleared.add(i)
                            self.total_switches_cleared += 1
                            self.score['switches'] = self.total_switches_cleared
                        
                        # EXACT JavaScript scoring logic:
                        switch_key = [1, 4, 8, 10, 12, 12, 12, 12, 12]
                        score_key = [switch_key[self.score['switches']], 1, 0]  # Skills mode
                        match_data = [self.score['goals'], self.score['switches'], 0]  # [balls, switches, passes]
                        
                        # Calculate total exactly like JavaScript
                        self.score['total'] = (match_data[0] * score_key[0] +  # balls * switchKey[switches]
                                             match_data[1] * score_key[1] +    # switches * 1
                                             match_data[2] * score_key[2])     # passes * 0
                        
                        # Debug print
                        print(f"Ball scored! Goals: {self.score['goals']}, Switches: {self.score['switches']}, Total: {self.score['total']}")
                
        except Exception as e:
            print(f"Error checking scoring: {e}")
            raise e

    def process_video(self, source):
        """Process video from file or webcam"""
        try:
            # Handle webcam (0) or video file
            if source == '0' or source == 0:
                cap = cv2.VideoCapture(0)
                print("Opening webcam...")
            else:
                cap = cv2.VideoCapture(source)
                print(f"Opening video file: {source}")
                
            if not cap.isOpened():
                print(f"Error: Could not open video source")
                return
                
            ret, frame = cap.read()
            if not ret:
                print("Error: Couldn't read first frame")
                return
            
            print("\nLet's sample the yellow ball color first...")
            self.sample_yellow_color(frame)
            
            print("\nAttempting automatic goal detection...")
            self.auto_select_goals(frame)
            
            if len(self.goals) != 4:
                print("Warning: Incorrect number of goals detected")
                return
            
            print("\nProcessing video...")
            print("Controls:")
            print("'1' - Stop processing and quit")
            print("'r' - Reset scores")
            print("'s' - Save current scores to file")
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    if source != 0:  # If video file ended
                        break
                    continue  # If webcam frame was dropped, continue
                
                self.check_scoring(frame)
                display_frame = self.draw_visualization(frame)
                cv2.imshow('Ball Scorer', display_frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord('1'):
                    break
                elif key == ord('r'):
                    self.reset_scores()
                elif key == ord('s'):
                    self.save_scores()
                
        except Exception as e:
            print(f"Error processing video: {e}")
            raise e
        finally:
            cap.release()
            cv2.destroyAllWindows()

    def reset_scores(self):
        """Reset all scores and switches"""
        self.score = {
            'goals': 0,
            'switches': 0,
            'total': 0
        }
        self.switches_cleared = set()
        self.total_switches_cleared = 0
        self.last_score_time = {}
        print("\nScores reset!")

    def save_scores(self):
        """Save current scores to a file"""
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        filename = f"scores_{timestamp}.txt"
        
        try:
            with open(filename, 'w') as f:
                f.write(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Balls Scored: {self.score['goals']}\n")
                f.write(f"Switches Cleared: {self.score['switches']}\n")
                f.write(f"Total Score: {self.score['total']}\n")
            print(f"\nScores saved to {filename}")
        except Exception as e:
            print(f"Error saving scores: {e}")

    def draw_visualization(self, frame):
        """Draw visualization with goals and scores"""
        display_frame = frame.copy()
        
        # Draw goals
        for i, goal in enumerate(self.goals):
            cv2.polylines(display_frame, [np.array(goal)], True, (0, 255, 0), 2)
            center = np.mean(goal, axis=0).astype(int)
            cv2.putText(display_frame, f"G{i+1}", (center[0]-10, center[1]-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Draw scores
        cv2.putText(display_frame, f"Balls Scored: {self.score['goals']}", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(display_frame, f"Total Score: {self.score['total']}", 
                   (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        return display_frame

    def sample_yellow_color(self, frame):
        """Sample yellow ball color from user click"""
        print("\nYellow Ball Color Sampling:")
        print("1. Click on a yellow ball")
        print("2. Press 'r' to resample")
        print("3. Press 'c' when satisfied with the color")
        
        sample_point = None
        
        def mouse_callback(event, x, y, flags, param):
            nonlocal sample_point
            if event == cv2.EVENT_LBUTTONDOWN:
                sample_point = (x, y)
        
        cv2.namedWindow('Sample Yellow Color')
        cv2.setMouseCallback('Sample Yellow Color', mouse_callback)
        
        while True:
            display_frame = frame.copy()
            
            if sample_point:
                # Sample color and create range
                hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
                color = hsv[sample_point[1], sample_point[0]]
                
                # Create color range with small tolerance
                self.lower_yellow = np.array([max(0, color[0] - 10), 100, 100], dtype=np.uint8)
                self.upper_yellow = np.array([min(180, color[0] + 10), 255, 255], dtype=np.uint8)
                
                # Show sampled area
                cv2.circle(display_frame, sample_point, 5, (0, 255, 0), -1)
                
                # Show color detection
                yellow_mask = cv2.inRange(hsv, self.lower_yellow, self.upper_yellow)
                display_frame = cv2.bitwise_and(display_frame, display_frame, mask=yellow_mask)
            
            cv2.imshow('Sample Yellow Color', display_frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('r'):
                sample_point = None
            elif key == ord('c') and sample_point is not None:
                break
        
        cv2.destroyWindow('Sample Yellow Color')

def sort_points(points):
    """Sort points in clockwise order starting from top-left"""
    # Convert to numpy array if not already
    points = np.array(points)
    
    # Calculate center
    center = np.mean(points, axis=0)
    
    # Sort points based on angle from center
    angles = np.arctan2(points[:, 1] - center[1], points[:, 0] - center[0])
    sorted_indices = np.argsort(angles)
    
    # Rotate to ensure top-left is first
    min_y_idx = np.argmin(points[sorted_indices][:, 1])
    sorted_indices = np.roll(sorted_indices, -min_y_idx)
    
    return points[sorted_indices]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vision.py <path_to_video>")
        sys.exit(1)
        
    video_path = sys.argv[1]
    scorer = RapidRelayScorer()
    scorer.process_video(video_path)
