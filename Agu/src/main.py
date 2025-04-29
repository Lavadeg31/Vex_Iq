#region VEXcode Generated Robot Configuration
from vex import *
import urandom #type: ignore
import math  # Add this import for trigonometry functions

# Brain should be defined by default
brain=Brain()

# Robot configuration code
gyro_sensor = Gyro(Ports.PORT2)  # Add gyro sensor at port 2
left_drive_smart = Motor(Ports.PORT12, 2.0, False)
right_drive_smart = Motor(Ports.PORT6, 2.0, True)
# Remove drivetrain object - we'll control motors individually
Intake = Motor(Ports.PORT4, False)
IntakeGroup_motor_a = Motor(Ports.PORT11, False)
IntakeGroup_motor_b = Motor(Ports.PORT10, True)
IntakeGroup = MotorGroup(IntakeGroup_motor_a, IntakeGroup_motor_b)
Launcher = Motor(Ports.PORT5, False)
TopGoalSense = Distance(Ports.PORT3)
BottomSense = Distance(Ports.PORT7)
pneumatic_1 = Pneumatic(Ports.PORT1)
controller = Controller()
autonomous = Touchled(Ports.PORT8)


# Initialize gyro
def init_gyro():
    gyro_sensor.calibrate()
    while gyro_sensor.is_calibrating():
        wait(50, MSEC)
    gyro_sensor.set_heading(0, DEGREES)

# Call gyro initialization
init_gyro()

# generating and setting random seed
def initializeRandomSeed():
    wait(100, MSEC)
    systemTime = brain.timer.system() * 100
    urandom.seed(int(systemTime)) 
    
# Initialize random seed 
initializeRandomSeed()

# define variables used for controlling motors based on controller inputs
drivetrain_l_needs_to_be_stopped_controller = False
drivetrain_r_needs_to_be_stopped_controller = False

# define a task that will handle monitoring inputs from controller
def rc_auto_loop_function_controller():
    global drivetrain_l_needs_to_be_stopped_controller, drivetrain_r_needs_to_be_stopped_controller, remote_control_code_enabled
    # process the controller input every 20 milliseconds
    # update the motors based on the input values
    while True:
        if remote_control_code_enabled:
            
            # calculate the drivetrain motor velocities from the controller joystick axies
            # left = axisA
            # right = axisD
            joystick_left = controller.axisA.position()
            joystick_right = controller.axisD.position()
            
            # Scale the joystick inputs for better control (200% max speed)
            drivetrain_left_side_speed = joystick_left
            drivetrain_right_side_speed = joystick_right
            
            # check if the value is inside of the deadband range
            if drivetrain_left_side_speed < 5 and drivetrain_left_side_speed > -5:
                # check if the left motor has already been stopped
                if drivetrain_l_needs_to_be_stopped_controller:
                    # stop the left drive motor
                    left_drive_smart.stop()
                    # tell the code that the left motor has been stopped
                    drivetrain_l_needs_to_be_stopped_controller = False
            else:
                # reset the toggle so that the deadband code knows to stop the left motor next
                # time the input is in the deadband range
                drivetrain_l_needs_to_be_stopped_controller = True
            # check if the value is inside of the deadband range
            if drivetrain_right_side_speed < 5 and drivetrain_right_side_speed > -5:
                # check if the right motor has already been stopped
                if drivetrain_r_needs_to_be_stopped_controller:
                    # stop the right drive motor
                    right_drive_smart.stop()
                    # tell the code that the right motor has been stopped
                    drivetrain_r_needs_to_be_stopped_controller = False
            else:
                # reset the toggle so that the deadband code knows to stop the right motor next
                # time the input is in the deadband range
                drivetrain_r_needs_to_be_stopped_controller = True
            
            # only tell the left drive motor to spin if the values are not in the deadband range
            if drivetrain_l_needs_to_be_stopped_controller:
                # Scale to 200% max speed for better performance
                left_drive_smart.set_velocity(drivetrain_left_side_speed * 4, PERCENT)
                left_drive_smart.spin(FORWARD)
            # only tell the right drive motor to spin if the values are not in the deadband range
            if drivetrain_r_needs_to_be_stopped_controller:
                # Scale to 200% max speed for better performance
                right_drive_smart.set_velocity(drivetrain_right_side_speed * 4, PERCENT)
                right_drive_smart.spin(FORWARD)
        # wait before repeating the process
        wait(20, MSEC)

