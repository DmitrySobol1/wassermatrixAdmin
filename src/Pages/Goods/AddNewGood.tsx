import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';

import NavMenu from '../../components/NavMenu/NavMenu';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

// import { useNavigate } from 'react-router-dom';

export const AddNewGood: FC = () => {
    const navigate = useNavigate();
  

  const [allInputDatas, setAllInputDatas] = useState({
    article: '',
    name_de: '',
    name_en: '',
    name_ru: '',
    description_short_de: '',
    description_short_en: '',
    description_short_ru: '',
    description_long_de: '',
    description_long_en: '',
    description_long_ru: '',
    price_eu: '',
    type: '',
  });
  const [type, setType] = useState('');
  //   const [file, setFile] = useState(null);

  const [arrayTypesForRender, setArrayTypesForRender] = useState([]);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [openModal, setOpenModal] = useState(false);

  // получить список типов товаров
  useEffect(() => {
    const language = 'en';

    const fetchGoodsTypesInfo = async () => {
      try {
        const types = await axios.get('/user_get_goodsstype');

        //@ts-ignore
        const arrayTemp = types.data.map((item) => ({
          name: item[`name_${language}`],
          id: item._id,
        }));

        //@ts-ignore
        setArrayTypesForRender(arrayTemp);
        console.log('formattedTypes', arrayTemp);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchGoodsTypesInfo();
  }, []);

  //@ts-ignore
  const handleAllInput = (e) => {
    console.log(e.target.name, '=', e.target.value);
    setAllInputDatas({ ...allInputDatas, [e.target.name]: e.target.value });
  };

  const typeHandler = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  async function saveBtnHandler() {
    //  if (!file) {
    //       setError('Please select a file');
    //       return;
    //     }

    const data = new FormData();
    data.append('article', allInputDatas.article);
    data.append('name_de', allInputDatas.name_de);
    data.append('name_en', allInputDatas.name_en);
    data.append('name_ru', allInputDatas.name_ru);
    data.append('description_short_de', allInputDatas.description_short_de);
    data.append('description_short_en', allInputDatas.description_short_en);
    data.append('description_short_ru', allInputDatas.description_short_ru);
    data.append('description_long_de', allInputDatas.description_long_de);
    data.append('description_long_en', allInputDatas.description_long_en);
    data.append('description_long_ru', allInputDatas.description_long_ru);
    data.append('price_eu', allInputDatas.price_eu);
    data.append('type', type);
    //@ts-ignore
    data.append('file', selectedFile);

    try {
      const response = await axios.post('/admin_add_new_good', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[Frontend] Upload successful:', response.data);
      //   alert('File uploaded successfully!');

      setOpenModal(true);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      console.log('finally');
    }
  }

  //@ts-ignore
  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем, что это изображение
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Для ограничения размера файла (например, 5MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`File too large (max ${MAX_SIZE_MB}MB)`);
      return;
    }

    setSelectedFile(file);

    // Создаем превью
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

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

  function modalOkBtnHandler() {
    setOpenModal(false);

    allInputDatas.article = '';
    allInputDatas.name_de = '';
    allInputDatas.name_en = '';
    allInputDatas.name_ru = '';
    allInputDatas.description_short_de = '';
    allInputDatas.description_short_en = '';
    allInputDatas.description_short_ru = '';
    allInputDatas.description_long_de = '';
    allInputDatas.description_long_en = '';
    allInputDatas.description_long_ru = '';
    allInputDatas.price_eu = '';
    allInputDatas.type = '';
    setType('')
    setPreviewImage(null);
    setSelectedFile(null);
  }

  return (
    <>
      <NavMenu />
      <Box
        component="form"
        sx={{ '& > :not(style)': { m: 1, } }}
        noValidate
        autoComplete="off"
      >
        <List>

            <ListItem>
                <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={()=>navigate('/goods-page')}>
                    back
              </Button>

            </ListItem>

<ListItem>
            <Typography variant="h4" gutterBottom>
        Add new good
      </Typography>
      </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Article"
              name="article"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.article}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Name de"
              name="name_de"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.name_de}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Name en"
              name="name_en"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.name_en}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Name ru"
              name="name_ru"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.name_ru}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Short Description De"
              name="description_short_de"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.description_short_de}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Short Description En"
              name="description_short_en"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.description_short_en}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Short Description Ru"
              name="description_short_ru"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.description_short_ru}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Long Description De"
              name="description_long_de"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.description_long_de}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Long Description En"
              name="description_long_en"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.description_long_en}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
              label="Long Description Ru"
              name="description_long_ru"
              variant="standard"
              required
              onChange={handleAllInput}
              value={allInputDatas.description_long_ru}
            />
          </ListItem>

          <ListItem>
            <FormControl fullWidth variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">
                Price eu
              </InputLabel>
              <Input
                id="standard-adornment-amount"
                name="price_eu"
                required
                onChange={handleAllInput}
                value={allInputDatas.price_eu}
                startAdornment={
                  <InputAdornment position="start">€</InputAdornment>
                }
              />
            </FormControl>
          </ListItem>

          <ListItem>
            <FormControl variant="standard" sx={{ minWidth: 180 }}>
              <InputLabel id="demo-simple-select-standard-label">
                Type
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={type}
                onChange={typeHandler}
                label="Type"
              >
                {arrayTypesForRender.map((item: any) => (
                  <MenuItem value={item.id}>{item.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
        </List>
      </Box>

      <ListItem>
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          disabled={!!previewImage}
        >
          Upload Image
          <VisuallyHiddenInput
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </Button>
      </ListItem>
      <ListItem>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {previewImage && (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                border: '1px dashed #ccc',
                borderRadius: '4px',
                padding: 1,
              }}
            >
              <IconButton
                aria-label="remove image"
                onClick={clearImage}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                <CancelIcon color="error" />
              </IconButton>

              <img
                src={previewImage}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />

              {selectedFile && (
                <Box
                  sx={{
                    mt: 1,
                    fontSize: '0.8rem',
                    color: '#666',
                    textAlign: 'center',
                  }}
                >
                  {selectedFile.name} • {(selectedFile.size / 1024).toFixed(1)}{' '}
                  KB
                </Box>
              )}
            </Box>
          )}
        </Box>
      </ListItem>

      <ListItem>
        <Box component="section" sx={{ m: 1 }}>
          <Button variant="contained" onClick={saveBtnHandler} color="success">
            Save good
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
              New good have been added
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={modalOkBtnHandler}>
                Ok
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </>
  );
};
