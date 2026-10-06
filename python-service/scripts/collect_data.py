import csv
import sys
import time
from pathlib import Path

# Makes the "src" package importable when this file is run directly
# (python scripts/collect_data.py), from any working directory.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import DATASET_PATH, configure_display_backend

configure_display_backend()

import cv2

from src.capture.camera_manager import CameraManager
from src.detection.hand_detector import HandDetector

SAMPLES_PER_SIGN = 200

# Only one sample is saved every N frames that contain a hand. Consecutive
# frames are almost identical, so saving all of them gives hundreds of copies
# of the same pose. Spacing them out lets the signer drift slightly between
# saved samples, which produces a more varied (and more useful) dataset.
FRAMES_BETWEEN_SAMPLES = 3

COUNTDOWN_SECONDS = 3

# J and Z require motion — a single frame cannot represent them
SIGNS = ["A", "B", "C", "D", "E", "F", "G", "I",
         "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U",
         "V", "W"]

WINDOW_NAME = "Data Collection"


def setup_output_file():
    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)

    if not DATASET_PATH.is_file():
        with open(DATASET_PATH, "w", newline="") as f:
            writer = csv.writer(f)
            # 63 columns for landmarks (21 points × x, y, z) + 1 for the label
            header = [f"{axis}{i}" for i in range(21) for axis in ["x", "y", "z"]]
            header.append("label")
            writer.writerow(header)
        print(f"Created new dataset file at {DATASET_PATH}")
    else:
        print(f"Appending to existing dataset at {DATASET_PATH}")


def count_existing_samples(label):
    # avoids restarting collection from zero if the script was interrupted
    if not DATASET_PATH.is_file():
        return 0

    count = 0
    with open(DATASET_PATH, "r", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["label"] == label:
                count += 1
    return count


def show_countdown(camera, detector, label):
    """
    Shows the live camera image for a few seconds before collection starts.

    Returns False if the user pressed Q during the countdown.
    """
    end_time = time.time() + COUNTDOWN_SECONDS

    while time.time() < end_time:
        frame = camera.read()
        if frame is None:
            continue

        annotated_frame, _ = detector.detect(frame)
        seconds_left = int(end_time - time.time()) + 1
        cv2.putText(annotated_frame, f"Get ready: {label} in {seconds_left}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 200, 255), 2)
        cv2.imshow(WINDOW_NAME, annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            return False

    return True


def collect_sign(detector, camera, label):
    """
    Collects the samples for one sign.

    Returns False if the user asked to stop the whole collection (Q key),
    True otherwise.
    """
    already_collected = count_existing_samples(label)
    if already_collected >= SAMPLES_PER_SIGN:
        print(f"  '{label}' already complete, skipping.")
        return True

    samples_needed = SAMPLES_PER_SIGN - already_collected
    collected = 0
    frames_with_hand = 0

    print(f"\n--- Sign: {label} ---")
    print(f"  {already_collected}/{SAMPLES_PER_SIGN} already collected, {samples_needed} remaining.")
    print(f"  Starting in {COUNTDOWN_SECONDS} seconds. Slowly move and tilt your hand while collecting.")

    if not show_countdown(camera, detector, label):
        print("  Interrupted.")
        return False

    with open(DATASET_PATH, "a", newline="") as f:
        writer = csv.writer(f)

        while collected < samples_needed:
            frame = camera.read()
            if frame is None:
                continue

            annotated_frame, landmarks = detector.detect(frame)

            if landmarks is not None:
                frames_with_hand += 1

                if frames_with_hand % FRAMES_BETWEEN_SAMPLES == 0:
                    # each row is one sample: 63 landmark values + the sign label
                    writer.writerow(list(landmarks) + [label])
                    collected += 1

            progress_text = f"{label}: {already_collected + collected}/{SAMPLES_PER_SIGN}"
            cv2.putText(annotated_frame, progress_text, (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 200, 100), 2)

            cv2.imshow(WINDOW_NAME, annotated_frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                print("  Interrupted.")
                return False

    print(f"  Done — {samples_needed} new samples saved for '{label}'.")
    return True


def main():
    setup_output_file()

    camera = CameraManager()
    if not camera.is_open():
        print("Could not open the camera. Check that it is connected and not in use by another app.")
        sys.exit(1)

    detector = HandDetector()

    print("=== SLT Data Collection ===")
    print(f"Signs: {SIGNS}")
    print(f"Samples per sign: {SAMPLES_PER_SIGN}")
    print("Press Q to stop. Progress is saved automatically.\n")

    finished = True
    try:
        for sign in SIGNS:
            if not collect_sign(detector, camera, sign):
                finished = False
                break
    finally:
        detector.close()
        camera.release()
        cv2.destroyAllWindows()

    if finished:
        print("\nCollection complete. Dataset saved to", DATASET_PATH)
    else:
        print("\nCollection stopped. Run the script again to continue from where it stopped.")


if __name__ == "__main__":
    main()
