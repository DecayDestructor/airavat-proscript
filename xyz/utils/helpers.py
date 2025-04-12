import pandas as pd
import os

def load_data():
    """Load ADE and Prescription datasets."""
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    ade_path = os.path.join(data_dir, "ade.csv")
    prescription_path = os.path.join(data_dir, "prescription.csv")

    if not os.path.exists(ade_path) or not os.path.exists(prescription_path):
        raise FileNotFoundError("Data files not found. Ensure 'ade.csv' and 'prescription.csv' exist in the 'data/' directory.")

    ade = pd.read_csv(ade_path)
    prescription = pd.read_csv(prescription_path)
    return ade, prescription