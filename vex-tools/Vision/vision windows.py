import cv2
import numpy as np
import time
import sys
from threading import Thread
from queue import Queue

class RapidRelayScorer:
    def __init__(self):
        self.score = {'goals': 0, 'switches': 0, 'total': 0}
        self.switches_cleared = set()
        self.total_switches_cleared = 0
        self.last_score_time = {}
        self.goal_states = [{
            'is_empty': True,
            'last_empty': 0,
            'entered_time': 0
        } for _ in range(4)]
        
        # Performance optimizations
        self.frame_queue = Queue(maxsize=2)
        self.result_queue = Queue()
        self.processing = True
        
        # Windows-specific optimizations
        cv2.setNumThreads(4)  # Optimize for quad-core processors
        self.lower_yellow = np.array([20, 100, 100], dtype=np.uint8)
        self.upper_yellow = np.array([40, 255, 255], dtype=np.uint8)

    def process_frame(self, frame):
        """Process single frame in separate thread"""
        if frame is None:
            return None
            
        # Pre-allocate arrays for better memory usage
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        yellow_mask = cv2.inRange(hsv, self.lower_yellow, self.upper_yellow)
        
        current_time = time.time()
        frame_processed = frame.copy()
        
        # Process all goals in one pass
        for i in range(4):
            points = np.array(self.goals[i])
            center = np.mean(points, axis=0).astype(np.int32)
            width = np.max(points[:, 0]) - np.min(points[:, 0])
            height = np.max(points[:, 1]) - np.min(points[:, 1])
            
            # Optimized detection area calculation
            center_points = np.array([
                [center[0] - width//4, center[1] - height//4],
                [center[0] + width//4, center[1] - height//4],
                [center[0] + width//4, center[1] + height//4],
                [center[0] - width//4, center[1] + height//4]
            ], dtype=np.int32)
            
            # Use pre-allocated mask
            center_mask = np.zeros(frame.shape[:2], dtype=np.uint8)
            cv2.fillPoly(center_mask, [center_points], 255)
            
            # Optimized yellow detection
            yellow_pixels = cv2.countNonZero(cv2.bitwise_and(yellow_mask, center_mask))
            
            # State updates
            was_empty = self.goal_states[i]['is_empty']
            is_empty = yellow_pixels <= 50
            
            if is_empty and not was_empty:
                self.goal_states[i]['last_empty'] = current_time
            elif not is_empty and was_empty:
                self.goal_states[i]['entered_time'] = current_time
            
            self.goal_states[i]['is_empty'] = is_empty
            
            # Visualization
            cv2.polylines(frame_processed, [center_points], True, (0, 0, 255), 1)
            
            # Scoring logic
            if not is_empty:
                last_time = self.last_score_time.get(i, 0)
                last_empty = self.goal_states[i]['last_empty']
                entered_time = self.goal_states[i].get('entered_time', 0)
                
                if (current_time - last_time >= 0.75 and
                    last_empty > 0 and
                    entered_time - last_empty >= 0.3 and
                    current_time - entered_time <= 0.2):
                    
                    self.last_score_time[i] = current_time
                    self.score['goals'] += 1
                    
                    if (i not in self.switches_cleared and 
                        self.total_switches_cleared < 4):
                        self.switches_cleared.add(i)
                        self.total_switches_cleared += 1
                        self.score['switches'] = self.total_switches_cleared
                    
                    # Skills mode scoring
                    switch_key = [1, 4, 8, 10, 12, 12, 12, 12, 12]
                    self.score['total'] = (self.score['goals'] * switch_key[self.score['switches']] + 
                                         self.score['switches'])
        
        # Add score overlay
        cv2.putText(frame_processed, f"Goals: {self.score['goals']}", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame_processed, f"Switches: {self.score['switches']}", (10, 70), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame_processed, f"Total: {self.score['total']}", (10, 110), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        return frame_processed

    def process_video(self, source):
        """Process video with optimizations"""
        try:
            cap = cv2.VideoCapture(source if isinstance(source, str) else int(source))
            if not cap.isOpened():
                print(f"Error: Could not open video source")
                return
                
            # Windows optimization: Set DirectShow backend
            cap.set(cv2.CAP_PROP_BACKEND, cv2.CAP_DSHOW)
            
            # Optimize buffer size
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)
            
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
            print("'1' - Stop and quit")
            print("'r' - Reset scores")
            print("'s' - Save scores")
            
            # Start processing thread
            Thread(target=self._process_frames, daemon=True).start()
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    if isinstance(source, str):
                        break
                    continue
                
                if self.frame_queue.full():
                    self.frame_queue.get()
                self.frame_queue.put(frame)
                
                if not self.result_queue.empty():
                    display_frame = self.result_queue.get()
                    cv2.imshow('Ball Scorer', display_frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord('1'):
                    break
                elif key == ord('r'):
                    self.reset_scores()
                elif key == ord('s'):
                    self.save_scores()
            
            self.processing = False
            
        except Exception as e:
            print(f"Error processing video: {e}")
            raise e
        finally:
            cap.release()
            cv2.destroyAllWindows()

    def _process_frames(self):
        """Frame processing thread"""
        while self.processing:
            if not self.frame_queue.empty():
                frame = self.frame_queue.get()
                processed = self.process_frame(frame)
                if processed is not None:
                    if self.result_queue.full():
                        self.result_queue.get()
                    self.result_queue.put(processed)
            time.sleep(0.001)  # Prevent CPU overload

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