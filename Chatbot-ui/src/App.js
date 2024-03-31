import React, {useState} from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const handleSend = () => {
    if (!userInput.trim()) return;
    setMessages([...messages, {text: userInput, sender: 'user'}]);
    setUserInput('');

    // Here you would typically send the userInput to your chatbot backend
    // and receive a response. For simplicity, we're just echoing the user input.
    const botResponse = {text: `Echo: ${userInput}`, sender: 'bot'};
    setMessages((prevMessages) => [...prevMessages, botResponse]);
  };

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <h2>Chatbot UI</h2>
      </header>
      <div className='chat-window'>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className='input-area'>
        <input
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          type='text'
          placeholder='Type a message...'
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;
