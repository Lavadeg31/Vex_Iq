import os

def find_model():
    # Start from current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Look for the model file
    for root, dirs, files in os.walk(current_dir):
        if 'best.pt' in files:
            model_path = os.path.join(root, 'best.pt')
            print(f"Found model at: {model_path}")
            return model_path
            
    print("Model not found!")
    return None

if __name__ == "__main__":
    find_model() 