import type { FC } from 'react';
import axios from '../../axios';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Snackbar from '@mui/material/Snackbar';

export const AddFilter: FC = () => {
  const navigate = useNavigate();

  const initialType = {
    name_de: '',
    name_en: '',
    name_ru: '',
  };


  const [openModal, setOpenModal] = useState(false);
  const [typeForRender, setTypeForRender] = useState(initialType);
  const [alertShow, setAlertShow] = useState(false);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    //   border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  //@ts-ignore
  function inputHandler(e) {
    const { name, value } = e.target;

    setTypeForRender((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function saveBtnHandler() {
    setOpenModal(true);
    console.log(typeForRender);
  }

  async function modalYesBtnHandler() {
    //FIXME: добавить лоадер,чтобы обновились данные перед закрытием модалки

    try {
      const response = await axios.post('/admin_add_new_type', {
        array: typeForRender,
      });

      console.log(response.data);
      setTypeForRender(initialType);
      setOpenModal(false);
      setAlertShow(true);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      // setShowLoader(false);
      // setWolfButtonActive(true);
    }
  }

  function modalNoBtnHandler() {
    
    setOpenModal(false);
  }

  return (
    <>
      <NavMenu />

      <ListItem>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/filters-page')}
        >
          back
        </Button>
      </ListItem>

      <ListItem>
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Add new filter:{' '}
          </Typography>
        </Box>
      </ListItem>

      <ListItem>
        <Box component="section">
          <Stack direction="column" spacing={5}>
            <Card>
              <CardContent>
                <Box>
                  <TextField
                    // key={item.id}
                    name="name_de"
                    // id={item.id}
                    onChange={(e) => inputHandler(e)}
                    value={typeForRender.name_de}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">DE:</InputAdornment>
                        ),
                      },
                    }}
                    variant="standard"
                  />
                </Box>

                <Box>
                  <TextField
                    // key={item.id}
                    name="name_en"
                    // id={item.id}
                    onChange={(e) => inputHandler(e)}
                    value={typeForRender.name_en}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">EN:</InputAdornment>
                        ),
                      },
                    }}
                    variant="standard"
                  />
                </Box>

                <Box>
                  <TextField
                    // key={item.id}
                    name="name_ru"
                    // id={item.id}
                    onChange={(e) => inputHandler(e)}
                    value={typeForRender.name_ru}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">RU:</InputAdornment>
                        ),
                      },
                    }}
                    variant="standard"
                  />
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </ListItem>

      <ListItem>
        <Box component="section" sx={{ mt: 3 }}>
          <Button variant="contained" onClick={saveBtnHandler} color="success">
            Add filter to app
          </Button>
        </Box>
      </ListItem>

      <div>
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Are you sure you want to add new type for filter?
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={modalYesBtnHandler}
                color="success"
                sx={{ mr: 2 }}
              >
                Yes, add
              </Button>
              <Button
                variant="contained"
                onClick={modalNoBtnHandler}
                color="error"
              >
                No, close me
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>

      <Snackbar
        open={alertShow}
        autoHideDuration={3000}
        onClose={() => setAlertShow(false)}
      >
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          New type have been added
        </Alert>
      </Snackbar>
    </>
  );
};
