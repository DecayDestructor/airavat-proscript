from pydantic import BaseModel

class PrescriptionRequest(BaseModel):
    patient_name: str
    age: int
    sex: str
    allergy: str
    condition: str
    drugs: str
    dosage: str
    frequency: str
    pregnancy_category: int

class PrescriptionResponse(BaseModel):
    age_flag: float
    sex_flag: float
    dosage_flag: float
    frequency_flag: float
    drugs_flag: float
    pregnancy_flag: float
    allergy_flag: float
    flag: float