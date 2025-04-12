from fastapi import FastAPI, HTTPException
from schemas.prescription_schema import PrescriptionRequest, PrescriptionResponse
from services import (
    age_check,
    sex_check,
    dosage_check,
    frequency_check,
    drugs_check,
    pregnancy_check,
    allergy_check,
    check
)
from utils.helpers import load_data

# Initialize FastAPI app
app = FastAPI()

# Load data once at startup
ade, prescription = load_data()

@app.post("/check-prescription", response_model=PrescriptionResponse)
async def check_prescription(request: PrescriptionRequest):
    """
    Endpoint to check a prescription for various flags.
    """
    try:
        # Add the new prescription row to the DataFrame
        new_row = {
            "patient_name": request.patient_name,
            "age": request.age,
            "sex": request.sex,
            "allergy": request.allergy,
            "condition": request.condition,
            "drugs": request.drugs,
            "dosage": request.dosage,
            "frequency": request.frequency,
            "pregnancy_category": request.pregnancy_category,
        }
        prescription.loc[len(prescription)] = new_row
        index = len(prescription) - 1

        # Perform checks
        age_flag, _ = age_check(index, prescription, ade)
        sex_flag, _ = sex_check(index, prescription, ade)
        dosage_flag, _ = dosage_check(index, prescription, ade)
        frequency_flag, _ = frequency_check(index, prescription, ade)
        drugs_flag, _ = drugs_check(index, prescription, ade)
        pregnancy_flag, _ = pregnancy_check(index, prescription, ade)
        allergy_flag, _ = allergy_check(index, prescription, ade)
        flag = check(index, prescription)

        # Return response
        return PrescriptionResponse(
            age_flag=age_flag,
            sex_flag=sex_flag,
            dosage_flag=dosage_flag,
            frequency_flag=frequency_flag,
            drugs_flag=drugs_flag,
            pregnancy_flag=pregnancy_flag,
            allergy_flag=allergy_flag,
            flag=flag
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))