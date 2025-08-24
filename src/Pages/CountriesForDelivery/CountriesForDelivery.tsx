import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

// import { useNavigate } from 'react-router-dom';

export const CountriesForDelivery: FC = () => {
  const navigate = useNavigate();

  const [arrayTypesForRender, setArrayTypesForRender] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  // Храним предыдущие значения полей
  const [previousValues, setPreviousValues] = useState<{[key: string]: any}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [newCountryNameDe, setNewCountryNameDe] = useState('');
  const [newCountryNameEn, setNewCountryNameEn] = useState('');
  const [newCountryNameRu, setNewCountryNameRu] = useState('');
  const [newCountryIsEU, setNewCountryIsEU] = useState(false);
  const [isSavingCountry, setIsSavingCountry] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name_de: false,
    name_en: false,
    name_ru: false
  });
  
  // Состояния для удаления
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeletingCountry, setIsDeletingCountry] = useState(false);

  //   const language = 'en';
  //   const domen = import.meta.env.VITE_DOMEN;

  // получить список стран для доставки
  useEffect(() => {
    const fetchCountriesInfo = async () => {
      setIsLoading(true);
      try {
        const countries = await axios.get('/admin_get_countries');

        // @ts-ignore
        const arrayTemp = countries.data.map((item) => ({
          name_de: item.name_de,
          name_en: item.name_en,
          name_ru: item.name_ru,
          id: item._id,
          isEU: item.isEU
        }));

        //для вывода типов в таблице с товарами
        // const typesForGoodsTable = arrayTemp.map((item) => ({
        //   [item.id]: item.name,
        // }));

        // const resultObject = Object.assign({}, ...typesForGoodsTable);
        // setArrayTypesForGoodTable(resultObject);

        setArrayTypesForRender(arrayTemp);

        console.log('type1', arrayTemp);

        // console.log('type2', typesForGoodsTable);
        // console.log('type3', resultObject);

        // setAllGoods(arrayGoodsForRender);
        // setArrayGoodsForRender(arrayGoodsForRender);

        // console.log('formattedTypes', arrayTypesForRender);
        // console.log('formattedTypes', arrayTypesForRender);
        // console.log('formattedGoods', arrayGoodsForRender);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountriesInfo();
  }, []);

  // Функция для создания новой страны
  const handleCreateCountry = async () => {
    console.log('handleCreateCountry called');
    
    // Проверяем валидацию
    const errors = {
      name_de: !newCountryNameDe.trim(),
      name_en: !newCountryNameEn.trim(),
      name_ru: !newCountryNameRu.trim()
    };
    
    console.log('Validation errors:', errors);
    setValidationErrors(errors);
    
    // Если есть ошибки валидации, не сохраняем
    if (errors.name_de || errors.name_en || errors.name_ru) {
      console.log('Validation failed, not saving');
      setSnackbarMessage('All country names are required');
      setSnackbarType('error');
      setSnackbarOpen(true);
      return;
    }
    
    console.log('Validation passed, attempting to save...');

    // console.log('newCountryNameDe',newCountryNameDe)

    // return
    setIsSavingCountry(true);
    try {
      console.log('Making API request to /admin_add_new_country');
      const response = await axios.post('/admin_add_new_country', {
        array: {
          name_de: newCountryNameDe.trim(),
          name_en: newCountryNameEn.trim(),
          name_ru: newCountryNameRu.trim(),
          isEU: newCountryIsEU
        }
      });

      console.log('API response:', response.data);

      if (response.data.status === 'ok') {
        console.log('Success response received, reloading countries...');
        // Перезагружаем список стран с сервера, так как бекэнд не возвращает созданную страну
        try {
          const countries = await axios.get('/admin_get_countries');
          const arrayTemp = countries.data.map((item: any) => ({
            name_de: item.name_de,
            name_en: item.name_en,
            name_ru: item.name_ru,
            id: item._id,
            isEU: item.isEU
          }));
          setArrayTypesForRender(arrayTemp);
        } catch (reloadError) {
          console.error('Error reloading countries:', reloadError);
        }
        
        // Сбрасываем состояние
        resetAddingCountryState();
        
        setSnackbarMessage('New country created successfully');
        setSnackbarType('success');
        setSnackbarOpen(true);
        
        console.log('Country created successfully');
      }
    } catch (error: any) {
      console.error('Error creating country:', error);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarType('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Ошибка при создании страны. Попробуйте снова.');
        setSnackbarType('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsSavingCountry(false);
    }
  };

  // Функция сброса состояния добавления страны
  const resetAddingCountryState = () => {
    setNewCountryNameDe('');
    setNewCountryNameEn('');
    setNewCountryNameRu('');
    setNewCountryIsEU(false);
    setIsAddingCountry(false);
    setValidationErrors({
      name_de: false,
      name_en: false,
      name_ru: false
    });
  };

  // Обработчик нажатия Enter
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      console.log('Enter pressed, calling handleCreateCountry');
      console.log('Current values:', {
        name_de: newCountryNameDe,
        name_en: newCountryNameEn,
        name_ru: newCountryNameRu,
        isEU: newCountryIsEU
      });
      handleCreateCountry();
    }
  };

  // Обработчик потери фокуса
  const handleAddingBlur = (event: React.FocusEvent) => {
    // Проверяем, что фокус ушел не на другой input и не на кнопку Save
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && (
      relatedTarget.closest('[data-country-input]') || 
      relatedTarget.closest('[data-save-country-button]') ||
      relatedTarget.closest('[data-country-checkbox]')
    )) {
      return; // Не сбрасываем, если фокус на связанных элементах
    }
    
    // Сбрасываем состояние только если фокус ушел за пределы компонента
    setTimeout(() => {
      resetAddingCountryState();
    }, 150); // Небольшая задержка для корректной работы
  };

  // Обработчики изменения полей с очисткой ошибок валидации
  const handleCountryNameChange = (field: 'name_de' | 'name_en' | 'name_ru', value: string) => {
    // Очищаем ошибку валидации при изменении поля
    if (validationErrors[field] && value.trim()) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
    
    // Обновляем значение поля
    switch (field) {
      case 'name_de':
        setNewCountryNameDe(value);
        break;
      case 'name_en':
        setNewCountryNameEn(value);
        break;
      case 'name_ru':
        setNewCountryNameRu(value);
        break;
    }
  };

  //   function typePressedHandler(typeId: string) {
  //     //@ts-ignore
  //     setSelectedChipId(typeId);
  //     console.log('typeId=', typeId);

  //     //@ts-ignore
  //     if (typeId == '1') {
  //       setArrayGoodsForRender(allGoods);
  //       return;
  //     }

  //     //@ts-ignore
  //     let newArray = [];

  //     allGoods.map((item) => {
  //       //@ts-ignore
  //       if (item.type === typeId) {
  //         //@ts-ignore
  //         newArray = [item, ...newArray];
  //       }
  //     });
  //     //@ts-ignore
  //     setArrayGoodsForRender(newArray);
  //   }

  //@ts-ignore
  function editBtnHandler(goodId) {
    navigate('/edit_good-page', {
      state: {
        goodId,
      },
    });
  }


  //   function deleteBtnHandler(goodId, goodName) {
  //     setGoodName(goodName);
  //     setIdToDelete(goodId);
  //     setOpenModal(true);
  //   }

  //   async function modalYesBtnHandler() {
  //     try {
  //       console.log('idToDelete=', idToDelete);

  //       const deleteResult = await axios.post('/admin_delete_good', {
  //         id: idToDelete,
  //       });

  //       if (deleteResult.data.status === 'ok') {
  //         const goods = await axios.get('/user_get_goods');

  //         //@ts-ignore
  //         const arrayGoodsForRender = goods.data.map((item) => ({
  //           name: item[`name_${language}`],
  //           description_short: item[`description_short_${language}`],
  //           description_long: item[`description_long_${language}`],
  //           img: `${domen}${item.file.url}`,
  //           id: item._id,
  //           type: item.type,
  //         }));

  //         setAllGoods(arrayGoodsForRender);
  //         setArrayGoodsForRender(arrayGoodsForRender);
  //         setOpenModal(false);
  //       }
  //     } catch (error) {
  //       console.error('Ошибка при выполнении запроса:', error);
  //     } finally {
  //       // setShowLoader(false);
  //       // setWolfButtonActive(true);
  //     }
  //   }

  // Сохраняем предыдущее значение при фокусе
  function handleFocus(e: any) {
    const countryId = e.target.id;
    const fieldName = e.target.name;
    const key = `${countryId}_${fieldName}`;
    setPreviousValues(prev => ({
      ...prev,
      [key]: e.target.value
    }));
  }

  function inputHandler(e: any) {
    const newArray = arrayTypesForRender.map((item: any) => {
      const name = e.target.name;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      console.log('name', name, 'value', value);
      if (item.id === e.target.id || (e.target.type === 'checkbox' && item.id === e.target.dataset.id)) {
        return { ...item, [name]: value };
      }
      return item;
    });
    //@ts-ignore
    setArrayTypesForRender(newArray);
  }

  // Обработчик нажатия Enter для существующих стран
  const handleExistingCountryKeyPress = async (e: React.KeyboardEvent, countryId: string, fieldName: string) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      const value = target.value.trim();
      const key = `${countryId}_${fieldName}`;
      
      // Проверяем, если поле пустое
      if (value === '') {
        // Возвращаем предыдущее значение
        const previousValue = previousValues[key] || '';
        const newArray = arrayTypesForRender.map((item: any) => {
          if (item.id === countryId) {
            return { ...item, [fieldName]: previousValue };
          }
          return item;
        });
        //@ts-ignore
        setArrayTypesForRender(newArray);
        
        // Показываем красный snackbar
        setSnackbarMessage("Input can't be empty");
        setSnackbarType('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Сохраняем если поле не пустое
      const country = arrayTypesForRender.find((item: any) => item.id === countryId);
      if (country) {
        await saveCountry(country);
      }
    }
  };

  // Проверка и сохранение при потере фокуса
  async function handleBlur(e: any) {
    const countryId = e.target.id || e.target.dataset.id;
    const fieldName = e.target.name;
    const value = e.target.value.trim();
    const key = `${countryId}_${fieldName}`;
    
    // Проверяем, если поле пустое
    if (value === '') {
      // Возвращаем предыдущее значение
      const previousValue = previousValues[key] || '';
      const newArray = arrayTypesForRender.map((item: any) => {
        if (item.id === countryId) {
          return { ...item, [fieldName]: previousValue };
        }
        return item;
      });
      //@ts-ignore
      setArrayTypesForRender(newArray);
      
      // Показываем красный snackbar
      setSnackbarMessage("Input can't be empty");
      setSnackbarType('error');
      setSnackbarOpen(true);
      return;
    }
    
    const country = arrayTypesForRender.find((item: any) => item.id === countryId);
    if (country) {
      await saveCountry(country);
    }
  }

  // Автосохранение для checkbox
  async function handleCheckboxChange(e: any, id:any) {
    const countryId = id;
    const isChecked = e.target.checked;

    console.log("countryId", countryId)
    
    console.log('Checkbox changed:', countryId, isChecked);
    
    // Сначала обновляем состояние
    const newArray = arrayTypesForRender.map((item: any) => {
      if (item.id === countryId) {
        return { ...item, isEU: isChecked };
      }
      return item;
    });
    //@ts-ignore
    setArrayTypesForRender(newArray);
    
    // Затем сохраняем на сервере
    const country = arrayTypesForRender.find((item: any) => item.id === countryId);
    if (country && typeof country === 'object') {
      //@ts-ignore
      const updatedCountry = { ...country, isEU: isChecked };
      await saveCountry(updatedCountry);
    }
  }

  // Функция сохранения одной страны
  async function saveCountry(country: any) {
    try {
      const response = await axios.post('/admin_update_country', {
        id: country.id,
        name_en: country.name_en,
        name_de: country.name_de,
        name_ru: country.name_ru,
        isEU: country.isEU,
      });

      if (response.data.status === 'ok') {
        setSnackbarMessage('Changes saved');
        setSnackbarType('success');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      setSnackbarMessage('Error when saving, try again');
      setSnackbarType('error');
      setSnackbarOpen(true);
    }
  }

  // Обработчик клика по кнопке удаления
  const handleDeleteCountry = (countryId: string, countryName: string) => {
    setCountryToDelete({ id: countryId, name: countryName });
    setDeleteModalOpen(true);
  };

  // Подтверждение удаления страны
  const confirmDeleteCountry = async () => {
    if (!countryToDelete) return;

    setIsDeletingCountry(true);
    try {
      const response = await axios.post('/admin_delete_country', {
        id: countryToDelete.id
      });

      if (response.data.status === 'ok') {
        // Удаляем страну из локального состояния
        const updatedCountries = arrayTypesForRender.filter(
          (item: any) => item.id !== countryToDelete.id
        );
        setArrayTypesForRender(updatedCountries);
        
        setSnackbarMessage('Country deleted successfully');
        setSnackbarType('success');
        setSnackbarOpen(true);
        
        // Закрываем модальное окно
        setDeleteModalOpen(false);
        setCountryToDelete(null);
      }
    } catch (error: any) {
      console.error('Ошибка при удалении страны:', error);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(error.response.data.error);
      } else {
        setSnackbarMessage('Error deleting country. Try again.');
      }
      setSnackbarType('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeletingCountry(false);
    }
  };

  // Отмена удаления
  const cancelDeleteCountry = () => {
    setDeleteModalOpen(false);
    setCountryToDelete(null);
  };


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

  if (isLoading) {
    return (
      <>
        <NavMenu />
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading ...
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <NavMenu />

      <Box sx={wrapperBox}>
        <Box sx={sectionBox}>
          <Button
            //   variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/settings-page')}
          >
            back
          </Button>
        </Box>

        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4">
            List of countries for delivery:{' '}
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color={isAddingCountry ? "success" : "primary"}
              startIcon={isAddingCountry && !isSavingCountry ? <SaveIcon /> : isAddingCountry && isSavingCountry ? <CircularProgress size={20} color="inherit" /> : <AddCircleSharpIcon />}
              data-save-country-button
              disabled={isSavingCountry}
              onClick={() => {
                if (isAddingCountry) {
                  handleCreateCountry();
                } else {
                  setIsAddingCountry(true);
                }
              }}
            >
              {isAddingCountry ? (isSavingCountry ? 'Saving...' : 'Save country') : 'Add new country'}
            </Button>
            
            {isAddingCountry && (
              <>
                <TextField
                  size="small"
                  placeholder="Enter name DE"
                  value={newCountryNameDe}
                  onChange={(e) => handleCountryNameChange('name_de', e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={handleAddingBlur}
                  data-country-input
                  sx={{ width: 250 }}
                  autoFocus
                  error={validationErrors.name_de}
                  helperText={validationErrors.name_de ? 'Required' : ''}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">DE:</InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  size="small"
                  placeholder="Enter name EN"
                  value={newCountryNameEn}
                  onChange={(e) => handleCountryNameChange('name_en', e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={handleAddingBlur}
                  data-country-input
                  sx={{ width: 250 }}
                  error={validationErrors.name_en}
                  helperText={validationErrors.name_en ? 'Required' : ''}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">EN:</InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  size="small"
                  placeholder="Enter name RU"
                  value={newCountryNameRu}
                  onChange={(e) => handleCountryNameChange('name_ru', e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={handleAddingBlur}
                  data-country-input
                  sx={{ width: 250 }}
                  error={validationErrors.name_ru}
                  helperText={validationErrors.name_ru ? 'Required' : ''}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">RU:</InputAdornment>
                      ),
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newCountryIsEU}
                      onChange={(e) => setNewCountryIsEU(e.target.checked)}
                      name="isEU"
                      data-country-checkbox
                    />
                  }
                  label="EU Country"
                  sx={{ ml: 1 }}
                />
              </>
            )}
          </Box>
        </Box>

        <Box sx={sectionBox}>
          <Stack direction="column" spacing={3}>
            {arrayTypesForRender.map((item: any) => (
              
              <Card key={item.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <IconButton
                      onClick={() => handleDeleteCountry(item.id, item.name_en)}
                      color="error"
                      size="small"
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(211, 47, 47, 0.1)' 
                        } 
                      }}
                    >
                      <DeleteForeverIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <TextField
                    // key={item.id}
                    fullWidth
                    name="name_de"
                    id={item.id}
                    onChange={(e) => inputHandler(e)}
                    onFocus={(e) => handleFocus(e)}
                    onBlur={(e) => handleBlur(e)}
                    onKeyPress={(e) => handleExistingCountryKeyPress(e, item.id, 'name_de')}
                    value={item.name_de}
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
                    id={item.id}
                    onChange={(e) => inputHandler(e)}
                    onFocus={(e) => handleFocus(e)}
                    onBlur={(e) => handleBlur(e)}
                    onKeyPress={(e) => handleExistingCountryKeyPress(e, item.id, 'name_en')}
                    value={item.name_en}
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
                    id={item.id}
                    onChange={(e) => inputHandler(e)}
                    onFocus={(e) => handleFocus(e)}
                    onBlur={(e) => handleBlur(e)}
                    onKeyPress={(e) => handleExistingCountryKeyPress(e, item.id, 'name_ru')}
                    value={item.name_ru}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">RU:</InputAdornment>
                        ),
                      },
                    }}
                    variant="standard"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={item.isEU || false}
                        onChange={(e) => handleCheckboxChange(e, item.id)}
                        name="isEU"
                      />
                    }
                    label="EU Country"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarType}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Модальное окно подтверждения удаления */}
        <Dialog
          open={deleteModalOpen}
          onClose={cancelDeleteCountry}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            Delete Country
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete the country "{countryToDelete?.name}"? 
              
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={cancelDeleteCountry}
              disabled={isDeletingCountry}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteCountry}
              color="error"
              variant="contained"
              disabled={isDeletingCountry}
              startIcon={isDeletingCountry ? <CircularProgress size={16} /> : <DeleteForeverIcon />}
            >
              {isDeletingCountry ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
