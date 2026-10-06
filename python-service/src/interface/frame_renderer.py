import cv2

TEXT_FONT = cv2.FONT_HERSHEY_SIMPLEX
TEXT_SCALE = 1.2
TEXT_THICKNESS = 2
TEXT_START_X = 120
TEXT_MARGIN_RIGHT = 10


class FrameRenderer:
    """
    Responsible for drawing visual elements over the video frame.

    This class centralizes all screen rendering logic to keep the main
    application flow focused only on orchestration.
    """

    def draw(self, frame, text, sign):
        """
        Draws the current sign, translated text and control hints.

        Parameters:
            frame (ndarray): processed video frame
            text (str): accumulated translated sentence
            sign (str): current recognized sign

        Returns:
            ndarray: frame ready for display
        """
        h, w = frame.shape[:2]

        # Creates a semi-transparent footer for better text readability.
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, h - 100), (w, h), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)

        # Displays the current detected sign.
        if sign:
            cv2.putText(
                frame,
                sign,
                (20, h - 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                2.0,
                (0, 200, 100),
                3
            )

        # Displays the accumulated translated text.
        available_width = w - TEXT_START_X - TEXT_MARGIN_RIGHT
        visible_text = self._fit_text(text, available_width) if text else "..."
        cv2.putText(
            frame,
            visible_text,
            (TEXT_START_X, h - 30),
            TEXT_FONT,
            TEXT_SCALE,
            (255, 255, 255),
            TEXT_THICKNESS
        )

        # Displays keyboard shortcuts.
        cv2.putText(
            frame,
            "BACKSPACE: delete | C: clear | Q: quit",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (200, 200, 200),
            1
        )

        # Resizes the frame only for display purposes.
        return cv2.resize(frame, (960, 720))

    @staticmethod
    def _fit_text(text, max_width):
        """
        Keeps only the most recent characters that fit in max_width pixels.

        OpenCV does not wrap or clip text: anything wider than the frame is
        simply drawn outside the visible area, so a long sentence would hide
        the letters that were just typed. Dropping the oldest characters keeps
        the newest ones on screen.
        """
        def width_of(value):
            (text_width, _), _ = cv2.getTextSize(value, TEXT_FONT, TEXT_SCALE, TEXT_THICKNESS)
            return text_width

        if width_of(text) <= max_width:
            return text

        trimmed = text
        while trimmed and width_of("..." + trimmed) > max_width:
            trimmed = trimmed[1:]

        return "..." + trimmed
