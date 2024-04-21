import React, {useState} from 'react';
import ChatInterface from './components/ChatInterface';
import FileUpload from './components/FileUpload';

function App() {
  const [showFileUpload, setShowFileUpload] = useState(false); // Control display of FileUpload

  const handleFileSubmitted = () => {
    setShowFileUpload(false); // Hide FileUpload after submission
  };

  const handleBackToChat = () => {
    setShowFileUpload(false); // Return to ChatInterface from FileUpload
  };

  const handleShowFileUpload = () => {
    setShowFileUpload(true); // Show FileUpload when file button clicked
  };

  return (
    <div className='App'>
      {!showFileUpload ? (
        <ChatInterface onFileButtonClick={handleShowFileUpload} />
      ) : (
        <FileUpload onSubmit={handleFileSubmitted} onBack={handleBackToChat} />
      )}
    </div>
  );
}

export default App;
