# Personalized-LLM Chatbot


# Introduction
In recent years, LLM-based chatbots have gained popularity due to their advanced abilities in natural language understanding and generation. Despite their strengths, pre-trained LLMs face limitations such as lack of learning over time and potential generation of irrelevant or fabricated responses when encountering queries beyond their training data. Our project addresses these issues by introducing a Retrieval-Augmented Generation (RAG)-based personalized LLM chatbot. This system allows users to build a personalized knowledge base by incorporating text-based files or URLs as additional data sources. The chatbot uses OpenAI's models for embedding extraction and response generation, and Pinecone for vector database management, ensuring a more personalized and context-aware user experience.


# Features
### Personalized Knowledge Base 
Users can upload various document types (e.g., .pdf, .txt, .docx) and URLs to enhance the chatbot's knowledge base.

### Context-Aware Responses
Utilizes memory buffers to maintain chat history, providing contextually relevant responses.

### Embedding and Retrieval: 
 Text embedding models convert data into numerical representations stored in a vector database managed by Pinecone, facilitating efficient information retrieval.

### Reference Support
The chatbot provides references along with responses, ensuring verifiable and credible information.

### Source Filtering
Users can control which sources the chatbot references, allowing for targeted and relevant responses.



# Resources
### Front-end Development
Built with React framework using JavaScript, HTML5, and CSS3.

### Back-end Development
Implemented with Python using Flask framework. Utilizes OpenAI’s GPT-3.5-turbo for response generation and text-embedding-ada-002 for embedding extraction. Pinecone manages the vector database, and LangChain integrates the components.



# Implementation
Setup:

Clone the repository: git clone https://github.com/your-username/Personalized-LLM.git


Install dependencies:

Windows: pip install -r requirements.txt

Mac OS/Linux: pip3 install -r requirements.txt


Start the Server:

Windows: python app.py

Mac OS/Linux: python3 app.py


Start the Client Side:

npm start
