import React, {useState, useEffect, useRef} from 'react';
import ChatMessage from './ChatMessage';
import {FaFile} from 'react-icons/fa';

function ChatInterface({onBack}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!inputText.trim()) return; // Prevent sending empty messages
    const userMessage = {text: inputText, isBot: false};
    const body = {
      query: inputText,
    };
    setMessages([...messages, userMessage]);
    setInputText('');
    const response = await fetch('http://localhost:3000/query', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });
    const data = await response.json();
    const botMessage = {text: data.answer, isBot: true};
    setMessages((currentMessages) => [...currentMessages, botMessage]);
  };

  return (
    <div className='chat-container'>
      <header className='chat-header'>ChatSmart</header>
      <div className='chat-messages'>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className='chat-input' onSubmit={handleSendMessage}>
        <button type='button' onClick={onBack} className='file-button'>
          <FaFile />
        </button>
        <input
          type='text'
          placeholder='Ask about your uploaded file/url and press enter ...'
          value={inputText}
          className='chat-text-input'
          onChange={(e) => setInputText(e.target.value)}
        />
      </form>
    </div>
  );
}

export default ChatInterface;
