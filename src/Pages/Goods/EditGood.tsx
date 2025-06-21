import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../axios';

import NavMenu from '../../components/NavMenu/NavMenu';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';

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

export const EditGood: FC = () => {
  const navigate = useNavigate();


  const [type, setType] = useState('');
  const [arrayTypesForRender, setArrayTypesForRender] = useState([]);
//   const [goodInfo, setGoodInfo] = useState({});
  
  const [goodInfo, setGoodInfo] = useState<GoodInfo | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const language = 'en';
  const location = useLocation();
  const { goodId } = location.state || {};

  // получить товар по id и список типов для вып списка
  useEffect(() => {
    const fetchCurrentGood = async () => {
      try {
        const good = await axios.get('/user_get_currentgood', {
          //   @ts-ignore
          params: {
            id: goodId,
          },
        });

        // interface IGoodRender {
        //   name: String;
        //   description_short: String;
        //   description_long: String;
        // }

        console.log('GOOD', good);

        const domen = import.meta.env.VITE_DOMEN;

        const goodToRender = {
          article: good.data.article,
          name_de: good.data.name_de,
          name_en: good.data.name_en,
          name_ru: good.data.name_ru,
          description_short_de: good.data.description_short_de,
          description_short_en: good.data.description_short_en,
          description_short_ru: good.data.description_short_ru,
          description_long_de: good.data.description_long_de,
          description_long_en: good.data.description_long_en,
          description_long_ru: good.data.description_short_ru,
          price_eu: good.data.price_eu,
        };

        console.log('GOOD', goodToRender);

        setType(good.data.type);
        setPreviewImage(`${domen}${good.data.file.url}`);

        //@ts-ignore
        setGoodInfo(goodToRender);
        console.log('goodToRender', goodToRender);

        // const language = 'en';

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

    fetchCurrentGood();
  }, []);


  //@ts-ignore
  const handleAllInput = (e) => {
    console.log(e.target.name, '=', e.target.value);
    //@ts-ignore
    setGoodInfo({ ...goodInfo, [e.target.name]: e.target.value });
  };

  const typeHandler = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };


  interface GoodInfo {
  img: string;
  // добавьте другие свойства, которые используются в компоненте
  name_en?: string;
  name_de?: string;
  name_ru?: string;
  price?: number;
  article?: string;
  // и т.д.
}



  async function saveBtnHandler() {
    //  if (!file) {
    //       setError('Please select a file');
    //       return;
    //     }

    const data = new FormData();
    data.append('id', goodId);
    //@ts-ignore
    data.append('article', goodInfo.article);
    //@ts-ignore
    data.append('name_de', goodInfo.name_de);
    //@ts-ignore
    data.append('name_en', goodInfo.name_en);
    //@ts-ignore
    data.append('name_ru', goodInfo.name_ru);
    //@ts-ignore
    data.append('description_short_de', goodInfo.description_short_de);
    //@ts-ignore
    data.append('description_short_en', goodInfo.description_short_en);
    //@ts-ignore
    data.append('description_short_ru', goodInfo.description_short_ru);
    //@ts-ignore
    data.append('description_long_de', goodInfo.description_long_de);
    //@ts-ignore
    data.append('description_long_en', goodInfo.description_long_en);
    //@ts-ignore
    data.append('description_long_ru', goodInfo.description_long_ru);
    //@ts-ignore
    data.append('price_eu', goodInfo.price_eu);
    data.append('type', type);
    //@ts-ignore
    data.append('file', selectedFile);

    try {
      await axios.post('/admin_edit_good', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

    //   console.log('[Frontend] Upload successful:', response.data);
    //   alert('Good updated successfully!');

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
  }

  return (
    <>
      <NavMenu />
      <Box
        component="form"
        sx={{ '& > :not(style)': { m: 1 } }}
        noValidate
        autoComplete="off"
      >
        <List>
          <ListItem>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/goods-page')}
            >
              back
            </Button>
          </ListItem>

          <ListItem>
            <Typography variant="h4" gutterBottom>
                
              Edit good: {goodInfo?.name_en}
            </Typography>
          </ListItem>

          <ListItem>

            

            <TextField
              id="222"
            //   label="Article"
              placeholder='Article'  
              name="article"
              margin = "normal"
              variant="filled"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.article}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
            //   label="Name de"
              placeholder='Name de'  
              variant="filled"
              name="name_de"
                           
              //   variant="standard"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.name_de}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
            //   label="Name en"
              placeholder='Name en'  
              variant="filled"
              name="name_en"
              //   variant="standard"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.name_en}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
            //   label="Name ru"
              placeholder='Name ru'  
              variant="filled"
              name="name_ru"
              //   variant="standard"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.name_ru}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
            //   label="Short Description De"
              placeholder='Short Description De'  
              variant="filled"
              name="description_short_de"
              //   variant="standard"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.description_short_de}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
            //   label="Short Description En"
              placeholder='Short Description En'  
              variant="filled"
              name="description_short_en"
              //   variant="standard"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.description_short_en}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
            //   label="Short Description Ru"
              placeholder='Short Description Ru'  
              variant="filled"
              name="description_short_ru"
              //   variant="standard"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.description_short_ru}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
            //   label="Long Description De"
              placeholder='Long Description De'  
              variant="filled"
              name="description_long_de"
              //   variant="standard"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.description_long_de}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
            //   label="Long Description En"
              placeholder='Long Description En'  
              variant="filled"
              name="description_long_en"
              //   variant="standard"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.description_long_en}
            />
          </ListItem>

          <ListItem>
            <TextField
              id="outlined-basic"
            //   label="Long Description Ru"
              placeholder='Long Description Ru'  
              variant="filled"
              name="description_long_ru"
              //   variant="standard"
              required
              onChange={handleAllInput}
              //@ts-ignore
              value={goodInfo.description_long_ru}
            />
          </ListItem>

          <ListItem>
            <FormControl
            //   fullWidth
              
              // variant="standard"
            >
              {/* <InputLabel htmlFor="standard-adornment-amount">
                Price eu
              </InputLabel> */}
              <Input
                id="standard-adornment-amount"
                name="price_eu"
                // variant="filled"
                required
                onChange={handleAllInput}
                //@ts-ignore
                value={goodInfo.price_eu}
                startAdornment={
                  <InputAdornment position="start">€</InputAdornment>
                }
              />
            </FormControl>
          </ListItem>

          <ListItem>
            <FormControl
              // variant="standard"
              sx={{ minWidth: 180 }}
            >
              {/* <InputLabel id="demo-simple-select-standard-label">
                Type
              </InputLabel> */}
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                
              variant="filled"
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
              Item have been updated
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
