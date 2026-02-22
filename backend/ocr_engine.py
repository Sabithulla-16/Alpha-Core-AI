import pytesseract
from PIL import Image
import io
import os

class OCREngine:
    def __init__(self):
        # On Render, tesseract is usually in /usr/bin/tesseract
        # On Windows, we use the path provided by the user
        if os.name == 'nt':
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

    def extract_text(self, image_content: bytes) -> str:
        try:
            image = Image.open(io.BytesIO(image_content))
            
            # Basic preprocessing: Resize if too large
            if image.width > 2000 or image.height > 2000:
                image.thumbnail((2000, 2000))
            
            # Convert to grayscale for better OCR
            image = image.convert('L')
            
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            print(f"OCR Error: {e}")
            return f"Error extracting text: {str(e)}"

ocr_engine = OCREngine()
