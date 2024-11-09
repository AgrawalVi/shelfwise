import cv2
import numpy as np
import pytesseract
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from preprocess import preprocess_image  # Ensure preprocess.py is in the same directory
from extract_receipt import extractor

# app = FastAPI()

# @app.post("/scan_receipts")
# async def scan_receipts(file: UploadFile = File(...)):
#     try:
#         # Read the uploaded image file
#         contents = await file.read()
#         nparr = np.frombuffer(contents, np.uint8)
#         image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
#         if image is None:
#             return JSONResponse(status_code=400, content={"error": "Invalid image file."})
        
#         # Preprocess the image
#         processed_image = preprocess_image(image)
        
#         # Extract text using Tesseract OCR
#         extracted_text = extracted_text.extractor(processed_image)
        
#         return {"extracted_text": extracted_text}
    
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


image = cv2.imread(r'python-api\cropped_receipt3.jpg')

processed = preprocess_image(image)

print(type(processed))

text = extractor(processed)

print(text)


