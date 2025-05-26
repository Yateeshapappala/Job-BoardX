import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';

interface ApplyModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (payload: { resumeLink: string; coverLetter: string; jobId: string }) => Promise<boolean>;
  jobId: string;
}

const StyledBox = styled(Box)`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  margin: auto;
  margin-top: 10%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ApplyModal: React.FC<ApplyModalProps> = ({ open, handleClose, onSubmit, jobId }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeLink, setResumeLink] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState('');

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async () => {
    setError('');

    let finalResumeLink = resumeLink.trim();

    // Validate resumeLink if entered
    if (finalResumeLink && !isValidUrl(finalResumeLink)) {
      setError('Please enter a valid resume URL.');
      return;
    }

    // Upload resume file if selected
    if (resumeFile) {
      try {
        const formData = new FormData();
        formData.append('resume', resumeFile);

        const res = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        finalResumeLink = res.data.resumeUrl;
      } catch (err) {
        console.error('Resume upload failed', err);
        setError('Resume upload failed. Try again.');
        return;
      }
    }

    if (!finalResumeLink) {
      setError('Please upload a resume or provide a resume link.');
      return;
    }

    if (coverLetter.length > 2000) {
      setError('Cover letter cannot exceed 2000 characters.');
      return;
    }

    const payload = {
      resumeLink: finalResumeLink,
      coverLetter,
      jobId,
    };

    const success = await onSubmit(payload);
    if (success) {
      setSnackbarOpen(true);
      setResumeFile(null);
      setResumeLink('');
      setCoverLetter('');
      handleClose();
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <StyledBox>
          <Typography variant="h6">Apply for Job</Typography>

          <TextField
            label="Paste Resume Link (optional)"
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
            fullWidth
          />

          <Typography align="center">or</Typography>

          <Button variant="outlined" component="label">
            Upload Resume (PDF only)
            <input
              type="file"
              accept=".pdf"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
              }}
            />
          </Button>
          {resumeFile && <Typography variant="body2">{resumeFile.name}</Typography>}

          <TextField
            label="Cover Letter (max 2000 characters)"
            value={coverLetter}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 2000) setCoverLetter(val);
            }}
            multiline
            rows={6}
            fullWidth
            helperText={`${coverLetter.length} / 2000 characters`}
          />

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Button variant="contained" onClick={handleSubmit}>
            Submit Application
          </Button>
        </StyledBox>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Application submitted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ApplyModal;
