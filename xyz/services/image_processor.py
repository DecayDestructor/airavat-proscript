import os
import base64
import imghdr
import openai
import requests
import json
import logging
from urllib.parse import urlparse
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
import uuid

# Initialize logging
logger = logging.getLogger(__name__)

load_dotenv()

class ImageProcessor:
    def __init__(self):
        """Initialize the ImageProcessor with OpenAI client and default settings"""
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.default_prompt = """Convert the provided image into Markdown format. Ensure all content is included."""
        self.model = os.getenv("MODEL_NAME", "gpt-4o")
        self._ensure_temp_dir()

    def _ensure_temp_dir(self):
        """Ensure the temp directory exists"""
        try:
            os.makedirs("temp", exist_ok=True)
            logger.info("Temp directory verified/created")
        except Exception as e:
            logger.error(f"Failed to create temp directory: {str(e)}")
            raise

    def _get_mime_type(self, image_path):
        """Determine MIME type of image"""
        try:
            img_type = imghdr.what(image_path)
            return f'image/{img_type}' if img_type else 'image/jpeg'
        except Exception as e:
            logger.error(f"Error determining MIME type: {str(e)}")
            return 'image/jpeg'

    def _encode_image(self, image_path):
        """Encode image to base64 with error handling"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {str(e)}")
            raise

    def _verify_image(self, image_path):
        """Verify that a file is a valid image"""
        try:
            img = Image.open(image_path)
            img.verify()
            img.close()  # Important to close after verification
        except Exception as e:
            logger.error(f"Invalid image file: {str(e)}")
            if os.path.exists(image_path):
                os.remove(image_path)
            raise ValueError("Invalid image file")

    async def process_uploaded_file(self, file):
        """Process an uploaded file directly (without saving to disk)"""
        try:
            # Read file content
            contents = await file.read()
            
            # Verify it's an image
            try:
                img = Image.open(BytesIO(contents))
                img.verify()
                img.close()
            except Exception as e:
                logger.error(f"Invalid image file: {str(e)}")
                raise ValueError("Uploaded file is not a valid image")
            
            # Encode to base64
            base64_image = base64.b64encode(contents).decode('utf-8')
            
            # Get MIME type
            img_format = imghdr.what(None, h=contents)
            mime_type = f'image/{img_format}' if img_format else 'image/jpeg'
            
            # Create API request
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": self.default_prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_image}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=2000,
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            raise

    def generate_json(self, markdown_text):
        """Generate structured JSON from markdown text"""
        try:
            prompt = f"""
Extract structured medical data from the following document and return it in EXACTLY this JSON format:

{{
  "patient_name": "Full Patient Name",
  "age": 25,
  "sex": "Male/Female",
  "allergy": "comma,separated,list",
  "condition": "Primary Diagnosis",
  "drugs": "medication1,medication2",
  "dosage": "100,50",  # Numbers only in mg
  "frequency": "2,1",   # Numbers only (times per day)
  "pregnancy_category": 0  # 1 if pregnant, 0 otherwise
}}

DOCUMENT CONTENT:
{markdown_text}

RULES:
1. Extract ONLY the specified fields
2. For dosages: Include only the numerical value in mg (e.g., "100" not "100mg")
3. For frequencies: Include only the numerical value (e.g., "2" not "2 times daily")
4. For allergies: Combine all allergies into a comma-separated string
5. For pregnancy_category: 1 only if explicitly stated the patient is pregnant
6. If any field is missing/unknown, use empty string ("") or 0 for numbers
7. Return ONLY valid JSON with no additional text or explanations
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=2000,
            )
            
            # Parse and return as Python dict
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error generating JSON: {str(e)}")
            raise