import React, { useEffect, useState } from 'react';
import axios from '../services/axiosInstance';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Interviewer {
  name: string;
  email: string;
  role: string;
}

const Interviewers: React.FC = () => {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      const res = await axios.get('/api/interviewers');
      setInterviewers(res.data);
    } catch (error) {
      console.error('Failed to fetch interviewers', error);
      alert('Could not load interviewers');
    }
  };

  const handleAdd = async () => {
    if (!name || !email || !role) {
      return alert('Please fill all fields');
    }

    const emailLower = email.toLowerCase();
    const exists = interviewers.some(i => i.email.toLowerCase() === emailLower);
    if (exists) {
      return alert('Interviewer with this email already exists');
    }

    try {
      await axios.post('/api/interviewers', {
        name,
        email: emailLower,
        role,
      });
      setName('');
      setEmail('');
      setRole('');
      fetchInterviewers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to add interviewer';
      alert(msg);
      console.error('Failed to add interviewer:', msg);
    }
  };

  const handleDelete = async (emailToDelete: string) => {
    try {
      await axios.delete(`/api/interviewers/${encodeURIComponent(emailToDelete)}`);
      fetchInterviewers();
    } catch (error) {
      console.error('Failed to delete interviewer', error);
      alert('Failed to delete interviewer');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Manage Interviewers
      </Typography>
      <Stack spacing={2} mb={4}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleAdd}>
          Add Interviewer
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Interviewers List
      </Typography>
      <List>
        {interviewers.map((i) => (
          <ListItem
            key={i.email}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDelete(i.email)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={`${i.name} (${i.role})`} secondary={i.email} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Interviewers;
