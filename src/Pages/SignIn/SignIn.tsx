import type { FC } from 'react';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { useNavigate } from 'react-router-dom';
import axios from '../../axios';

export const SignIn: FC = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!login.trim() || !password.trim()) {
      setError('Please fill in both login and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/admin_login', {
        login: login.trim(),
        password: password.trim()
      });

      if (response.data.status === 'success') {
        navigate('/goods-page');
      } else {
        setError('Invalid login or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Incorrect datas. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <>
      <Container maxWidth="sm">
        <Box
          component="section"
          sx={{ 
            p: 4, 
            m: 10, 
            border: '1px dashed grey',
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant="h4" component="h1" textAlign="center" mb={3}>
            Wassermatrix
          </Typography>
          
          <Typography variant="h6" component="h2" textAlign="center" mb={3}>
            Admin Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Login"
              variant="outlined"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />

            <Button 
              variant="contained" 
              size="large"
              onClick={handleSignIn}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Stack>
        </Box>
      </Container> 
    </>
  );
};
