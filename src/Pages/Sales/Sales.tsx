import type { FC } from 'react';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// import { useNavigate } from 'react-router-dom';

export const Sales: FC = () => {
  //   const navigate = useNavigate();

  //   function signInHandler() {
  //     navigate('/goods-page');
  //   }

  const apiUrl = import.meta.env.VITE_API_URL;

    console.log('env=', apiUrl)

  return (
    <>
      <NavMenu />

      <Container maxWidth="sm">
        <Box
          component="section"
          sx={{ p: 2, m: 10, border: '1px dashed grey' }}
        >
          <h1>Sales</h1>
        </Box>
      </Container>
    </>
  );
};
