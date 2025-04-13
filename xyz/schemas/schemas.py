from pydantic import BaseModel, validator
from typing import Optional, Union  # Add this import
import json

class ImageAnalysisRequest(BaseModel):
    image_url: Optional[str] = None
    prompt: Optional[str] = None

class ImageAnalysisResponse(BaseModel):
    markdown_output: str
    json_output: Optional[Union[dict, str]] = None  # Now Union is defined

    @validator('json_output')
    def validate_json(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON string")
        return v

class ErrorResponse(BaseModel):
    detail: str