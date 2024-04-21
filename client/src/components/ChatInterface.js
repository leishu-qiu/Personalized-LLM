import React, {useState, useEffect, useRef} from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  List,
  ListItem,
  Paper,
  Modal,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileUpload from './FileUpload'; // Make sure FileUpload is imported

function ChatInterface({onBack}) {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your personal assistant chatbot, powered by advanced retrieval-augmented generation technology. You can upload a file or enter a URL, and then ask me questions about the content. How may I help you today? Feel free to type your questions below or use the file upload button to get started!",
      isBot: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(scrollToBottom, [messages]);

  const handleFileUploadSuccess = (message) => {
    handleCloseModal(); // Close the modal first
    const botMessage = {text: message, isBot: true};
    setMessages((currentMessages) => [...currentMessages, botMessage]); // Add success message to chat
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!inputText.trim()) return;
    const userMessage = {text: inputText, isBot: false};
    const body = {query: inputText};
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

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby='file-upload-modal'
        aria-describedby='file-upload-modal-description'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            aria-label='close'
            onClick={handleCloseModal}
            sx={{position: 'absolute', right: 8, top: 8}}
          >
            <CloseIcon />
          </IconButton>
          <FileUpload onSubmit={handleFileUploadSuccess} />{' '}
          {/* Pass the new handler */}
        </Box>
      </Modal>

      <Paper
        component='div'
        sx={{
          width: '80%',
          flexGrow: 1,
          overflowY: 'auto',
          mb: 2,
          position: 'relative',
          maxHeight: 'calc(100vh - 120px)',
        }}
      >
        <List>
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: message.isBot ? 'flex-start' : 'flex-end',
                textAlign: message.isBot ? 'left' : 'right',
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.isBot ? 'flex-start' : 'flex-end',
                borderRadius: '20px',
              }}
            >
              <Box
                bgcolor={message.isBot ? '#f5f5f5' : '#e6f2ff'}
                p={1}
                my={1}
                borderRadius={3.5}
              >
                {message.text}
              </Box>
            </ListItem>
          ))}
        </List>
        <Box ref={messagesEndRef} />
      </Paper>
      <Box
        component='form'
        onSubmit={handleSendMessage}
        sx={{width: '90%', maxWidth: '1020px'}}
      >
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Ask a question...'
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <IconButton edge='start' onClick={handleOpenModal}>
                  <AttachFileIcon />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton edge='end' type='submit'>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}

export default ChatInterface;
