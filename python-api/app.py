from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import numpy as np
import cv2
import base64
from preprocess import preprocess_image  # Retained import
from extract_receipt import extractor  # Retained import
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

load_dotenv()
security = HTTPBearer()
SECRET_TOKEN = os.getenv("API_KEY")

# Define the expected JSON payload format
class ImagePayload(BaseModel):
    content: str

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token != SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid or missing token")

@app.post("/scan_receipts")
async def scan_receipts(payload: ImagePayload, credentials: HTTPAuthorizationCredentials = Depends(verify_token)):
    """
    Endpoint to process a serialized image and return extracted text.
    """
    try:
        # Deserialize Base64 string to binary image
        try:
            image_bytes = base64.b64decode(payload.content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to decode Base64 content: {e}")

        # Convert binary image data to a NumPy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Validate the decoded image
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image data.")

        # Preprocess the image
        processed_image = preprocess_image(image)  # Ensure preprocess_image is implemented correctly

        # Extract text using OCR
        extracted_text = extractor(processed_image)  # Ensure extractor is implemented correctly

        # Return extracted text
        return {"extracted_text": extracted_text}

    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"error": e.detail})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/")
async def root():
    return "Hello World"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)