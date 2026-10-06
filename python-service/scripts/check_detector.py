import sys
from pathlib import Path

# Makes the "src" package importable when this file is run directly
# (python scripts/check_detector.py), from any working directory.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import configure_display_backend

configure_display_backend()

import cv2

from src.capture.camera_manager import CameraManager
from src.detection.hand_detector import HandDetector


def main():
    """
    Manual check: opens the webcam and prints the landmarks of the detected hand.
    Useful to confirm the camera and MediaPipe work before collecting data.
    """
    camera = CameraManager()
    if not camera.is_open():
        print("Could not open the camera.")
        sys.exit(1)

    detector = HandDetector()
    print("Show your hand to the camera. Press Q to quit.")

    try:
        while True:
            frame = camera.read()
            if frame is None:
                continue

            annotated_frame, landmarks = detector.detect(frame)

            if landmarks is not None:
                print(f"Landmarks extracted: shape={landmarks.shape}, wrist={landmarks[:3]}")
            else:
                print("No hand detected")

            cv2.imshow("HandDetector Check", annotated_frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        detector.close()
        camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
