import cv2
import numpy as np
from ultralytics import YOLO
import time
import torch
import os
import contextlib
from io import StringIO

class AIRapidRelayScorer:
    def __init__(self):
        """Initialize the AI scorer"""
        self.goals = []
        self.score = {'goals': 0, 'switches': 0, 'total': 0}
        self.last_score_time = {}
        self.switches_cleared = set()
        
        # Suppress YOLO output during model loading
        with contextlib.redirect_stdout(StringIO()):
            self.model = YOLO('best.pt')
        self.model.verbose = False
        
        self.lower_yellow = None
        self.upper_yellow = None
        self.recent_scores = []
        self.pending_scores = []
        
        # Optimization 1: Use MPS (Metal) acceleration on Mac
        device = 'mps' if torch.backends.mps.is_available() else 'cpu'
        print(f"Using device: {device}")
        
        # Load model
        model_path = 'best.pt'
        self.model = YOLO(model_path)
        self.model.to(device)
        
        # Optimization 2: Set inference parameters
        self.conf_threshold = 0.5
        self.iou_threshold = 0.3
        self.max_det = 10  # Max number of detections per frame
        
        print("Model loaded and optimized!")

    def setup_goals(self, frame):
        """Automatically detect goals with manual fallback"""
        print("\nSampling yellow color first...")
        self.sample_yellow_color(frame)
        
        try:
            # Convert to HSV for yellow detection
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            
            # Create yellow mask
            yellow_mask = cv2.inRange(hsv, self.lower_yellow, self.upper_yellow)
            
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
            
            # Sort goals from top to bottom
            def get_contour_position(contour):
                M = cv2.moments(contour)
                if M["m00"] != 0:
                    cy = int(M["m01"] / M["m00"])
                    return cy
                return 0
            
            goal_contours = sorted(goal_contours, key=get_contour_position)
            
            self.goals = []
            for contour in goal_contours:
                corners = contour.reshape(-1, 2)
                corners = self.sort_points(corners)
                self.goals.append(corners)
            
            print(f"Successfully detected {len(self.goals)} goals automatically")
            
            # Show detected goals for verification
            display = frame.copy()
            for i, goal in enumerate(self.goals):
                cv2.polylines(display, [goal], True, (0, 255, 0), 2)
                center = np.mean(goal, axis=0).astype(int)
                cv2.putText(display, f"G{i+1}", (center[0]-10, center[1]-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            cv2.imshow('Verify Goals', display)
            print("Press 'c' to confirm goals or 'r' to manually select")
            while True:
                key = cv2.waitKey(0) & 0xFF
                if key == ord('c'):
                    break
                elif key == ord('r'):
                    self.manual_select_goals(frame)
                    break
            
            cv2.destroyWindow('Verify Goals')
            
        except Exception as e:
            print(f"Error in automatic detection: {e}")
            print("Falling back to manual selection...")
            self.manual_select_goals(frame)

    def sample_yellow_color(self, frame):
        """Sample yellow ball color from user click"""
        print("\nYellow Color Sampling:")
        print("1. Click on a yellow goal border")
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
                
                # Create color range
                self.lower_yellow = np.array([max(0, color[0] - 10), 100, 100])
                self.upper_yellow = np.array([min(180, color[0] + 10), 255, 255])
                
                # Show sampled area
                cv2.circle(display_frame, sample_point, 5, (0, 255, 0), -1)
                
                # Show color detection
                yellow_mask = cv2.inRange(hsv, self.lower_yellow, self.upper_yellow)
                display_frame = cv2.bitwise_and(display_frame, display_frame, 
                                              mask=yellow_mask)
            
            cv2.imshow('Sample Yellow Color', display_frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('r'):
                sample_point = None
            elif key == ord('c') and sample_point is not None:
                break
        
        cv2.destroyWindow('Sample Yellow Color')

    @staticmethod
    def sort_points(points):
        """Sort points in clockwise order starting from top-left"""
        points = np.array(points)
        center = np.mean(points, axis=0)
        
        # Get angles from center
        angles = np.arctan2(points[:, 1] - center[1], 
                           points[:, 0] - center[0])
        sorted_indices = np.argsort(angles)
        
        # Rotate to ensure top-left is first
        min_y_idx = np.argmin(points[sorted_indices][:, 1])
        sorted_indices = np.roll(sorted_indices, -min_y_idx)
        
        return points[sorted_indices]

    def detect_balls(self, frame):
        """Detect balls silently"""
        # Suppress all output during detection
        with contextlib.redirect_stdout(StringIO()):
            results = self.model(frame, conf=0.5, verbose=False)
        
        balls = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                center_x = (x1 + x2) // 2
                center_y = (y1 + y2) // 2
                confidence = float(box.conf)
                balls.append({
                    'center': (center_x, center_y),
                    'confidence': confidence,
                    'box': (x1, y1, x2, y2)
                })
        return balls

    def process_video(self, source):
        """Optimized video processing"""
        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            print("Error: Could not open video source")
            return

        # Optimization 5: Set optimal video capture properties
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        # Setup goals
        ret, frame = cap.read()
        if not ret:
            return
        self.setup_goals(frame)

        fps = 0
        frame_time = time.time()
        frame_count = 0
        fps_update_interval = 0.5  # Update FPS every 0.5 seconds

        # Optimization 6: Pre-allocate display frame
        display = None
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Optimization 7: Skip frames if processing is slow
            if frame_count % 2 != 0:  # Process every other frame
                frame_count += 1
                continue

            # Detect balls
            balls = self.detect_balls(frame)
            
            # Check scoring
            self.check_scoring(balls)
            
            # Optimization 8: Only create new display frame when needed
            if display is None:
                display = np.zeros_like(frame)
            display = frame.copy()
            
            # Draw goals
            for i, goal in enumerate(self.goals):
                color = (0, 255, 0) if i in self.switches_cleared else (0, 165, 255)
                cv2.polylines(display, [goal], True, color, 2)
            
            # Optimization 9: Batch text rendering
            texts = []
            for ball in balls:
                x1, y1, x2, y2 = ball['box']
                cv2.rectangle(display, (x1, y1), (x2, y2), (0, 255, 255), 2)
                texts.append((f"{ball['confidence']:.2f}", (x1, y1-10)))
            
            # Render all text at once
            for text, pos in texts:
                cv2.putText(display, text, pos, cv2.FONT_HERSHEY_SIMPLEX, 
                           0.5, (0, 255, 255), 2)
            
            # Update FPS
            frame_count += 1
            current_time = time.time()
            if current_time - frame_time >= fps_update_interval:
                fps = frame_count / (current_time - frame_time)
                frame_count = 0
                frame_time = current_time
            
            cv2.putText(display, f"FPS: {fps:.1f}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(display, f"Score: {self.score['total']}", (10, 70), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            cv2.imshow('AI Ball Scorer', display)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

    def calculate_score(self, balls, switches):
        """Calculate score using the same logic as the JavaScript"""
        # Skills mode scoring
        switch_key = [1, 4, 8, 10, 12, 12, 12, 12, 12]
        
        # Skills mode: [switchKey[switches], 1, 0]
        score = (balls * 1) + (switch_key[min(switches, 8)] * balls)
        
        return score

    def check_scoring(self, balls):
        """Check if balls are scored with top goal priority"""
        current_time = time.time()
        
        # Clean up old pending scores
        self.pending_scores = [score for score in self.pending_scores 
                              if current_time - score['time'] <= 0.5]
        
        # Sort goals from top to bottom
        sorted_goals = sorted(enumerate(self.goals), 
                            key=lambda x: np.mean(x[1][:, 1]))
        
        counted_balls = set()
        
        # Only process if we haven't exceeded 4 switches
        for goal_idx, goal in sorted_goals:
            for ball in balls:
                if id(ball) in counted_balls:
                    continue
                    
                center = ball['center']
                if cv2.pointPolygonTest(goal, center, False) > 0:
                    last_time = self.last_score_time.get(goal_idx, 0)
                    if current_time - last_time >= 0.75:
                        is_top_goal = goal_idx < 2
                        
                        # Check if scoring would exceed 4 switches
                        would_exceed = (
                            goal_idx not in self.switches_cleared and 
                            len(self.switches_cleared) >= 4
                        )
                        
                        if is_top_goal:
                            for pending in self.pending_scores:
                                self.revert_score(pending)
                            self.pending_scores.clear()
                            if not would_exceed:
                                self.update_score(goal_idx)
                            counted_balls.add(id(ball))
                            
                        else:
                            if not would_exceed:
                                score_state = {
                                    'time': current_time,
                                    'goal_idx': goal_idx,
                                    'switches': self.score['switches'],
                                    'goals': self.score['goals'],
                                    'switches_cleared': self.switches_cleared.copy(),
                                    'total': self.score['total']
                                }
                                self.update_score(goal_idx)
                                self.pending_scores.append(score_state)
                            counted_balls.add(id(ball))
                        
                        self.last_score_time[goal_idx] = current_time

        # Confirm pending scores older than 0.5 seconds
        current_pending = self.pending_scores.copy()
        for pending in current_pending:
            if current_time - pending['time'] > 0.5:
                self.pending_scores.remove(pending)

    def update_score(self, goal_idx):
        """Update score using exact JavaScript skills mode logic with 4 switches max"""
        self.score['goals'] += 1
        
        # Only add switch if new goal and we haven't exceeded 4 switches
        if goal_idx not in self.switches_cleared and len(self.switches_cleared) < 4:
            self.switches_cleared.add(goal_idx)
            self.score['switches'] = len(self.switches_cleared)
        
        # SKILLS MODE SCORING (matchType = 1)
        switch_key = [1, 4, 8, 10, 12, 12, 12, 12, 12]
        switches = min(self.score['switches'], 4)  # Cap at 4 switches
        
        # In skills mode: scoreKey = [switchKey[switches], 1, 0]
        self.score['total'] = (
            self.score['goals'] * switch_key[switches] +  # balls * switchKey[switches]
            switches * 1                                  # switches * 1
        )

    def revert_score(self, score_state):
        """Revert a score to previous state"""
        self.score['goals'] = score_state['goals']
        self.score['switches'] = score_state['switches']
        self.score['total'] = score_state['total']
        self.switches_cleared = score_state['switches_cleared']
        
        print(f"Reverted score for goal {score_state['goal_idx'] + 1}")

    def manual_select_goals(self, frame):
        """Manually select 4 goals by clicking corners"""
        print("\nManual Goal Selection:")
        print("1. Click 4 corners for each goal (clockwise from top-left)")
        print("2. Press 'r' to restart current goal")
        print("3. Press 'c' to confirm goals when done")
        
        self.goals = []
        current_goal = []
        
        def mouse_callback(event, x, y, flags, param):
            nonlocal current_goal
            if event == cv2.EVENT_LBUTTONDOWN:
                current_goal.append([x, y])
        
        cv2.namedWindow('Select Goals')
        cv2.setMouseCallback('Select Goals', mouse_callback)
        
        while len(self.goals) < 4:
            display = frame.copy()
            
            # Draw existing goals
            for i, goal in enumerate(self.goals):
                cv2.polylines(display, [np.array(goal)], True, (0, 255, 0), 2)
                center = np.mean(goal, axis=0).astype(int)
                cv2.putText(display, f"G{i+1}", (center[0]-10, center[1]-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Draw current goal points
            for i, point in enumerate(current_goal):
                cv2.circle(display, tuple(point), 3, (0, 0, 255), -1)
                if i > 0:
                    cv2.line(display, tuple(current_goal[i-1]), tuple(point), (0, 0, 255), 1)
            
            cv2.imshow('Select Goals', display)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('r'):
                current_goal = []
            elif key == ord('c') and len(current_goal) == 4:
                self.goals.append(np.array(current_goal))
                current_goal = []
                print(f"Goal {len(self.goals)} set")
        
        cv2.destroyWindow('Select Goals')
        print("All goals set successfully!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python vision_ai.py <path_to_video>")
        sys.exit(1)
    
    scorer = AIRapidRelayScorer()
    scorer.process_video(sys.argv[1])