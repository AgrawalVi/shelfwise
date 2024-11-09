import sys
from PIL import Image
import pytesseract

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

def main(image_path):
    # image_path = "receipt_4.jpg"  
    
    output_text_file = "extracted_text.txt" 

    image = load_receipt_image(image_path)
    if not image:
        return

    # extract
    text = extract_text_from_image(image)
    if not text.strip():
        print("No text extracted from the image.")
        return

    print("Extracted Text:")
    print(text)

    # write to txt file
    save_text_to_file(text, output_text_file)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    main(image_path)
