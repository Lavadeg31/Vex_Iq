from ultralytics import YOLO

# Load a base YOLOv8 model
model = YOLO('yolov8n.pt')  # 'n' for nano (fastest)

# Train the model on your custom dataset
model.train(
    data='data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    name='vex_ball_detector'
)

# Export the model
model.export(format='onnx')