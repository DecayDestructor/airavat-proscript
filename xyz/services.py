import pandas as pd
import os
import requests
from dotenv import load_dotenv
import openai

def age_check(index, prescription, ade):
    """
    Process a single prescription row to calculate age_flag and update the original DataFrame.
    """
    row = prescription.loc[index]
    message = []
    drugs_list = [drug.strip() for drug in row["drugs"].split(",")]
    age_flag = []

    for drug_name in drugs_list:
        drug_row = ade[ade["drug_name"] == drug_name]
        if not drug_row.empty:
            min_age_limit = drug_row["min_age_limit"].values[0]
            max_age_limit = drug_row["max_age_limit"].values[0]
            if min_age_limit <= row["age"] <= max_age_limit:
                age_flag.append(0)
            else:
                age_flag.append(1)
                message.append(f"{drug_name} isn't recommended for patient's age")
        else:
            age_flag.append(1)

    mean_age_flag = sum(age_flag) / len(age_flag) if age_flag else 0
    prescription.loc[index, "age_flag"] = mean_age_flag
    return mean_age_flag, message

def sex_check(index, prescription, ade):
    """
    Process a single prescription row to calculate sex_flag and update the original DataFrame.
    """
    row = prescription.loc[index]
    message = []
    drugs_list = [drug.strip() for drug in row["drugs"].split(",")]
    sex_flag = []

    for drug_name in drugs_list:
        drug_row = ade[ade["drug_name"] == drug_name]
        if not drug_row.empty:
            drug_sex = drug_row["sex"].values[0].strip().lower()
            patient_sex = row["sex"].strip().lower()
            if drug_sex == "all" or drug_sex == patient_sex:
                sex_flag.append(0)
            else:
                sex_flag.append(1)
                message.append(f"{drug_name} isn't compatible for patient's sex")
        else:
            sex_flag.append(1)

    mean_sex_flag = sum(sex_flag) / len(sex_flag) if sex_flag else 0
    prescription.loc[index, "sex_flag"] = mean_sex_flag
    return mean_sex_flag, message

def dosage_check(index, prescription, ade):
    """
    Process a single prescription row to calculate dosage_flag and update the original DataFrame.
    """
    row = prescription.loc[index]
    drugs_list = [drug.strip() for drug in row["drugs"].split(",")]
    patient_dosages = [float(dosage.strip()) if str(dosage).strip().replace('.', '', 1).isdigit() else None
                       for dosage in row["dosage"].split(",")]
    dosage_flag = []
    message = []

    for i, drug_name in enumerate(drugs_list):
        drug_row = ade[ade["drug_name"] == drug_name]
        if not drug_row.empty:
            try:
                drug_dosage = float(drug_row["dosage"].values[0])
            except ValueError:
                drug_dosage = None

            patient_dosage = patient_dosages[i]
            if drug_dosage is not None and patient_dosage is not None:
                if drug_dosage >= patient_dosage:
                    dosage_flag.append(0)
                else:
                    dosage_flag.append(1)
                    message.append(f"High dosage {drug_name}, recommended dosage: {drug_dosage}")
            else:
                dosage_flag.append(1)
        else:
            dosage_flag.append(1)

    mean_dosage_flag = sum(dosage_flag) / len(dosage_flag) if dosage_flag else 0
    prescription.loc[index, "dosage_flag"] = mean_dosage_flag
    return mean_dosage_flag, message

def frequency_check(index, prescription, ade):
    """
    Process a single prescription row to calculate frequency_flag and update the original DataFrame.
    """
    row = prescription.loc[index]
    drugs_list = [drug.strip() for drug in row["drugs"].split(",")]
    patient_frequencies = [int(freq.strip()) if str(freq).strip().isdigit() else None
                           for freq in row["frequency"].split(",")]
    frequency_flag = []
    message = []

    for i, drug_name in enumerate(drugs_list):
        drug_row = ade[ade["drug_name"] == drug_name]
        if not drug_row.empty:
            try:
                drug_frequency = int(drug_row["frequency"].values[0])
            except ValueError:
                drug_frequency = None

            patient_frequency = patient_frequencies[i]
            if drug_frequency is not None and patient_frequency is not None:
                if drug_frequency == patient_frequency:
                    frequency_flag.append(0)
                else:
                    frequency_flag.append(1)
                    message.append(f"High frequency {drug_name}, recommended frequency: {drug_frequency} times a day")
            else:
                frequency_flag.append(1)
        else:
            frequency_flag.append(1)

    mean_frequency_flag = sum(frequency_flag) / len(frequency_flag) if frequency_flag else 0
    prescription.loc[index, "frequency_flag"] = mean_frequency_flag
    return mean_frequency_flag, message

