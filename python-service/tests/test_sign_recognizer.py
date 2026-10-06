import numpy as np

from src.recognition.sign_recognizer import SignRecognizer


class StubModel:
    """Stands in for the trained classifier and returns a chosen sign."""

    def __init__(self, sign):
        self.sign = sign

    def predict(self, features):
        return np.array([self.sign])


HAND = np.random.default_rng(0).random(63).astype(np.float32)


def test_no_prediction_until_buffer_is_full():
    recognizer = SignRecognizer(buffer_size=5, model=StubModel("A"))
    results = [recognizer.predict(HAND) for _ in range(4)]
    assert results == [None, None, None, None]


def test_stable_sign_is_reported_once_buffer_is_full():
    recognizer = SignRecognizer(buffer_size=5, model=StubModel("A"))
    results = [recognizer.predict(HAND) for _ in range(5)]
    assert results[-1] == "A"


def test_flickering_predictions_are_rejected():
    model = StubModel("A")
    recognizer = SignRecognizer(buffer_size=6, confidence_threshold=0.8, model=model)
    for index in range(6):
        model.sign = "A" if index % 2 == 0 else "B"
        result = recognizer.predict(HAND)
    assert result is None


def test_reset_discards_predictions_from_before_the_hand_left():
    model = StubModel("A")
    recognizer = SignRecognizer(buffer_size=5, model=model)
    for _ in range(5):
        recognizer.predict(HAND)

    recognizer.reset()

    # After reset the buffer is empty again, so old "A" votes cannot leak in.
    model.sign = "B"
    assert recognizer.predict(HAND) is None
