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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export const EditSale: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saleId } = location.state || {};

  const [allInputDatas, setAllInputDatas] = useState({
    title_de: '',
    title_en: '',
    title_ru: '',
    subtitle_de: '',
    subtitle_en: '',
    subtitle_ru: '',
    info_de: '',
    info_en: '',
    info_ru: '',
    dateUntil: '',
    buttonText_de: '',
    buttonText_en: '',
    buttonText_ru: '',
    good:'',
    isShowButton: false
  });
  
  const [good, setGood] = useState('');
  const [arrayGoodsForRender, setArrayGoodsForRender] = useState([]);
  
  // Состояния для отслеживания фокуса полей
  const [focusStates, setFocusStates] = useState({
    title_de: false,
    title_en: false,
    title_ru: false,
    subtitle_de: false,
    subtitle_en: false,
    subtitle_ru: false,
    buttonText_de: false,
    buttonText_en: false,
    buttonText_ru: false
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const domen = import.meta.env.VITE_DOMEN;

  // Загрузка данных акции для редактирования
  useEffect(() => {
    const fetchSaleData = async () => {
      if (!saleId) {
        console.error('No sale ID provided');
        navigate('/sales-page');
        return;
      }

      try {
        const sales = await axios.get('/admin_get_sales');
        const saleData = sales.data.find((sale: any) => sale._id === saleId);
        
        if (!saleData) {
          console.error('Sale not found');
          navigate('/sales-page');
          return;
        }

        setAllInputDatas({
          title_de: saleData.title_de || '',
          title_en: saleData.title_en || '',
          title_ru: saleData.title_ru || '',
          subtitle_de: saleData.subtitle_de || '',
          subtitle_en: saleData.subtitle_en || '',
          subtitle_ru: saleData.subtitle_ru || '',
          info_de: saleData.info_de || '',
          info_en: saleData.info_en || '',
          info_ru: saleData.info_ru || '',
          dateUntil: saleData.dateUntil || '',
          buttonText_de: saleData.buttonText_de || '',
          buttonText_en: saleData.buttonText_en || '',
          buttonText_ru: saleData.buttonText_ru || '',
          good: saleData.good?._id || '',
          isShowButton: saleData.isShowButton || false
        });

        setGood(saleData.good?._id || '');
        
        if (saleData.file?.url) {
          setCurrentImage(`${domen}${saleData.file.url}`);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных акции:', error);
        setIsLoading(false);
      }
    };

    fetchSaleData();
  }, [saleId, navigate, domen]);

  //@ts-ignore
  const handleAllInput = (e) => {
    console.log(e.target.name, '=', e.target.value);
    setAllInputDatas({ ...allInputDatas, [e.target.name]: e.target.value });
  };

  // получить все товары для select
  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const allGoods = await axios.get('/admin_get_goods');

        //@ts-ignore
        const arrayTemp = allGoods.data.map((item) => ({
          name: item.name_en,
          id: item._id,
        }));

        //@ts-ignore
        setArrayGoodsForRender(arrayTemp);
        console.log('formattedGoods', arrayTemp);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      }
    };

    fetchGoods();
  }, []);

  const typeHandler = (e: any) => {
    setGood(e.target.value);
  };

  const handleCheckboxChange = (e: any) => {
    setAllInputDatas({ ...allInputDatas, isShowButton: e.target.checked });
  };

  // Обработчики фокуса и blur событий
  const handleFocus = (fieldName: string) => {
    setFocusStates({ ...focusStates, [fieldName]: true });
  };

  const handleBlur = (fieldName: string) => {
    setFocusStates({ ...focusStates, [fieldName]: false });
  };

  // Максимальные длины для полей
  const maxLengths = {
    title_de: 35,
    title_en: 35,
    title_ru: 35,
    subtitle_de: 40,
    subtitle_en: 40,
    subtitle_ru: 40,
    buttonText_de: 20,
    buttonText_en: 20,
    buttonText_ru: 20
  };

  // Функция для получения оставшихся символов
  const getRemainingChars = (fieldName: keyof typeof maxLengths) => {
    const currentLength = allInputDatas[fieldName]?.length || 0;
    return maxLengths[fieldName] - currentLength;
  };

  // Добавим backend endpoint для обновления акции
  async function saveBtnHandler() {
    const data = new FormData();
    data.append('id', saleId);
    data.append('title_de', allInputDatas.title_de);
    data.append('title_en', allInputDatas.title_en);
    data.append('title_ru', allInputDatas.title_ru);
    data.append('subtitle_de', allInputDatas.subtitle_de);
    data.append('subtitle_en', allInputDatas.subtitle_en);
    data.append('subtitle_ru', allInputDatas.subtitle_ru);
    data.append('info_de', allInputDatas.info_de);
    data.append('info_en', allInputDatas.info_en);
    data.append('info_ru', allInputDatas.info_ru);
    data.append('dateUntil', allInputDatas.dateUntil);
    data.append('buttonText_de', allInputDatas.buttonText_de);
    data.append('buttonText_en', allInputDatas.buttonText_en);
    data.append('buttonText_ru', allInputDatas.buttonText_ru);
    data.append('good', good);
    data.append('isShowButton', allInputDatas.isShowButton.toString());
    
    // Если выбрано новое изображение, добавляем его
    if (selectedFile) {
      //@ts-ignore
      data.append('file', selectedFile);
    }

    try {
      const response = await axios.post('/admin_update_sale', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[Frontend] Update successful:', response.data);
      setOpenModal(true);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    }
  }

  //@ts-ignore
  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`File too large (max ${MAX_SIZE_MB}MB)`);
      return;
    }

    setSelectedFile(file);

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
    boxShadow: 24,
    p: 4,
  };

  function modalOkBtnHandler() {
    setOpenModal(false);
    navigate('/sales-page');
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

  const itemInSectionBox = {
    mb: 3,
  };

  if (isLoading) {
    return (
      <>
        <NavMenu />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Typography>Loading...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <NavMenu />

      <Box component="form" sx={wrapperBox} noValidate autoComplete="off">
        <Box sx={sectionBox}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/sales-page')}
          >
            back
          </Button>
        </Box>

        <Box sx={itemInSectionBox}>
          <Typography variant="h4" gutterBottom>
            Edit sale or special offer
          </Typography>
        </Box>

        <Box sx={itemInSectionBox}>
          <List>
            <ListItem></ListItem>
            
            <ListItem></ListItem>   
                <Divider>
                  <Chip size="small" label='Title'/>
                </Divider>
             <ListItem></ListItem>  

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Title de"
                name="title_de"
                variant="standard"
                required
                inputProps={{ maxLength: 35 }}
                onChange={handleAllInput}
                onFocus={() => handleFocus('title_de')}
                onBlur={() => handleBlur('title_de')}
                value={allInputDatas.title_de}
              />
            </ListItem>
            {focusStates.title_de && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'red', fontSize: '0.75rem', ml: 2 }}>
                  {getRemainingChars('title_de')} characters remaining
                </Typography>
              </ListItem>
            )}

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Title en"
                name="title_en"
                variant="standard"
                required
                inputProps={{ maxLength: 35 }}
                onChange={handleAllInput}
                onFocus={() => handleFocus('title_en')}
                onBlur={() => handleBlur('title_en')}
                value={allInputDatas.title_en}
              />
            </ListItem>
            {focusStates.title_en && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'red', fontSize: '0.75rem', ml: 2 }}>
                  {getRemainingChars('title_en')} characters remaining
                </Typography>
              </ListItem>
            )}

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Title ru"
                name="title_ru"
                variant="standard"
                required
                inputProps={{ maxLength: 35 }}
                onChange={handleAllInput}
                onFocus={() => handleFocus('title_ru')}
                onBlur={() => handleBlur('title_ru')}
                value={allInputDatas.title_ru}
              />
            </ListItem>
            {focusStates.title_ru && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'red', fontSize: '0.75rem', ml: 2 }}>
                  {getRemainingChars('title_ru')} characters remaining
                </Typography>
              </ListItem>
            )}

            <ListItem></ListItem>   
                <Divider>
                  <Chip size="small" label='Subtitle'/>
                </Divider>
             <ListItem></ListItem>  

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Subtitle de"
                name="subtitle_de"
                variant="standard"
                required
                inputProps={{ maxLength: 80 }}
                onChange={handleAllInput}
                onFocus={() => handleFocus('subtitle_de')}
                onBlur={() => handleBlur('subtitle_de')}
                value={allInputDatas.subtitle_de}
              />
            </ListItem>
            {focusStates.subtitle_de && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'red', fontSize: '0.75rem', ml: 2 }}>
                  {getRemainingChars('subtitle_de')} characters remaining
                </Typography>
              </ListItem>
            )}

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Subtitle en"
                name="subtitle_en"
                variant="standard"
                required
                inputProps={{ maxLength: 80 }}
                onChange={handleAllInput}
                onFocus={() => handleFocus('subtitle_en')}
                onBlur={() => handleBlur('subtitle_en')}
                value={allInputDatas.subtitle_en}
              />
            </ListItem>
            {focusStates.subtitle_en && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'red', fontSize: '0.75rem', ml: 2 }}>
                  {getRemainingChars('subtitle_en')} characters remaining
                </Typography>
              </ListItem>
            )}

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Subtitle ru"
                name="subtitle_ru"
                variant="standard"
                required
                inputProps={{ maxLength: 80 }}
                onChange={handleAllInput}
                onFocus={() => handleFocus('subtitle_ru')}
                onBlur={() => handleBlur('subtitle_ru')}
                value={allInputDatas.subtitle_ru}
              />
            </ListItem>
            {focusStates.subtitle_ru && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'red', fontSize: '0.75rem', ml: 2 }}>
                  {getRemainingChars('subtitle_ru')} characters remaining
                </Typography>
              </ListItem>
            )}

            <ListItem></ListItem>   
                <Divider>
                  <Chip size="small" label='Information about special offer'/>
                </Divider>
             <ListItem></ListItem>  

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Information de"
                name="info_de"
                variant="standard"
                required
                onChange={handleAllInput}
                value={allInputDatas.info_de}
              />
            </ListItem>

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Information en"
                name="info_en"
                variant="standard"
                required
                onChange={handleAllInput}
                value={allInputDatas.info_en}
              />
            </ListItem>

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Information ru"
                name="info_ru"
                variant="standard"
                required
                onChange={handleAllInput}
                value={allInputDatas.info_ru}
              />
            </ListItem>

            <ListItem></ListItem>   
                <Divider>
                  <Chip size="small" label='Button text'/>
                </Divider>
             <ListItem></ListItem> 

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Banner button text de"
                name="buttonText_de"
                variant="standard"
                required
                inputProps={{ maxLength: 20 }}
                onChange={handleAllInput}
                onFocus={() => handleFocus('buttonText_de')}
                onBlur={() => handleBlur('buttonText_de')}
                value={allInputDatas.buttonText_de}
              />
            </ListItem>
            {focusStates.buttonText_de && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'red', fontSize: '0.75rem', ml: 2 }}>
                  {getRemainingChars('buttonText_de')} characters remaining
                </Typography>
              </ListItem>
            )}

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Banner button text en"
                name="buttonText_en"
                variant="standard"
                required
                inputProps={{ maxLength: 20 }}
                onChange={handleAllInput}
                onFocus={() => handleFocus('buttonText_en')}
                onBlur={() => handleBlur('buttonText_en')}
                value={allInputDatas.buttonText_en}
              />
            </ListItem>
            {focusStates.buttonText_en && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'red', fontSize: '0.75rem', ml: 2 }}>
                  {getRemainingChars('buttonText_en')} characters remaining
                </Typography>
              </ListItem>
            )}

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Banner button text ru"
                name="buttonText_ru"
                variant="standard"
                required
                inputProps={{ maxLength: 20 }}
                onChange={handleAllInput}
                onFocus={() => handleFocus('buttonText_ru')}
                onBlur={() => handleBlur('buttonText_ru')}
                value={allInputDatas.buttonText_ru}
              />
            </ListItem>
            {focusStates.buttonText_ru && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'red', fontSize: '0.75rem', ml: 2 }}>
                  {getRemainingChars('buttonText_ru')} characters remaining
                </Typography>
              </ListItem>
            )}

            <ListItem></ListItem>   
                <Divider>
                  <Chip size="small" label='Date'/>
                </Divider>
             <ListItem></ListItem> 

            <ListItem>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Date until"
                name="dateUntil"
                type="date"
                variant="standard"
                required
                onChange={handleAllInput}
                value={allInputDatas.dateUntil}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </ListItem> 

            <ListItem></ListItem>   
                <Divider>
                  <Chip size="small" label='Additional option'/>
                </Divider>
             <ListItem></ListItem> 

            <ListItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allInputDatas.isShowButton}
                    onChange={handleCheckboxChange}
                    name="isShowButton"
                  />
                }
                label="Add available to redirect directly to current item"
              />
            </ListItem>

            {allInputDatas.isShowButton && (
            <ListItem>
              <FormControl variant="standard" sx={{ minWidth: 180 }} fullWidth>
                <InputLabel id="demo-simple-select-standard-label" >
                  Choose item
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={good}
                  onChange={typeHandler}
                  label="Good"
                >
                  {arrayGoodsForRender.map((item: any) => (
                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ListItem>
            )}
          </List>
        </Box>

        <ListItem></ListItem>
        <Divider>
          <Chip size="small" label="Image" />
        </Divider>
        <ListItem></ListItem>

        <ListItem>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Recommended aspect ratio: 2,5 х 1</Typography>
            <Typography variant="body2">Recommended image size: 1040px х 430px</Typography>
          </Box>
        </ListItem>

        {/* Показываем текущее изображение, если есть */}
        {currentImage && !previewImage && (
          <ListItem>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Current image:</Typography>
              <img
                src={currentImage}
                alt="Current sale image"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  height: 'auto',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          </ListItem>
        )}

        <Box component="section" sx={sectionBox}>
          <ListItem>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              disabled={!!previewImage}
            >
              {currentImage ? 'Change Image' : 'Upload Image'}
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
                      {selectedFile.name} •{' '}
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </ListItem>
        </Box>

        <Box component="section" sx={sectionBox}>
          <ListItem>
            <Button
              variant="contained"
              onClick={saveBtnHandler}
              color="success"
              sx={{ width: 200 }}
            >
              Update special offer
            </Button>
          </ListItem>
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
              Special offer has been updated successfully
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