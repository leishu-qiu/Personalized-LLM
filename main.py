from Backend.config import get_api_key
from Backend.data_loader import DataLoader

# Assuming you have a text file 'data.txt' in the same directory as your main.py
file_path = 'path/to/your/data.txt'
data_loader = DataLoader(file_path)
data = data_loader.load_data()
preprocessed_data = data_loader.preprocess_data(data)

get_api_key()