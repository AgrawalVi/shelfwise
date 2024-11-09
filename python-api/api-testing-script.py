import base64
import os
import requests

from PIL import Image

def imagepath_to_json(image_path):
    """
    Serialize an image file path to a JSON-compatible dictionary.
    Args:
        image_path (str): Path to the image file.
    Returns:
        dict: JSON-compatible dictionary with image metadata and content.
    """
    with open(image_path, "rb") as file:
        image_bytes = file.read()
    base64_str = base64.b64encode(image_bytes).decode("utf-8")
    
    return {
        "filename": os.path.basename(image_path),
        "size": len(image_bytes),
        "content": base64_str
    }


def test_scan_receipts(api_url, image_path):
    """
    Test the scanReceipts API endpoint by uploading an image.

    Args:
        api_url (str): The URL of the API endpoint.
        image_path (str): Path to the test image.

    Returns:
        dict: The JSON response from the API.
    """

    
    image_json = imagepath_to_json(image_path)

    try:
        # Open the test image in binary mode
        with open(image_json, "rb") as file:
            # Prepare the multipart form-data
            files = {"file": file}

            # Send the POST request
            response = requests.post(api_url, files=files)

        # Check the response status
        if response.status_code == 200:
            print("API Test Successful!")
            return response.json()
        else:
            print(f"API Test Failed with Status Code: {response.status_code}")
            print("Response:", response.text)
            return {"error": response.text}

    except FileNotFoundError:
        print(f"Error: File not found at {image_path}")
        return {"error": "File not found"}

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}


# Example usage
if __name__ == "__main__":

    api_url = "http://0.0.0.0:8000/scan_receipts"

    # Path to the test image
    image_path = "receipt3.jpg"

    # Test the API
    response = test_scan_receipts(api_url, image_path)

    # Print the API response
    print("API Response:")
    print(response)


