from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from schemas.prescription_schema import PrescriptionRequest, PrescriptionResponse
from schemas.schemas import ImageAnalysisRequest, ImageAnalysisResponse, ErrorResponse
import os
import logging
import uuid
from services.models import (
    age_check,
    sex_check,
    dosage_check,
    frequency_check,
    drugs_check,
    pregnancy_check,
    allergy_check,
    check
)
from services.image_processor import ImageProcessor
import json
import os
from utils.helpers import load_data

# Initialize FastAPI app
app = FastAPI()

# Load data once at startup
ade, prescription = load_data()

@app.post("/check-prescription", response_model=PrescriptionResponse)
async def check_prescription(request: PrescriptionRequest):
    """
    Endpoint to check a prescription for various flags and return messages.
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

        # Perform checks and collect flags and messages
        age_flag, age_messages = age_check(index, prescription, ade)
        sex_flag, sex_messages = sex_check(index, prescription, ade)
        dosage_flag, dosage_messages = dosage_check(index, prescription, ade)
        frequency_flag, frequency_messages = frequency_check(index, prescription, ade)
        drugs_flag, drugs_messages = drugs_check(index, prescription, ade)
        pregnancy_flag, pregnancy_messages = pregnancy_check(index, prescription, ade)
        allergy_flag, allergy_messages = allergy_check(index, prescription, ade)
        flag = check(index, prescription)

        # Aggregate all messages
        messages = (
            age_messages
            + sex_messages
            + dosage_messages
            + frequency_messages
            + drugs_messages
            + pregnancy_messages
            + allergy_messages
        )

        # Return response with flags and messages
        return PrescriptionResponse(
            age_flag=age_flag,
            sex_flag=sex_flag,
            dosage_flag=dosage_flag,
            frequency_flag=frequency_flag,
            drugs_flag=drugs_flag,
            pregnancy_flag=pregnancy_flag,
            allergy_flag=allergy_flag,
            flag=flag,
            messages=messages  # Include aggregated messages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

processor = ImageProcessor()

@app.post("/analyze-file")
async def analyze_uploaded_file(file: UploadFile = File(...)):
    try:
        processor = ImageProcessor()
        markdown_result = await processor.process_uploaded_file(file)
        json_result = processor.generate_json(markdown_result)
        return {
            "markdown_output": markdown_result,
            "json_output": json_result
        }
    except Exception as e:
        logger.error(f"Error in endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze-url", response_model=ImageAnalysisResponse)
async def analyze_image_url(request: ImageAnalysisRequest):
    """Analyze image from URL"""
    try:
        # Download image temporarily
        temp_path = f"temp/{uuid.uuid4()}.jpg"
        processor._download_image(request.image_url, temp_path)
        
        # Process image
        markdown_result = processor.analyze_image(temp_path, request.prompt)
        
        # Generate JSON
        json_result = processor.generate_json(markdown_result)
        
        # Clean up
        os.remove(temp_path)
        
        return {
            "markdown_output": markdown_result,
            "json_output": json_result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Medical Image Processor API"}