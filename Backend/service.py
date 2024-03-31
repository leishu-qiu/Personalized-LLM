# ideal place for the bulk of logic including loading and preprocessing data, and splitting it into chunks.
import openai
import os
from config import get_api_key
from data_loader import DataLoader
from utils import is_pdf_by_extension


# Assuming you have a text file 'data.txt' in the same directory as your main.py
file = '../scalexi.txt'

data_loader = DataLoader(file)
data = data_loader.load_data()
preprocessed_data = data_loader.preprocess_data(data)

# Ensure the API key is set
get_api_key()

with open('scalexi.txt', 'r', encoding='utf-8') as file:
    file_contents = file.read()

txt_file_path = 'scalexi.txt'

# Load the entire content of the file into a single string
with open(txt_file_path, 'r', encoding='utf-8') as file:
    data = file.read()

def split_text_into_chunks(text, chunk_size=1000, chunk_overlap=200):
    chunks = []
    start = 0
    while start + chunk_size <= len(text):
        # Extract a chunk of text
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - chunk_overlap  # Move start, considering the overlap
    
    # Add the last chunk if there's remaining text that wasn't included in the chunks
    if start < len(text):
        chunks.append(text[start:])
    
    return chunks

# Use the function to split the data into chunks
data_chunks = split_text_into_chunks(data, chunk_size=1000, chunk_overlap=200)

embeddings = OpenAIEmbeddings()