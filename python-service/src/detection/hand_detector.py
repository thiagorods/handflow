import os
import urllib.request

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

from src.config import HAND_LANDMARKER_PATH, MODELS_DIR

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"
)

# Connections between landmarks to draw the hand skeleton
HAND_CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),        # thumb
    (0,5),(5,6),(6,7),(7,8),        # index
    (0,9),(9,10),(10,11),(11,12),   # middle
    (0,13),(13,14),(14,15),(15,16), # ring
    (0,17),(17,18),(18,19),(19,20), # pinky
    (5,9),(9,13),(13,17)            # palm
]


def _download_model():
    if HAND_LANDMARKER_PATH.exists():
        return

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print("Downloading hand landmarker model...")

    # The file is downloaded under a temporary name and renamed at the end.
    # If the download is interrupted, a half-written file never ends up with
    # the final name, which would make every later run fail with a corrupted model.
    temporary_path = HAND_LANDMARKER_PATH.with_suffix(".task.part")
    urllib.request.urlretrieve(MODEL_URL, temporary_path)
    os.replace(temporary_path, HAND_LANDMARKER_PATH)
    print("Done.")


class HandDetector:
    """
    Responsible for detecting hands in a frame and extracting landmarks.
    Does not know where the frame came from or what will be done with the data.
    """

    def __init__(self, max_hands=1, detection_confidence=0.7):
        _download_model()

        base_options = mp_python.BaseOptions(model_asset_path=str(HAND_LANDMARKER_PATH))
        options = mp_vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=max_hands,
            min_hand_detection_confidence=detection_confidence
        )
        self._detector = mp_vision.HandLandmarker.create_from_options(options)

    def detect(self, frame_bgr):
        """
        Receives a BGR frame (OpenCV standard).
        Returns (annotated_frame, landmarks) where:
          - annotated_frame: frame with skeleton drawn on it
          - landmarks: np.array of shape (63,) or None if no hand detected
        """
        # OpenCV stores channels as blue-green-red while MediaPipe expects
        # red-green-blue. cvtColor also returns a contiguous copy in memory,
        # which the native MediaPipe code requires.
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

        result = self._detector.detect(mp_image)

        if not result.hand_landmarks:
            return frame_bgr, None

        hand = result.hand_landmarks[0]
        self._draw_skeleton(frame_bgr, hand)
        landmarks = self._extract_vector(hand)

        return frame_bgr, landmarks

    def close(self):
        """
        Releases the native MediaPipe resources. Calling it explicitly avoids
        the error message MediaPipe prints when it is cleaned up automatically
        while Python is already shutting down.
        """
        if self._detector is not None:
            self._detector.close()
            self._detector = None

    def _draw_skeleton(self, frame, hand_landmarks):
        """Drawing landmarks and connections directly on the frame using OpenCV."""
        h, w = frame.shape[:2]

        # Drawing connections first (so dots render on top)
        for start, end in HAND_CONNECTIONS:
            p1 = hand_landmarks[start]
            p2 = hand_landmarks[end]
            x1, y1 = int(p1.x * w), int(p1.y * h)
            x2, y2 = int(p2.x * w), int(p2.y * h)
            cv2.line(frame, (x1, y1), (x2, y2), (180, 180, 180), 1)

        # Drawing landmark dots
        for landmark in hand_landmarks:
            x, y = int(landmark.x * w), int(landmark.y * h)
            cv2.circle(frame, (x, y), 4, (0, 200, 100), -1)

    def _extract_vector(self, hand_landmarks):
        """
        Converts 21 landmarks into a flat vector of 63 values.
        Format: [x0, y0, z0, x1, y1, z1, ..., x20, y20, z20]
        """
        points = []
        for landmark in hand_landmarks:
            points.extend([landmark.x, landmark.y, landmark.z])
        return np.array(points, dtype=np.float32)
