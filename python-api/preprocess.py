import cv2
import numpy as np

def preprocess_image(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Invert image if receipt is white
    if np.mean(gray) > 127:
        gray = cv2.bitwise_not(gray)
    
    # Enhance contrast using histogram equalization
    gray = cv2.equalizeHist(gray)
    
    # Apply Gaussian Blur
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                   cv2.THRESH_BINARY, 11, 2)
    
    # Apply dilation
    kernel = np.ones((5, 5), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    
    # Find contours
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Get the largest contour  
        contour = max(contours, key=cv2.contourArea)
        
        # Get bounding box coordinates
        x, y, w, h = cv2.boundingRect(contour)
        
        # Crop the image
        cropped_image = image[y:y+h, x:x+w]
    else:
        cropped_image = image

    return cropped_image
        


