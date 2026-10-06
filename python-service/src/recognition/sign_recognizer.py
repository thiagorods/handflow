import joblib
from collections import Counter, deque

from src.config import CLASSIFIER_PATH
from src.recognition.preprocessing import normalize_landmarks


class SignRecognizer:
    """
    Loads the trained classifier and predicts which sign a landmark vector represents.
    Uses a buffer to avoid flickering between predictions on consecutive frames.
    """

    def __init__(self, buffer_size=10, confidence_threshold=0.8, model=None):
        # A model can be injected (used by the unit tests); otherwise the
        # trained classifier is loaded from disk.
        self._model = model if model is not None else self._load_model()

        # a deque automatically discards the oldest entry when it reaches max size,
        # making it ideal as a fixed-size sliding window over recent predictions
        self._buffer = deque(maxlen=buffer_size)

        # minimum fraction of the buffer that must agree on the same sign
        # before that sign is considered a stable prediction
        self._confidence_threshold = confidence_threshold

    @staticmethod
    def _load_model():
        if not CLASSIFIER_PATH.exists():
            raise FileNotFoundError(
                f"Trained model not found at {CLASSIFIER_PATH}. "
                "Create it with: python scripts/train_model.py"
            )
        return joblib.load(CLASSIFIER_PATH)

    def predict(self, landmarks):
        """
        Receives a raw (63,) landmark vector and returns the predicted sign
        only when recent predictions are consistent enough, otherwise None.
        """
        normalized = normalize_landmarks(landmarks)

        # model expects a 2D array — reshape from (63,) to (1, 63)
        prediction = self._model.predict(normalized.reshape(1, -1))[0]
        self._buffer.append(prediction)

        return self._stable_prediction()

    def reset(self):
        """
        Forgets recent predictions. Called when the hand leaves the frame.

        Without this, the buffer keeps the last sign shown before the hand
        disappeared. When a hand comes back, those old entries still vote and
        can make the previous sign be reported again for a few frames, even if
        the new hand shape is different.
        """
        self._buffer.clear()

    def _stable_prediction(self):
        # wait until the buffer is full before making any prediction
        # avoids outputting unreliable results on the first few frames
        if len(self._buffer) < self._buffer.maxlen:
            return None

        most_common, votes = Counter(self._buffer).most_common(1)[0]
        agreement = votes / len(self._buffer)

        # only return a prediction when enough frames agree on the same sign
        if agreement >= self._confidence_threshold:
            return str(most_common)

        return None
