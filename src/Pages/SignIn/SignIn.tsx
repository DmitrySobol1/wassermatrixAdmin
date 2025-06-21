import type { FC } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// import './App.css';
import Button from '@mui/material/Button';

import { useNavigate } from 'react-router-dom';

export const SignIn: FC = () => {
  const navigate = useNavigate();

  function signInHandler() {
    navigate('/goods-page');
  }

  return (
    <>
  
      <Container maxWidth="sm">
        <Box
          component="section"
          sx={{ p: 2, m: 10, border: '1px dashed grey' }}
        >
           <h1>Wassermatrix</h1>
          <Button variant="contained" onClick={signInHandler}>
            Signin
          </Button>
        </Box>
      </Container>
    </>
  );
};