# define variable for remote controller enable/disable
remote_control_code_enabled = True

rc_auto_loop_thread_controller = Thread(rc_auto_loop_function_controller)

#endregion VEXcode Generated Robot Configuration

myVariable = 0
launch = 0

# Improved Drive control variables
kp = 3.5  # Higher proportional constant for faster response
kd = 1.5  # Higher derivative for better dampening
target_heading = 0

# Ultra-simple straight drive function - no oscillation
def PstraightFor(distance_mm, heading_degrees, speed_pct, kp_value=1.0, kd_value=2.0):
    global target_heading
    
    # Reset encoders
    left_drive_smart.reset_position()
    right_drive_smart.reset_position()
    
    # Set target heading (use current heading if 0)
    if heading_degrees == 0:
        target_heading = gyro_sensor.heading()
    else:
        target_heading = heading_degrees
    
    brain.screen.clear_screen()
    brain.screen.set_cursor(1, 1)
    brain.screen.print("Driving straight")
    
    # Calculate wheel circumference
    wheel_circumference = 3.14159 * 200
    gear_ratio = 0.5
    
    # Set initial motor velocities
    left_drive_smart.set_velocity(speed_pct, PERCENT)
    right_drive_smart.set_velocity(speed_pct, PERCENT)
    
    # Start motors
    left_drive_smart.spin(FORWARD)
    right_drive_smart.spin(FORWARD)
    
    # Initialize variables
    prev_error = 0
    update_counter = 0
    
    # Drive until distance reached
    while True:
        # Check distance traveled
        left_position = abs(left_drive_smart.position(DEGREES))
        right_position = abs(right_drive_smart.position(DEGREES))
        avg_position = (left_position + right_position) / 2
        traveled_distance = (avg_position * gear_ratio / 360) * wheel_circumference
        
        # Stop if target distance reached
        if traveled_distance >= distance_mm:
            left_drive_smart.stop()
            right_drive_smart.stop()
            break
            
        # Get current heading
        current_heading = gyro_sensor.heading()
        
        # Calculate error (normalize to -180 to 180)
        error = target_heading - current_heading
        if error > 180:
            error -= 360
        elif error < -180:
            error += 360
        
        # Calculate derivative - very simple, no filtering
        derivative = error - prev_error
        prev_error = error
            
        # Apply large deadband - only correct if error is significant
        if abs(error) < 5:
            # Within 5 degrees is good enough - no correction needed
            correction = 0
        else:
            # Very mild correction with conservative gains
            correction = (error * kp_value) + (derivative * kd_value)
            
            # Limit correction to prevent sudden movements
            if correction > 10:
                correction = 10
            elif correction < -10:
                correction = -10
        
        # Update display occasionally
        update_counter += 1
        if update_counter >= 20:
            brain.screen.set_cursor(2, 1)
            brain.screen.print("Error: ", error)
            brain.screen.set_cursor(3, 1)
            brain.screen.print("Corr: ", correction)
            update_counter = 0
        
        # Adjust motor speeds
        left_velocity = speed_pct + correction
        right_velocity = speed_pct - correction
        
        # Apply motor velocities
        left_drive_smart.set_velocity(max(min(left_velocity, 100), -100), PERCENT)
        right_drive_smart.set_velocity(max(min(right_velocity, 100), -100), PERCENT)
        
        wait(10, MSEC)

