import os
from langchain_community.document_loaders import TextLoader
from langchain.memory import ConversationBufferMemory
from werkzeug.utils import secure_filename

from langchain.chains import ConversationalRetrievalChain
from langchain_openai import ChatOpenAI
from flask import Flask, render_template, request, jsonify,g
from pinecone import Pinecone
from pinecone import ServerlessSpec
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
import requests
from bs4 import BeautifulSoup


app = Flask(__name__)


# LangChain Chat Model setup
os.environ["OPENAI_API_KEY"] = "HIDDEN"
os.environ['PINECONE_API_KEY'] = "HIDDEN"

llm = ChatOpenAI(
    openai_api_key=os.environ.get("OPENAI_API_KEY"),
    model='gpt-3.5-turbo'
)

# Embedding model
embed_model = OpenAIEmbeddings(model="text-embedding-ada-002")

#update
index_name = "test-new"
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embed_model)

memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
conversation_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    chain_type="stuff",
    retriever= vectorstore.as_retriever(),
    memory=memory
)

# Allowed extension check
ALLOWED_EXTENSIONS = {'txt'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/query', methods=['POST'])
def handle_query():
    user_input = request.form.get('query', '')
    answer = chat(user_input) if user_input else 'No query provided.'
    return jsonify({'answer': answer})

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



def update_document_store(file_path):
    loader = TextLoader(file_path=file_path, encoding="utf-8")
    data = loader.load()
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(data)
    #update
    vectorstore.add_documents(chunks)

# def setup_conversation_chain():
#     # Assume documents are already loaded and indexed at startup
#     # docsearch = PineconeVectorStore(index_name="test-rag")
#     memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
#     conversation_chain = ConversationalRetrievalChain.from_llm(
#         llm=llm,
#         chain_type="stuff",
#         retriever= vectorstore.as_retriever(),
#         memory=memory
#     )
#     return conversation_chain

def chat(query):
    result = conversation_chain({"question": query})
    answer = result["answer"]
    return answer

# def textExtract():
#     txt_file_path = './static/CSCI2270_Info.txt'
#     loader = TextLoader(file_path=txt_file_path, encoding="utf-8")
#     data = loader.load()
#     text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#     chunks = text_splitter.split_documents(data)


# def buildChain(chunks, index_name):
#     docsearch = PineconeVectorStore.from_documents(chunks, embed_model, index_name=index_name)
#     memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
#     conversation_chain = ConversationalRetrievalChain.from_llm(
#         llm=chat,
#         chain_type="stuff",
#         retriever=docsearch.as_retriever(),
#         memory=memory
#     )
#     return conversation_chain

# def chat(query,conversation_chain):
#     result = conversation_chain({"question": query})
#     answer = result["answer"]
#     return answer

if __name__ == '__main__':
    app.run(port = 8000, debug=True)