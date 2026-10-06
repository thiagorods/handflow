import sys

from src.config import configure_display_backend

# Must run before the first OpenCV window is created (see the function docs).
configure_display_backend()

import cv2

from src.capture.camera_manager import CameraManager
from src.interface.frame_renderer import FrameRenderer
from src.detection.hand_detector import HandDetector
from src.recognition.sign_recognizer import SignRecognizer
from src.translation.text_builder import TextBuilder

WINDOW_NAME = "SLT - Sign Language Translator"

# cv2.waitKey reports Backspace as 8 on most systems, but some Linux desktops
# report it as 127 (the code normally used for the Delete key).
BACKSPACE_KEYS = (8, 127)

# At about 30 frames per second, this is roughly two seconds of failed reads
# in a row, which means the camera was unplugged or is being used elsewhere.
MAX_CONSECUTIVE_READ_FAILURES = 60


def main():
    camera = CameraManager()

    if not camera.is_open():
        print("Could not open the camera. Check that it is connected and not in use by another app.")
        sys.exit(1)

    detector = None

    try:
        renderer = FrameRenderer()
        detector = HandDetector()
        recognizer = SignRecognizer()
        builder = TextBuilder()

        failed_reads = 0

        while True:
            frame = camera.read()

            if frame is None:
                failed_reads += 1
                if failed_reads >= MAX_CONSECUTIVE_READ_FAILURES:
                    print("The camera stopped sending frames. Exiting.")
                    break

                # waitKey also lets the window process events, so it stays
                # responsive while frames are failing.
                cv2.waitKey(1)
                continue

            failed_reads = 0

            processed_frame, landmarks = detector.detect(frame)

            sign = None
            if landmarks is not None:
                sign = recognizer.predict(landmarks)
            else:
                recognizer.reset()

            # Called on every frame, even without a sign: the frames where
            # nothing is recognized are what allow the same letter to be typed
            # twice in a row.
            builder.update(sign)

            display_frame = renderer.draw(
                processed_frame,
                builder.text,
                sign
            )

            cv2.imshow(WINDOW_NAME, display_frame)

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break
            elif key in BACKSPACE_KEYS:
                builder.backspace()
            elif key == ord("c"):
                builder.clear()

    finally:
        # Runs even when an error happens, so the camera is never left locked.
        if detector is not None:
            detector.close()
        camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