# Simple gyro turn function - direct control
def GyroTurn(target_angle, turn_velocity, turn_kp, turn_kd=1.0):
    global target_heading
    
    # Get current heading
    current_heading = gyro_sensor.heading()
    
    # Calculate target heading
    target_heading = current_heading + target_angle
    
    # Normalize target heading to 0-360 range
    while target_heading >= 360:
        target_heading -= 360
    while target_heading < 0:
        target_heading += 360
        
    brain.screen.clear_screen()
    brain.screen.set_cursor(1, 1)
    brain.screen.print("Turning to: ", target_heading)
    
    # Determine turn direction
    error = target_heading - current_heading
    if error > 180:
        error -= 360
    elif error < -180:
        error += 360
        
    # Determine turn direction - simple approach
    if error > 0:
        left_dir = FORWARD
        right_dir = REVERSE
    else:
        left_dir = REVERSE
        right_dir = FORWARD
    
    # Use high fixed velocity for most of the turn
    turn_speed = turn_velocity
    
    # Start the motors directly
    left_drive_smart.set_velocity(turn_speed, PERCENT)
    right_drive_smart.set_velocity(turn_speed, PERCENT)
    left_drive_smart.spin(left_dir)
    right_drive_smart.spin(right_dir)
    
    # For tracking
    update_counter = 0
    
    # Continue turning until close to target
    while abs(error) > 15:  # Use a wider approach threshold
        # Get current heading
        current_heading = gyro_sensor.heading()
        
        # Calculate error
        error = target_heading - current_heading
        if error > 180:
            error -= 360
        elif error < -180:
            error += 360
            
        # Update display occasionally
        update_counter += 1
        if update_counter >= 20:
            brain.screen.set_cursor(2, 1)
            brain.screen.print("Error: ", error)
            update_counter = 0
        
        wait(10, MSEC)
    
    # Slow down for final approach
    left_drive_smart.set_velocity(15, PERCENT)  # Low, fixed speed for final approach
    right_drive_smart.set_velocity(15, PERCENT)
    
    # Continue at slow speed until target reached
    while abs(error) > 3:  # Stop within 3 degrees of target
        current_heading = gyro_sensor.heading()
        
        error = target_heading - current_heading
        if error > 180:
            error -= 360
        elif error < -180:
            error += 360
        
        # Stop if we're close enough
        if abs(error) <= 3:
            break
            
        wait(10, MSEC)
    
    # Stop motors
    left_drive_smart.stop()
    right_drive_smart.stop()
    
    # Final heading report
    brain.screen.set_cursor(3, 1)
    brain.screen.print("Final: ", current_heading)

# Example function to run a square pattern with the block-based functions
def drive_square(side_length_mm):
    # Use the functions from the blocks
    for i in range(4):
        PstraightFor(side_length_mm, 0, 50, 2)  # Drive forward with kp=2
        wait(0.2, SECONDS)
        GyroTurn(90, 20, 3)  # Turn right 90 degrees with kp=3
        wait(0.2, SECONDS)

# Simple test function
def test_straight_line():
    brain.screen.clear_screen()
    brain.screen.set_cursor(1, 1)
    brain.screen.print("Straight Line Test")
    brain.screen.set_cursor(2, 1)
    brain.screen.print("Push robot to test")
    
    # Drive straight for 1000mm at 50% speed
    PstraightFor(1000, 0, 50, 2)
    
    brain.screen.clear_screen()
    brain.screen.set_cursor(1, 1)
    brain.screen.print("Test Complete")

 

# Autonomous routine function
def run_autonomous():
    global remote_control_code_enabled
    
    # Disable remote control during autonomous
    remote_control_code_enabled = False
    
    brain.screen.clear_screen()
    brain.screen.set_cursor(1, 1)
    brain.screen.print("Autonomous Mode")
    drive_straight_pid(1000, 100, 0)
    GyroTurn(45, 100, 3)
# Event handler for autonomous touchled
def onevent_autonomous_pressed():
    run_autonomous()

# Register autonomous touchled event
autonomous.pressed(onevent_autonomous_pressed)

