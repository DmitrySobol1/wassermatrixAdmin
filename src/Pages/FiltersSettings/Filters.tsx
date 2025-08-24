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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Modal from '@mui/material/Modal';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

// import { useNavigate } from 'react-router-dom';

export const Filters: FC = () => {
  const navigate = useNavigate();

  const [arrayTypesForRender, setArrayTypesForRender] = useState([]);
  const [previousValues, setPreviousValues] = useState<{[key: string]: any}>({});
  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState({ name_de: '', name_en: '', name_ru: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success' | 'warning'>('error');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [filterTitle, setFilterTitle] = useState('');
  const [idToDelete, setIdToDelete] = useState('');
  const [isCheckingFilterUsage, setIsCheckingFilterUsage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  //   const language = 'en';
  //   const domen = import.meta.env.VITE_DOMEN;

  // получить список типов товаров + товары
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      setIsLoading(true);
      try {
        const types = await axios.get('/user_get_goodsstype');

        //@ts-ignore
        // const arrayTemp = types.data.map((item) => ({
        //   name: item[`name_${language}`],
        //   id: item._id,
        // }));

        const arrayTemp = types.data.map((item) => ({
          name_de: item.name_de,
          name_en: item.name_en,
          name_ru: item.name_ru,
          id: item._id,
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

    fetchGoodsTypesInfo();
  }, []);

  // Функция для создания нового фильтра
  const handleCreateFilter = async () => {
    // Валидация обязательных полей
    if (!newFilterName.name_de.trim() || !newFilterName.name_en.trim() || !newFilterName.name_ru.trim()) {
      setSnackbarMessage('All name fields are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.post('/admin_add_new_type', {
        array: {
          name_de: newFilterName.name_de.trim(),
          name_en: newFilterName.name_en.trim(),
          name_ru: newFilterName.name_ru.trim()
        }
      });

      console.log(response.data);
      
      // Обновляем список фильтров
      const updatedFilters = await axios.get('/user_get_goodsstype');
      const arrayTemp = updatedFilters.data.map((item: any) => ({
        name_de: item.name_de,
        name_en: item.name_en,
        name_ru: item.name_ru,
        id: item._id,
      }));
      setArrayTypesForRender(arrayTemp);
      
      // Сбрасываем состояние
      resetAddingState();
      
      setSnackbarMessage('Filter created successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error creating filter:', error);
      setSnackbarMessage('Error creating filter. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Функция сброса состояния
  const resetAddingState = () => {
    setNewFilterName({ name_de: '', name_en: '', name_ru: '' });
    setIsAddingFilter(false);
  };

  // Обработчик нажатия Enter
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateFilter();
    }
  };

  // Обработчик потери фокуса
  const handleBlur = (event: React.FocusEvent) => {
    // Проверяем, что фокус ушел не на другой input и не на кнопку Save
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && (
      relatedTarget.closest('input') || 
      relatedTarget.closest('button')
    )) {
      return; // Не сбрасываем, если фокус на связанных элементах
    }
    
    // Сбрасываем состояние только если фокус ушел за пределы компонента
    setTimeout(() => {
      resetAddingState();
    }, 150); // Небольшая задержка для корректной работы
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
    const filterId = e.target.id;
    const fieldName = e.target.name;
    const key = `${filterId}_${fieldName}`;
    setPreviousValues(prev => ({
      ...prev,
      [key]: e.target.value
    }));
  }

  function inputHandler(e: any) {
    const newArray = arrayTypesForRender.map((item: any) => {
      const name = e.target.name;
      console.log('name', name);
      if (item.id === e.target.id) {
        return { ...item, [name]: e.target.value };
      }
      return item;
    });
    //@ts-ignore
    setArrayTypesForRender(newArray);
  }

  // Обработчик нажатия Enter для полей редактирования фильтров
  async function handleKeyPressEdit(e: any) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur(); // Убираем фокус, что вызовет handleBlurSave
    }
  }

  // Автосохранение при потере фокуса
  async function handleBlurSave(e: any) {
    const filterId = e.target.id;
    const fieldName = e.target.name;
    const value = e.target.value.trim();
    const key = `${filterId}_${fieldName}`;
    
    // Проверяем, если поле пустое
    if (value === '') {
      // Возвращаем предыдущее значение
      const previousValue = previousValues[key] || '';
      const newArray = arrayTypesForRender.map((item: any) => {
        if (item.id === filterId) {
          return { ...item, [fieldName]: previousValue };
        }
        return item;
      });
      //@ts-ignore
      setArrayTypesForRender(newArray);
      
      // Показываем ошибку
      setSnackbarMessage("Input can't be empty");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Сохраняем на сервере
    await saveFilterChanges();
  }

  // Функция сохранения изменений фильтров
  async function saveFilterChanges() {
    try {
      const response = await axios.post('/admin_update_filters', {
        arrayTypes: arrayTypesForRender,
      });

      console.log(response.data);
      setSnackbarMessage('Changes saved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      setSnackbarMessage('Error saving changes');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }

  // Функция для проверки использования фильтра и удаления
  const handleDeleteFilter = async (filterId: string) => {
    setIsCheckingFilterUsage(true);
    
    try {
      // Сначала проверяем, используется ли фильтр в товарах
      console.log('Checking filter usage for ID:', filterId);
      const checkResponse = await axios.post('/admin_check_filter_usage', {
        filterId: filterId
      });

      console.log('Check filter usage response:', checkResponse.data);

      if (checkResponse.data.isUsed) {
        // Если фильтр используется, показываем предупреждение
        setSnackbarMessage(`You can't delete this filter, because some goods have this filter (${checkResponse.data.goodsCount} goods)`);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        setOpenDeleteModal(false);
        return;
      }

      // Если фильтр не используется, удаляем его
      console.log('Attempting to delete filter with ID:', filterId);
      const deleteResponse = await axios.post('/admin_delete_filter', {
        id: filterId
      });

      console.log('Delete response:', deleteResponse.data);
      
      if (deleteResponse.data.status === 'ok') {
        // Удаляем фильтр из массива
        //@ts-ignore
        setArrayTypesForRender(prev => prev.filter(filter => filter.id !== filterId));
        
        // Закрываем модальное окно
        setOpenDeleteModal(false);
        
        setSnackbarMessage('Filter deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Filter deleted successfully:', deleteResponse.data.deletedFilter);
      } else {
        console.error('Delete failed with response:', deleteResponse.data);
        setSnackbarMessage(deleteResponse.data.error || 'Failed to delete filter');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setOpenDeleteModal(false);
      }
    } catch (error: any) {
      console.error('Error deleting filter:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // Закрываем модальное окно
      setOpenDeleteModal(false);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(`Error: ${error.response.data.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else if (error.response?.status === 404) {
        setSnackbarMessage('Filter not found on server');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else if (error.response?.status === 500) {
        setSnackbarMessage('Server error occurred');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(`Error deleting filter: ${error.message || 'Please try again'}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsCheckingFilterUsage(false);
    }
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
            onClick={() => navigate('/goods-page')}
          >
            back
          </Button>
        </Box>

        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4">
            List of filters types:{' '}
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color={isAddingFilter ? "success" : "primary"}
              startIcon={<AddCircleSharpIcon />}
              onClick={() => {
                if (isAddingFilter) {
                  handleCreateFilter();
                } else {
                  setIsAddingFilter(true);
                }
              }}
            >
              {isAddingFilter ? 'Save filter' : 'Add new filter'}
            </Button>
            
            {isAddingFilter && (
              <TextField
                size="small"
                placeholder="Name DE"
                value={newFilterName.name_de}
                onChange={(e) => setNewFilterName({...newFilterName, name_de: e.target.value})}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                sx={{ width: 200 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">DE:</InputAdornment>
                    ),
                  },
                }}
                autoFocus
              />
            )}
            
            {isAddingFilter && (
              <TextField
                size="small"
                placeholder="Name EN"
                value={newFilterName.name_en}
                onChange={(e) => setNewFilterName({...newFilterName, name_en: e.target.value})}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                sx={{ width: 200 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">EN:</InputAdornment>
                    ),
                  },
                }}
              />
            )}
            
            {isAddingFilter && (
              <TextField
                size="small"
                placeholder="Name RU"
                value={newFilterName.name_ru}
                onChange={(e) => setNewFilterName({...newFilterName, name_ru: e.target.value})}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                sx={{ width: 200 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">RU:</InputAdornment>
                    ),
                  },
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={sectionBox}>
          <Stack direction="column" spacing={3}>
            {arrayTypesForRender.map((item: any) => (
              
              <Card key={item.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <TextField
                    // key={item.id}
                    fullWidth
                    name="name_de"
                    id={item.id}
                    onChange={(e) => inputHandler(e)}
                    onFocus={(e) => handleFocus(e)}
                    onBlur={(e) => handleBlurSave(e)}
                    onKeyPress={(e) => handleKeyPressEdit(e)}
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
                    onBlur={(e) => handleBlurSave(e)}
                    onKeyPress={(e) => handleKeyPressEdit(e)}
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
                    onBlur={(e) => handleBlurSave(e)}
                    onKeyPress={(e) => handleKeyPressEdit(e)}
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
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Tooltip title="Delete filter">
                        <IconButton
                          aria-label="delete"
                          onClick={() => {
                            setFilterTitle(`${item.name_en} (${item.name_de}/${item.name_ru})`);
                            setIdToDelete(item.id);
                            setOpenDeleteModal(true);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>


        {/* Модальное окно для подтверждения удаления */}
        <Modal
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Delete Filter
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Are you sure you want to delete filter "{filterTitle}"?
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              
              <Button 
                variant="contained" 
                color="error"
                disabled={isCheckingFilterUsage}
                onClick={() => {
                  handleDeleteFilter(idToDelete);
                }}
                startIcon={isCheckingFilterUsage ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {isCheckingFilterUsage ? 'Checking...' : 'Delete'}
              </Button>
              <Button variant="outlined" onClick={() => setOpenDeleteModal(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Snackbar для уведомлений */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};
