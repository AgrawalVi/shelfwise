import base64
import os
import requests
import json

def serialize_image(filepath):
    """
    Serialize a JPG image from a file path into a JSON-compatible dictionary.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Image not found at path: {filepath}")
    
    try:
        # Read the image as raw binary data
        with open(filepath, "rb") as file:
            image_bytes = file.read()
        
        # Encode the binary data as a Base64 string
        base64_str = base64.b64encode(image_bytes).decode("utf-8")
        
        # Construct a JSON-compatible dictionary
        serialized_json = {
            "content": base64_str
        }
        
        return serialized_json
    
    except Exception as e:
        raise RuntimeError(f"Failed to serialize image: {e}")


def send_serialized_image(api_url, serialized_image):
    """
    Send a serialized image to the scan_receipts endpoint.
    """
    try:
        # Send the serialized image as a JSON payload
        response = requests.post(api_url, json=serialized_image)
        return response.json()
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    # Path to the test image
    image_path = "./receipt_4.jpg"  # Adjust the path if needed

    # API endpoint
    api_url = "http://127.0.0.1:8000/scan_receipts"

    try:
        # Serialize the image
        serialized_image = serialize_image(image_path)
        # print("Serialized Image:", json.dumps(serialized_image, indent=2))

        # Send the serialized image to the API
        response = send_serialized_image(api_url, serialized_image)
        print("API Response:", json.dumps(response, indent=2))

    except FileNotFoundError as e:
        print(f"File error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