def onevent_controllerbuttonLUp_pressed_0():
    global myVariable, launch
    if launch == 0:
        pneumatic_1.extend(CYLINDER1)
        Launcher.spin(FORWARD)
        wait(0.25, SECONDS)
        while not TopGoalSense.object_distance(INCHES) < 2:
            wait(20, MSEC)
        wait(0.4, SECONDS)
        Launcher.stop()
        launch = 1
    else:
        pneumatic_1.retract(CYLINDER1)
        wait(0.25, SECONDS)
        Launcher.spin(FORWARD)
        wait(0.75, SECONDS)
        while not TopGoalSense.object_distance(INCHES) < 2:
            wait(20, MSEC)
        Launcher.stop()
        launch = 1
        pneumatic_1.extend(CYLINDER1)

def when_started1():
    global myVariable, launch
    # Initialize inertial sensor for accurate heading in PID control
    gyro_sensor.calibrate()
    while gyro_sensor.is_calibrating():
        wait(200, MSEC)
    gyro_sensor.set_heading(0, DEGREES)
    brain.screen.print("Gyro Sensor Calibrated")
    wait(0.5, SECONDS)
    
    # Apply 32:16 gear ratio to other motors for consistency
    IntakeGroup.set_velocity(500, PERCENT)
    IntakeGroup.set_max_torque(500, PERCENT)
    Intake.set_velocity(500, PERCENT)
    Intake.set_max_torque(500, PERCENT)
    Launcher.set_velocity(500, PERCENT)
    Launcher.set_max_torque(500, PERCENT)
    pneumatic_1.pump_on()
    Launcher.set_stopping(HOLD)
    launch = 0
    pneumatic_1.retract(CYLINDER1)

def onevent_controllerbuttonLDown_pressed_0():
    pneumatic_1.retract(CYLINDER1)
    global myVariable, launch
    Launcher.spin(FORWARD)
    wait(0.5, SECONDS)
    while not BottomSense.object_distance(INCHES) < 2:
        wait(20, MSEC)
    wait(0.09, SECONDS)
    Launcher.stop()
    pneumatic_1.retract(CYLINDER1)

def onevent_controllerbuttonRUp_pressed_0():
    global myVariable, launch
    IntakeGroup.spin(FORWARD)
    Intake.spin(FORWARD)

def onevent_controllerbuttonRDown_pressed_0():
    global myVariable, launch
    IntakeGroup.spin(REVERSE)
    Intake.spin(REVERSE)
def onevent_controllerbuttonRDown_released_0():
    global myVariable, launch
    IntakeGroup.stop()
    Intake.stop()

def onevent_controllerbuttonRUp_released_0():
    global myVariable, launch
    IntakeGroup.stop()
    Intake.stop()

# system event handlers
controller.buttonLUp.pressed(onevent_controllerbuttonLUp_pressed_0)
controller.buttonLDown.pressed(onevent_controllerbuttonLDown_pressed_0)
controller.buttonRUp.pressed(onevent_controllerbuttonRUp_pressed_0)
controller.buttonRDown.pressed(onevent_controllerbuttonRDown_pressed_0)
controller.buttonRDown.released(onevent_controllerbuttonRDown_released_0)
controller.buttonRUp.released(onevent_controllerbuttonRUp_released_0)
# add 15ms delay to make sure events are registered correctly.
wait(15, MSEC)

when_started1()

