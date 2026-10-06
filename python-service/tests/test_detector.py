import numpy as np
import pytest

from src.config import HAND_LANDMARKER_PATH

pytest.importorskip("mediapipe")


@pytest.mark.skipif(
    not HAND_LANDMARKER_PATH.exists(),
    reason="hand_landmarker.task not downloaded yet (run the app once with internet access)",
)
def test_blank_frame_has_no_hand():
    from src.detection.hand_detector import HandDetector

    detector = HandDetector()
    try:
        blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        frame, landmarks = detector.detect(blank_frame)
    finally:
        detector.close()

    assert landmarks is None
    assert frame.shape == (480, 640, 3)
