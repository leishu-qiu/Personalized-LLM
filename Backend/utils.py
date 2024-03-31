import os

def is_pdf_by_extension(file_path):
    _, file_extension = os.path.splitext(file_path)
    return file_extension.lower() == '.pdf'