import React, {useState} from 'react';
import UrlInput from './components/UrlInput';
import ChatInterface from './components/ChatInterface';

function App() {
  const [showChat, setShowChat] = useState(false); // Add state to control UI transition
  const handleUrlSubmitted = () => {
    setShowChat(true); // Transition to the ChatInterface
    console.log('show chat on');
  };

  const handleBackToUrlInput = () => {
    setShowChat(false); // Allow going back to UrlInput
    console.log('show url input again');
  };

  return (
    <div className='App'>
      {!showChat ? (
        <UrlInput onSubmit={handleUrlSubmitted} />
      ) : (
        <ChatInterface onBack={handleBackToUrlInput} />
      )}
    </div>
  );
}

export default App;
