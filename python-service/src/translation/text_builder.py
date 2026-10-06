class TextBuilder:
    """
    Accumulates recognized signs into a text string.
    Avoids repeating the same letter by requiring the predicted sign
    to change before appending a new character.
    """

    def __init__(self, cooldown_frames=20):
        self._text = ""
        self._last_sign = None

        # number of frames without a stable sign (for example, the hand left
        # the frame) before the same letter can be appended again — prevents
        # holding a sign from spamming the output, while still allowing double
        # letters such as "LL" when the signer lowers the hand between them
        self._cooldown_frames = cooldown_frames
        self._frames_since_last = 0

    def update(self, sign):
        """
        Receives the current stable prediction (or None if unstable or if no
        hand is visible). Must be called once per frame, including frames
        where nothing was recognized, because those frames are what advance
        the cooldown. Returns the current accumulated text.
        """
        if sign is None:
            self._frames_since_last += 1
            return self._text

        if sign != self._last_sign or self._frames_since_last >= self._cooldown_frames:
            self._text += sign
            self._last_sign = sign

        # Any frame with a stable sign restarts the cooldown, so a sign that
        # is being held is never appended twice.
        self._frames_since_last = 0

        return self._text

    def backspace(self):
        self._text = self._text[:-1]

    def clear(self):
        # Only the text is erased. The last sign is kept on purpose: if the
        # signer is still holding a hand shape when clearing, it should not be
        # typed again immediately.
        self._text = ""

    @property
    def text(self):
        return self._text
