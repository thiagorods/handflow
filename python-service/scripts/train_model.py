import sys
from pathlib import Path

# Makes the "src" package importable when this file is run directly
# (python scripts/train_model.py), from any working directory.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import joblib
import matplotlib

# The Agg backend draws straight to a file and never opens a window, so
# training also works on servers and never pauses waiting for a window to be closed.
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from src.config import CLASSIFIER_PATH, CONFUSION_MATRIX_PATH, DATASET_PATH
from src.recognition.preprocessing import normalize_landmarks

TEST_FRACTION = 0.2

# Accuracy below this value triggers a warning, but the model is still saved.
TARGET_ACCURACY = 0.80


def load_dataset():
    if not DATASET_PATH.is_file():
        raise FileNotFoundError(
            f"Dataset not found at {DATASET_PATH}. "
            "Create it with: python scripts/collect_data.py"
        )

    df = pd.read_csv(DATASET_PATH)

    # separate features from the label before any processing
    labels = df["label"].values
    landmarks = df.drop(columns=["label"]).values

    return landmarks, labels


def temporal_split(labels, test_fraction):
    """
    Holds out the LAST part of each sign's samples as the test set.

    The dataset is recorded sequentially, so neighbouring rows are nearly
    identical frames of the same pose. A random split scatters those
    look-alike frames across both sets, and the model is then "tested" on
    images almost identical to the ones it trained on, which reports a much
    higher accuracy than it will have with a new recording. Testing on the
    final block of each sign is a much closer simulation of showing the model
    a sign it has not seen before.

    Returns:
        ndarray: boolean mask, True for rows that belong to the test set.
    """
    is_test = np.zeros(len(labels), dtype=bool)

    for sign in np.unique(labels):
        rows = np.where(labels == sign)[0]
        test_count = max(1, int(len(rows) * test_fraction))
        is_test[rows[-test_count:]] = True

    return is_test


def train(X_train, y_train):
    # n_estimators is the number of trees in the forest
    # more trees = more stable predictions, but slower training
    # 100 is a reliable default for this size of dataset
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    return model


def evaluate(model, X_test, y_test):
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print(f"\nAccuracy: {accuracy * 100:.2f}%")
    print("\nDetailed report:")
    print(classification_report(y_test, predictions))

    plot_confusion_matrix(y_test, predictions, model.classes_)

    return accuracy


def plot_confusion_matrix(y_test, predictions, classes):
    """
    Visualizes which signs the model confuses with each other.
    Dark cells on the diagonal = correct predictions.
    Any bright cell off the diagonal = a confusion worth investigating.
    """
    cm = confusion_matrix(y_test, predictions, labels=classes)

    plt.figure(figsize=(14, 12))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=classes, yticklabels=classes)
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title("Confusion Matrix")
    plt.tight_layout()

    CONFUSION_MATRIX_PATH.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(CONFUSION_MATRIX_PATH)
    plt.close()
    print(f"\nConfusion matrix saved to {CONFUSION_MATRIX_PATH}")


def main():
    print("Loading dataset...")
    X, y = load_dataset()
    print(f"  {len(X)} samples, {len(set(y))} signs: {sorted(set(y))}")

    print("\nNormalizing landmarks...")
    X = normalize_landmarks(X)

    is_test = temporal_split(y, TEST_FRACTION)
    X_train, X_test = X[~is_test], X[is_test]
    y_train, y_test = y[~is_test], y[is_test]
    print(f"  Train: {len(X_train)} samples | Test: {len(X_test)} samples")

    print("\nTraining Random Forest...")
    model = train(X_train, y_train)

    print("\nEvaluating on samples the model did not see...")
    accuracy = evaluate(model, X_test, y_test)

    if accuracy < TARGET_ACCURACY:
        print(f"\nWarning: accuracy is below the {TARGET_ACCURACY * 100:.0f}% target.")
        print("Collect more varied samples (different distances, angles and sessions)")
        print("and check for labeling errors.")

    # The evaluation above only estimates quality. The model that is actually
    # used is retrained with every sample, so it also learns from the rows
    # that were held out for testing.
    print("\nTraining final model on the full dataset...")
    final_model = train(X, y)

    CLASSIFIER_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(final_model, CLASSIFIER_PATH)
    print(f"Model saved to {CLASSIFIER_PATH}")


if __name__ == "__main__":
    main()
