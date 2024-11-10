import sys
from PIL import Image
import numpy as np
import pytesseract
import cv2

def load_receipt_image(image_path):
    try:
        image = Image.open(image_path)
        return image
    except Exception as e:
        print(f"Error loading image: {e}")
        return None

def extract_text_from_image(image):
    try:
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"Error performing OCR: {e}")
        return ""

def save_text_to_file(text, output_file):
    try:
        with open(output_file, "w") as file:
            file.write(text)
        print(f"Extracted text saved to {output_file}")
    except Exception as e:
        print(f"Error saving text to file: {e}")


def extractor(image_input):
    
    if isinstance(image_input, np.ndarray):
        image = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
    elif isinstance(image_input, str):
        image = load_receipt_image(image_input)
    else:
        print("Unsupported image input format.")
        return None

    if not image:
        return None
    
    text = extract_text_from_image(image)
    if not text.strip():
        print("No text extracted from the image.")
        return
    return text