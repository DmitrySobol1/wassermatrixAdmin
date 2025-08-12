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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Snackbar from '@mui/material/Snackbar';

export const AddCountry: FC = () => {
  const navigate = useNavigate();

  const initialCountry = {
    name_de: '',
    name_en: '',
    name_ru: '',
    isEU: false,
  };

  const [openModal, setOpenModal] = useState(false);
  const [countryForRender, setCountryForRender] = useState(initialCountry);
  const [alertShow, setAlertShow] = useState(false);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  //@ts-ignore
  function inputHandler(e) {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    setCountryForRender((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  }

  function saveBtnHandler() {
    setOpenModal(true);
    console.log(countryForRender);
  }

  async function modalYesBtnHandler() {
    try {
      const response = await axios.post('/admin_add_new_country', {
        array: countryForRender,
      });

      console.log(response.data);
      setCountryForRender(initialCountry);
      setOpenModal(false);
      setAlertShow(true);
    } catch (error) {
      console.error('H81:0 ?@8 2K?>;=5=88 70?@>A0:', error);
    }
  }

  function modalNoBtnHandler() {
    setOpenModal(false);
  }

  const wrapperBox = {
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };

  return (
    <>
      <NavMenu />

      <Box sx={wrapperBox}>
        <Box sx={sectionBox}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/countries-page')}
          >
            back
          </Button>
        </Box>

        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4">
            Add new country:
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Card>
            <CardContent>
              <TextField
                fullWidth
                name="name_de"
                onChange={(e) => inputHandler(e)}
                value={countryForRender.name_de}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">DE:</InputAdornment>
                    ),
                  },
                }}
                variant="standard"
                placeholder="Deutschland name"
              />

              <TextField
                fullWidth
                name="name_en"
                onChange={(e) => inputHandler(e)}
                value={countryForRender.name_en}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">EN:</InputAdornment>
                    ),
                  },
                }}
                variant="standard"
                placeholder="English name"
              />

              <TextField
                fullWidth
                name="name_ru"
                onChange={(e) => inputHandler(e)}
                value={countryForRender.name_ru}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">RU:</InputAdornment>
                    ),
                  },
                }}
                variant="standard"
                placeholder="Russian name"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={countryForRender.isEU}
                    onChange={(e) => inputHandler(e)}
                    name="isEU"
                  />
                }
                label="EU Country"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box component="section" sx={sectionBox}>
          <Button 
            variant="contained" 
            onClick={saveBtnHandler} 
            color="success" 
            sx={{ width: 200 }}
          >
            Add country to app
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
              Are you sure you want to add new country for delivery?
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
          New country has been added
        </Alert>
      </Snackbar>
    </>
  );
};