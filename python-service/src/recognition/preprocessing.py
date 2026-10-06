import numpy as np

NUM_LANDMARKS = 21
WRIST = 0
MIDDLE_FINGER_BASE = 9

# Small floor used to avoid dividing by zero if two landmarks overlap exactly.
_MIN_HAND_SIZE = 1e-6


def normalize_landmarks(landmarks):
    """
    Converts raw MediaPipe landmarks into a position- and size-independent
    representation of the hand shape.

    Two things change how a hand looks to the camera without changing the sign:
    where the hand is on screen, and how far it is from the camera (a distant
    hand occupies fewer pixels, so every coordinate gets smaller). To remove
    both effects:
      1. the wrist becomes the origin, so only the relative shape remains;
      2. every coordinate is divided by the wrist-to-middle-finger-base
         distance, which acts as a ruler that grows and shrinks with the hand.

    Training and live prediction MUST both use this function. If they use
    different preprocessing, the model receives inputs it never saw in
    training and its accuracy drops without any error being raised.

    Parameters:
        landmarks (ndarray): shape (63,) for one hand or (N, 63) for N hands,
            laid out as [x0, y0, z0, x1, y1, z1, ..., x20, y20, z20].

    Returns:
        ndarray: same shape as the input.
    """
    array = np.asarray(landmarks, dtype=np.float32)
    is_single_sample = array.ndim == 1

    points = array.reshape(-1, NUM_LANDMARKS, 3)
    centered = points - points[:, WRIST:WRIST + 1, :]

    # Only x and y are used for the ruler because z is MediaPipe's least
    # precise axis (it is an estimate of depth, not a direct measurement).
    hand_size = np.linalg.norm(centered[:, MIDDLE_FINGER_BASE, :2], axis=1)
    hand_size = np.maximum(hand_size, _MIN_HAND_SIZE)

    scaled = centered / hand_size[:, None, None]
    flat = scaled.reshape(len(points), -1)

    return flat[0] if is_single_sample else flat
