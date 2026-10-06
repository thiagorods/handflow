import sys
import os
from pathlib import Path

# All paths are built from the location of this file instead of the current
# working directory, so scripts work no matter where they are launched from.
PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODELS_DIR = PROJECT_ROOT / "models"
HAND_LANDMARKER_PATH = MODELS_DIR / "hand_landmarker.task"
CLASSIFIER_PATH = MODELS_DIR / "sign_classifier.pkl"

DATASET_PATH = PROJECT_ROOT / "data" / "processed" / "dataset.csv"
CONFUSION_MATRIX_PATH = PROJECT_ROOT / "data" / "confusion_matrix.png"


def configure_display_backend():
    """
    Makes the OpenCV window open on Linux desktops that use Wayland.

    The Qt library bundled inside the OpenCV wheel only ships the X11 ("xcb")
    plugin, so on a Wayland session the window fails to open unless Qt is told
    to go through XWayland. setdefault keeps any value the user already set in
    their own shell. This must run before the first window is created.
    """
    if not sys.platform.startswith("linux"):
        return

    os.environ.setdefault("QT_QPA_PLATFORM", "xcb")
    os.environ.setdefault("GDK_BACKEND", "x11")
