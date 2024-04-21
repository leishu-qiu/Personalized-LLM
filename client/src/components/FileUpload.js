import React, {useState} from 'react';
import {
  Button,
  TextField,
  CircularProgress,
  Typography,
  Stack,
  Container,
  Box,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {Snackbar, Alert} from '@mui/material';

function FileUpload({onSubmit}) {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUrl(''); // Clear URL when file is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let apiUrl = 'http://localhost:3000/upload';
    let headers = {};
    let body = null;

    if (file) {
      // If file is uploaded, prepare FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      body = formData;
    } else {
      // If URL is entered, prepare JSON body for URL post
      apiUrl = 'http://localhost:3000/url';
      headers = {'Content-Type': 'application/json'};
      body = JSON.stringify({url: url});
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      const data = await response.json();
      if (response.ok) {
        let feedback = file
          ? 'Your file is successfully processed.'
          : 'Your URL is successfully processed.';
        setResponseMessage(data.message);
        onSubmit(feedback);
      } else {
        setResponseMessage(
          'Error: ' + (data.message || 'Something went wrong.'),
        );
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('Error: Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component='main' maxWidth='sm' sx={{mt: 4}}>
      <Paper elevation={3} sx={{p: 4}}>
        <Typography variant='h5' gutterBottom>
          Upload File or Enter URL
        </Typography>
        <Box sx={{my: 2}}>
          <Button
            variant='outlined'
            component='label'
            fullWidth
            startIcon={<CloudUploadIcon />}
            sx={{mb: 2}}
          >
            Upload File
            <input type='file' hidden onChange={handleFileChange} />
          </Button>
          {file && <Typography gutterBottom>File: {file.name}</Typography>}
          <TextField
            label='or Enter a URL'
            type='text'
            variant='outlined'
            value={url}
            onChange={(e) => {
              setFile(null);
              setUrl(e.target.value);
            }}
            fullWidth
            sx={{mb: 2}}
          />
          <Button
            onClick={handleSubmit}
            variant='contained'
            color='primary'
            fullWidth
            disabled={loading || (!file && !url)}
            startIcon={
              loading ? <CircularProgress size={24} /> : <CloudUploadIcon />
            }
          >
            {loading ? 'Processing...' : 'Submit'}
          </Button>
        </Box>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={
              responseMessage.startsWith('Error:') ? 'error' : 'success'
            }
            sx={{width: '100%'}}
          >
            {responseMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default FileUpload;