def drugs_check(index, prescription, ade, threshold=50):
    """
    Process a single prescription row to calculate drugs_flag and update the original DataFrame.
    """
    row = prescription.loc[index]
    drugs_list = [drug.strip() for drug in row["drugs"].split(",")]
    sum_scores = []
    message = []

    for i, drug_name1 in enumerate(drugs_list):
        row1 = ade[ade["drug_name"] == drug_name1].iloc[0]
        for j, drug_name2 in enumerate(drugs_list):
            if i < j:
                row2 = ade[ade["drug_name"] == drug_name2].iloc[0]

                a, b, c, d, e, f, g, h = 25, 15, 15, 10, 10, 10, 10, 5
                sum_score = 0

                if row1["medical_condition"] == row2["medical_condition"]:
                    sum_score += a
                if row1["side_effects"] == row2["side_effects"]:
                    sum_score += b
                if row1["drug_classes"] == row2["drug_classes"]:
                    sum_score += c
                if row1["pregnancy_category"] == row2["pregnancy_category"]:
                    sum_score += d
                if row1["alcohol"] == row2["alcohol"]:
                    sum_score += e
                if abs(row1["min_age_limit"] - row2["min_age_limit"]) <= 2:
                    sum_score += f
                if abs(row1["max_age_limit"] - row2["max_age_limit"]) <= 2:
                    sum_score += g
                if row1["sex"] == row2["sex"]:
                    sum_score += h

                sum_scores.append(sum_score)
                if sum_score < threshold:
                    message.append(f"{row1['drug_name']} and {row2['drug_name']} aren't compatible with each other")

    drugs_flag = sum(sum_scores) / len(sum_scores) / 100 if sum_scores else 0
    prescription.loc[index, "drugs_flag"] = drugs_flag
    return drugs_flag, message

def pregnancy_check(index, prescription, ade):
    """
    Process a single prescription row to calculate pregnancy_flag and update the original DataFrame.
    """
    row = prescription.loc[index]
    drugs_list = [drug.strip() for drug in row["drugs"].split(",")]
    pregnancy_flag = []
    message = []

    for drug_name in drugs_list:
        drug_row = ade[ade["drug_name"] == drug_name]
        if not drug_row.empty:
            drug_row = drug_row.iloc[0]
            if row["pregnancy_category"] == drug_row["pregnancy_category"]:
                pregnancy_flag.append(0)
            else:
                pregnancy_flag.append(1)
                message.append(f"{drug_row['drug_name']} isn't compatible with pregnancy")
        else:
            pregnancy_flag.append(1)
            message.append(f"{drug_name} not found in drug database")

    mean_pregnancy_flag = sum(pregnancy_flag) / len(pregnancy_flag) if pregnancy_flag else 0
    prescription.loc[index, "pregnancy_flag"] = mean_pregnancy_flag
    return mean_pregnancy_flag, message

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables.")

openai.api_key = api_key

def allergy_check(index, prescription, ade):
    row = prescription.loc[index]
    drugs_list = [drug.strip() for drug in row["drugs"].split(",")]
    patient_allergies = row["allergy"]
    patient_allergies_str = ", ".join([allergy.strip() for allergy in patient_allergies.split(",")])

    allergy_flags = []
    message = []

    for drug_name in drugs_list:
        drug_row = ade[ade["drug_name"] == drug_name]
        if not drug_row.empty:
            drug_side_effects = drug_row["side_effects"].values[0]

            prompt = f"""
Patient's allergies include both side effects they are vulnerable to and their existing allergies.
Check if any of the following side effects of a drug match the patient's allergies,
or if the patient's allergies could be caused by the drug's side effects:

Drug Side Effects: {drug_side_effects}
Patient Allergies: {patient_allergies_str}

Return the results in the following object format:
- If a side effect matches or causes an allergy, reply with: {{"message": "[drug] causes [allergy/side effect].", "allergy_flag": "1"}}
- If no match is found, reply with: {{"message": "", "allergy_flag": "0"}}
"""

            try:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}]
                )

                reply = response['choices'][0]['message']['content']

                if '"allergy_flag": "1"' in reply:
                    allergy_flags.append(1)
                else:
                    allergy_flags.append(0)

                message.append(reply)

            except Exception as e:
                print(f"Error querying GPT: {e}")
                allergy_flags.append(0)

        else:
            allergy_flags.append(0)

    mean_allergy_flag = sum(allergy_flags) / len(allergy_flags) if allergy_flags else 0
    prescription.loc[index, "allergy_flag"] = mean_allergy_flag
    return mean_allergy_flag, message

def check(index, prescription):
    columns = ['age_flag', 'sex_flag', 'allergy_flag', 'drugs_flag', 'dosage_flag', 'frequency_flag', 'pregnancy_flag']
    row = prescription.loc[index]
    values = row[columns].values
    mean = values.mean()
    mse = ((values - mean) ** 2).mean()
    prescription.loc[index, "flag"] = mse
    return mse
