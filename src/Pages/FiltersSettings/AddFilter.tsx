import type { FC } from 'react';
import axios from '../../axios';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
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


  const wrapperBox = {
    // bgcolor: 'grey',
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };

  // const itemInSectionBox = {
  //   mb: 3,
  // };


  return (
    <>
      <NavMenu />

      <Box sx={wrapperBox}>

      <Box sx={sectionBox}>
        <Button
        //   variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/filters-page')}
        >
          back
        </Button>
        </Box>
      

      
        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4">
            Add new filter:{' '}
          </Typography>
        </Box>
      

      
        <Box sx={sectionBox}>
          
          
            <Card>
              <CardContent>
                
                  <TextField
                    // key={item.id}
                    fullWidth
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
                

                
                  <TextField
                  fullWidth
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

                  <TextField
                  fullWidth
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
              </CardContent>
            </Card>
          
        </Box>
     

        <Box component="section" sx={sectionBox}>
          <Button variant="contained" onClick={saveBtnHandler} color="success" sx={{width:200}}>
            Add filter to app
          </Button>
        </Box>


      </Box>

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
