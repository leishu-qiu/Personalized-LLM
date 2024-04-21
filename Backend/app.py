import os
from langchain_community.document_loaders import TextLoader
from langchain.memory import ConversationBufferMemory
from werkzeug.utils import secure_filename

from langchain.chains import ConversationalRetrievalChain
from langchain_openai import ChatOpenAI
from flask import Flask, render_template, request, jsonify,session
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from flask_cors import CORS


app = Flask(__name__)
CORS(app) 
app.secret_key = '123456'  


# LangChain Chat Model setup
os.environ["OPENAI_API_KEY"] = ""
os.environ['PINECONE_API_KEY'] = ""

llm = ChatOpenAI(
    openai_api_key=os.environ.get("OPENAI_API_KEY"),
    model='gpt-3.5-turbo'
)

# Embedding model
embed_model = OpenAIEmbeddings(model="text-embedding-ada-002")

#update
index_name = "test"
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embed_model)

memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True,output_key='answer')
conversation_chain = ConversationalRetrievalChain.from_llm(
    return_source_documents = True,
    llm=llm,
    chain_type="stuff",
    retriever= vectorstore.as_retriever(search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.9}),
    memory=memory
)

# Allowed extension check
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/query', methods=['POST'])
def handle_query():
    user_input = request.form.get('query', '')
    # print(session.get('selected_sources'))
    # print(session.get('use_filter'))
    use_filter = session.get('use_filter')
    # print(use_filter)
    if use_filter:
        answer = chat_with_filter(user_input) if user_input else 'No query provided.'
    else:
        answer = chat(user_input) 
    return jsonify({'answer': answer})

@app.route('/selective', methods=['POST'])
def handle_selective_sources():
    selected_sources = request.get_json().get('selectedSources')
    session['use_filter'] = True
    session['selected_sources'] = selected_sources    
    return jsonify({'message': 'Sources set successfully'})

@app.route('/selective_off', methods=['POST'])
def disable_filtering():
    # Clear specific session variables
    if 'selected_sources' in session:
        del session['selected_sources']
    # Alternatively, disable filtering without deleting variables
    session['use_filter'] = False
    
    return jsonify({'message': 'Selective filtering disabled'})

# @app.route('/selective_delete', methods=['POST'])
# def handle_selective_deletion():
#     selected_sources = request.get_json().get('selectedSources',[])
#     if not selected_sources:
#         return jsonify({'message': 'No sources provided for deletion'}), 400
#     filters= {'source': {'$in': selected_sources}}
#     try:
#         # Call the delete method with the filter
#         vectorstore.delete(filter=filters)
#         return jsonify({'message': 'Requested sources have been deleted'}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def handle_upload():
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join('./', filename)
            file.save(file_path)
            update_document_store(file_path)
            return jsonify({'message': 'File uploaded and processed successfully.'})
    return jsonify({'message': 'Invalid file or no file uploaded.'})

@app.route('/url', methods=['POST'])
def scrape_url():
    # This method expects a JSON payload with a URL
    if not request.json or 'url' not in request.json:
        return jsonify({'message': 'No URL provided'}), 400

    url = request.json['url']
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        # text = soup.get_text()
        text = soup.get_text(strip=True)
        chunks = chunk_text(text)
        #update
        domain_name = get_domain(url)
        metadatas = [{'source': domain_name} for _ in chunks]
        vectorstore.add_texts(chunks, metadatas)
        # Optionally, process the text or return a portion of it
        return jsonify({'content': text[:500]})  # Return first 500 characters of the text
    except requests.RequestException as e:
        return jsonify({'message': 'Failed to retrieve the URL', 'error': str(e)})


def get_domain(url):
    """ Extract the domain name from a URL. """
    parsed_uri = urlparse(url)
    full_path = f'{parsed_uri.netloc}{parsed_uri.path}'
    return full_path.rstrip('/') 

def chunk_text(text, chunk_size=1000):
    # Split the text by sentences to avoid breaking in the middle of a sentence
    sentences = text.split('. ')
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= chunk_size:
            current_chunk += sentence + '. '
        else:
            # If the chunk reaches the desired size, add it to the chunks list
            chunks.append(current_chunk)
            current_chunk = sentence + '. '
    # Add the last chunk if it's not empty
    #TODO: overlap!
    if current_chunk:
        chunks.append(current_chunk)
    return chunks

def update_document_store(file_path):
    loader = TextLoader(file_path=file_path, encoding="utf-8")
    data = loader.load()
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(data)
    #update
    vectorstore.add_documents(chunks)


def chat(query):
    result = conversation_chain({"question": query})
    # print(result["source_documents"])
    print("chat without filter")
    answer = result["answer"]
    return answer

def chat_with_filter(query):
    selected_sources = session.get('selected_sources',[])
    filters = {"source": {"$in": selected_sources}}
    print(filters)
    conversation_chain = ConversationalRetrievalChain.from_llm(
        return_source_documents = True,
        llm=llm,
        chain_type="stuff",
        retriever= vectorstore.as_retriever(search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.9, "filter":filters}),
        memory=memory
    )   
    result = conversation_chain({"question": query})
    answer = result["answer"]
    return answer

if __name__ == '__main__':
    app.run(port = 3000, debug=True)