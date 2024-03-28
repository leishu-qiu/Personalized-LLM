# config.py
import os

def get_api_key():
    api_key = input("Please enter your OpenAI API key: ")
    # Set the API key as an environment variable
    os.environ["OPENAI_API_KEY"] = api_key
    # Optionally, check that the environment variable was set correctly
    print("OPENAI_API_KEY has been set!")