# Memory-optimized PID implementation 
class PID:
    """Memory-efficient PID controller for VEX robots."""

    def __init__(self, Kp=2.0, Ki=0.0, Kd=0.5, setpoint=0, output_limits=(-100, 100)):
        # PID gains
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        
        # Target value
        self.setpoint = setpoint
        
        # Output limits
        self._min_output, self._max_output = output_limits
        
        # Initialize tracking variables
        self.reset()

    def reset(self):
        """Reset the controller."""
        self._integral = 0
        self._last_error = None

    def __call__(self, input_value, dt=0.01):
        """Compute and return a control value based on the current input value."""
        # Calculate error
        error = self.setpoint - input_value
        
        # Handle angle wraparound for headings (normalize to -180 to 180)
        if abs(error) > 180:
            error = error - 360 if error > 0 else error + 360
            
        # Calculate P term
        p_term = self.Kp * error
        
        # Calculate I term - simplified
        if self.Ki != 0:
            # Only integrate when close to target to prevent windup
            if abs(error) < 10:
                self._integral += error * dt
                # Limit integral to prevent excessive values
                if self._integral > 30:
                    self._integral = 30
                elif self._integral < -30:
                    self._integral = -30
            i_term = self.Ki * self._integral
        else:
            i_term = 0
        
        # Calculate D term - simplified
        if self._last_error is not None and self.Kd != 0:
            d_term = self.Kd * (error - self._last_error) / dt
        else:
            d_term = 0
        
        self._last_error = error
            
        # Compute output with PID terms
        output = p_term + i_term + d_term
        
        # Apply output limits
        if output > self._max_output:
            output = self._max_output
        elif output < self._min_output:
            output = self._min_output
            
        return output
        
    @property
    def components(self):
        """Return the P, I, and D components as a tuple."""
        if self._last_error is None:
            return (0, 0, 0)
        return (
            self.Kp * self._last_error,
            self.Ki * self._integral,
            self.Kd * (0 if self._last_error is None else self._last_error)
        )

# Optimized function for driving straight with PID control
def drive_straight_pid(distance_mm, speed_pct, heading=0):
    # Create simple PID controller with reduced memory usage
    heading_pid = PID(Kp=2.5, Ki=0.0, Kd=2.0, setpoint=0, output_limits=(-50, 50))
    
    # Reset encoders
    left_drive_smart.reset_position()
    right_drive_smart.reset_position()
    
    # Set target heading
    if heading == 0:
        heading_pid.setpoint = gyro_sensor.heading()
    else:
        heading_pid.setpoint = heading
    
    # Debug display
    brain.screen.clear_screen()
    brain.screen.set_cursor(1, 1)
    brain.screen.print("PID Drive")
    
    # Calculate wheel parameters
    wheel_circumference = 3.14159 * 200
    gear_ratio = 0.5
    
    # Start motors
    left_drive_smart.spin(FORWARD)
    right_drive_smart.spin(FORWARD)
    
    # For updates
    update_counter = 0
    
    # Drive until distance reached
    while True:
        # Calculate distance traveled
        left_position = abs(left_drive_smart.position(DEGREES))
        right_position = abs(right_drive_smart.position(DEGREES))
        avg_position = (left_position + right_position) / 2
        traveled_distance = (avg_position * gear_ratio / 360) * wheel_circumference
        
        # Stop if target distance reached
        if traveled_distance >= distance_mm:
            left_drive_smart.stop()
            right_drive_smart.stop()
            break
            
        # Get current heading
        current_heading = gyro_sensor.heading()
        
        # Compute heading correction
        heading_correction = heading_pid(current_heading, 0.01)
        
        # Display debug info periodically
        update_counter += 1
        if update_counter >= 25:  # Every ~250ms
            brain.screen.set_cursor(2, 1)
            brain.screen.print("Heading: ", current_heading)
            update_counter = 0
        
        # Apply correction to motor speeds
        left_velocity = speed_pct + heading_correction
        right_velocity = speed_pct - heading_correction
        
        # Apply clamped velocities
        left_drive_smart.set_velocity(max(min(left_velocity, 100), -100), PERCENT)
        right_drive_smart.set_velocity(max(min(right_velocity, 100), -100), PERCENT)
        
        # Wait for next cycle
        wait(10, MSEC)  # Reduced update frequency

# Add pneumatic control handlers for E buttons
def onevent_controllerEUp_pressed_0():
    pneumatic_1.extend(CYLINDER1)

def onevent_controllerEDown_pressed_0():
    pneumatic_1.retract(CYLINDER1)

# Register E button events
controller.buttonEUp.pressed(onevent_controllerEUp_pressed_0)
controller.buttonEDown.pressed(onevent_controllerEDown_pressed_0)
