import numpy as np

from src.recognition.preprocessing import normalize_landmarks


def make_hand(seed=0):
    # A fake hand: 21 random points laid out as a flat (63,) vector.
    rng = np.random.default_rng(seed)
    return rng.random(63).astype(np.float32)


def test_output_keeps_input_shape():
    assert normalize_landmarks(make_hand()).shape == (63,)
    assert normalize_landmarks(np.stack([make_hand(1), make_hand(2)])).shape == (2, 63)


def test_wrist_becomes_origin():
    result = normalize_landmarks(make_hand()).reshape(21, 3)
    assert np.allclose(result[0], 0)


def test_moving_the_hand_on_screen_changes_nothing():
    hand = make_hand()
    shifted = (hand.reshape(21, 3) + np.array([0.2, -0.1, 0.05])).flatten()
    assert np.allclose(normalize_landmarks(hand), normalize_landmarks(shifted), atol=1e-5)


def test_hand_distance_from_camera_changes_nothing():
    # A hand twice as far from the camera looks half as big.
    hand = make_hand()
    assert np.allclose(normalize_landmarks(hand), normalize_landmarks(hand * 0.5), atol=1e-5)


def test_batch_matches_single_sample():
    hands = np.stack([make_hand(1), make_hand(2)])
    batch = normalize_landmarks(hands)
    assert np.allclose(batch[0], normalize_landmarks(hands[0]))
    assert np.allclose(batch[1], normalize_landmarks(hands[1]))


def test_degenerate_hand_does_not_divide_by_zero():
    result = normalize_landmarks(np.zeros(63, dtype=np.float32))
    assert np.all(np.isfinite(result))
