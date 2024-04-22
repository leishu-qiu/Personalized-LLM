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
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  FormGroup,
  ListItemText,
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
  const [sources, setSources] = useState([]); // All uploaded sources
  const [useSelectiveFilter, setUseSelectiveFilter] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  // useEffect(() => {
  //   // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //   const fetchSources = async () => {
  //     const response = await fetch('http://localhost:3000/sources');
  //     const data = await response.json();
  //     setSources(data.sources);
  //   };

  //   fetchSources();
  // }, []); // Empty dependency array means this runs once on mount
  const fetchSources = async () => {
    try {
      const response = await fetch('http://localhost:3000/sources');
      const data = await response.json();
      setSources(data.sources);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(scrollToBottom, [messages]);
  const handleSubmitSources = async () => {
    if (useSelectiveFilter && selectedFiles.length > 0) {
      const response = await fetch('http://localhost:3000/selective', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({selectedSources: selectedFiles}),
      });
      const data = await response.json();
      alert(data.message);
    } else {
      alert('No files selected or selective filter is not enabled.');
    }
  };

  const handleToggleSelectiveFilter = async (event) => {
    const checked = event.target.checked;
    setUseSelectiveFilter(checked);

    if (!checked) {
      // Checkbox is unchecked, call the backend to disable selective filtering
      try {
        const response = await fetch('http://localhost:3000/selective_off', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
        });
        const data = await response.json();
        alert(data.message); // Optionally, handle this with a more integrated UI feedback system

        // You might want to also clear the selected files in the state
        setSelectedFiles([]);
      } catch (error) {
        console.error('Failed to disable selective filtering:', error);
        // Handle errors, perhaps setting state to show an error message
      }
    }
  };

  const handleFileUploadSuccess = (message) => {
    handleCloseModal(); // Close the modal first
    const botMessage = {text: message, isBot: true};
    setMessages((currentMessages) => [...currentMessages, botMessage]); // Add success message to chat
    fetchSources();
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
    const botMessage = {
      text: data.answer,
      references: data.references || [],
      isBot: true,
      showReferences: false,
    };
    setMessages((currentMessages) => [...currentMessages, botMessage]);
  };
  const toggleReferences = (index) => {
    setMessages((currentMessages) =>
      currentMessages.map((msg, msgIndex) => {
        if (msgIndex === index) {
          return {...msg, showReferences: !msg.showReferences}; // Toggle the showReferences property
        }
        return msg;
      }),
    );
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
                {message.isBot &&
                  message.references &&
                  message.references.length > 0 && (
                    <div>
                      <button onClick={() => toggleReferences(index)}>
                        {message.showReferences
                          ? 'Hide References'
                          : 'Show References'}
                      </button>
                      {message.showReferences && (
                        <ul>
                          {message.references.map((ref, refIndex) => (
                            <li key={refIndex}>{ref}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
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
        {/* Toggle and Selective Filtering UI */}
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={useSelectiveFilter}
                onChange={handleToggleSelectiveFilter}
              />
            }
            label='Enable Selective Filtering'
          />
          {useSelectiveFilter && (
            <FormControl fullWidth>
              <InputLabel id='demo-multiple-checkbox-label'>
                Select Files
              </InputLabel>
              <Select
                labelId='demo-multiple-checkbox-label'
                multiple
                value={selectedFiles}
                onChange={(event) => setSelectedFiles(event.target.value)}
                renderValue={(selected) => selected.join(', ')}
              >
                {sources.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={selectedFiles.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
              <Button
                onClick={handleSubmitSources}
                variant='contained'
                sx={{mt: 2}}
              >
                Submit Selection
              </Button>
            </FormControl>
          )}
        </FormGroup>
        {/* Other UI components and modal as previously defined */}
      </Box>
    </Box>
  );
}

export default ChatInterface;
