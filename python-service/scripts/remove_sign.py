import shutil
import sys
from pathlib import Path

# Makes the "src" package importable when this file is run directly.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd

from src.config import DATASET_PATH


def main():
    """
    Deletes every sample of the given signs from the dataset, so they can be
    recorded again with scripts/collect_data.py (which resumes from the
    remaining samples).

    Usage: python scripts/remove_sign.py L U
    """
    signs_to_remove = [sign.upper() for sign in sys.argv[1:]]
    if not signs_to_remove:
        print("Usage: python scripts/remove_sign.py <SIGN> [<SIGN> ...]")
        sys.exit(1)

    df = pd.read_csv(DATASET_PATH)

    # A copy is kept next to the dataset in case the wrong sign was removed.
    backup_path = DATASET_PATH.with_suffix(".csv.bak")
    shutil.copyfile(DATASET_PATH, backup_path)

    remaining = df[~df["label"].isin(signs_to_remove)]
    remaining.to_csv(DATASET_PATH, index=False)

    removed = len(df) - len(remaining)
    print(f"Removed {removed} samples of {signs_to_remove}. Backup saved to {backup_path}")


if __name__ == "__main__":
    main()
