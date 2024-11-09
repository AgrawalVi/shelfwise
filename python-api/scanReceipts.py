import cv2
import numpy as np
import pytesseract
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from preprocess import preprocess_image  # Ensure preprocess.py is in the same directory
from extract_receipt import extractor

app = FastAPI()
@app.post("/scan_receipts")
async def scan_receipts(file: UploadFile = File(...)):
    try:
        # converting to numpy array
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image file."})
        
        # Preprocess the image, takes in numpy
        processed_image = preprocess_image(image)
        
        # Extract text using Tesseract OCR, also taking in numpy
        extracted_text = extracted_text.extractor(processed_image)

        #return text
        print ({"extracted_text": extracted_text})
        return {"extracted_text": extracted_text}
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/")
async def root():
    return {"message": "API is running"}

@app.get('/test')
async def test():
    return "Test"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# image = cv2.imread('image-samples/1.jpg')

# processed = preprocess_image(image)

# print(type(processed))

# text = extractor(processed)

# print(text)


