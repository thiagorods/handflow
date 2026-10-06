from src.translation.text_builder import TextBuilder


def test_new_sign_is_appended():
    builder = TextBuilder()
    builder.update("A")
    builder.update("B")
    assert builder.text == "AB"


def test_holding_a_sign_does_not_repeat_it():
    builder = TextBuilder()
    for _ in range(100):
        builder.update("A")
    assert builder.text == "A"


def test_same_letter_can_be_typed_again_after_the_hand_leaves():
    builder = TextBuilder(cooldown_frames=5)
    builder.update("L")
    for _ in range(5):
        builder.update(None)
    builder.update("L")
    assert builder.text == "LL"


def test_short_absence_does_not_repeat_the_letter():
    builder = TextBuilder(cooldown_frames=5)
    builder.update("L")
    for _ in range(2):
        builder.update(None)
    builder.update("L")
    assert builder.text == "L"


def test_backspace_and_clear():
    builder = TextBuilder()
    builder.update("A")
    builder.update("B")
    builder.backspace()
    assert builder.text == "A"
    builder.clear()
    assert builder.text == ""


def test_clear_does_not_retype_a_sign_that_is_still_held():
    builder = TextBuilder()
    builder.update("A")
    builder.clear()
    builder.update("A")
    assert builder.text == ""
