# Backend/data_loader.py
import requests
from urllib.parse import urlparse
from PyPDF2 import PdfReader
import textract  # You might choose this for more complex PDFs or if PyPDF2 doesn't meet your needs

class DataLoader:
    def load_from_pdf(self, pdf_path):
        """Extracts text from a PDF file."""
        text = ''
        try:
            with open(pdf_path, 'rb') as file:
                pdf = PdfReader(file)
                for page in pdf.pages:
                    text += page.extract_text() + ' '  # Concatenate text from each page
        except Exception as e:
            print(f"Error reading PDF file: {e}")
        return text

    def load_from_url(self, url):
        """Fetches and possibly scrapes content from a URL."""
        content = ''
        try:
            response = requests.get(url)
            if response.status_code == 200:
                content = response.text  # This might need further processing to extract useful text
            else:
                print(f"Failed to retrieve content from {url}")
        except Exception as e:
            print(f"Error fetching URL content: {e}")
        return content

    # Add any necessary preprocessing functions here
    def preprocess_data(self, data):
        """Preprocesses the loaded data."""
        # Implement preprocessing steps as needed
        return data.strip()
