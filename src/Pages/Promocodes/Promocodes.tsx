import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';

import LabelIcon from '@mui/icons-material/Label';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import { red } from '@mui/material/colors';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export const Promocodes: FC = () => {

   const navigate = useNavigate();

  const [arrayPromocodesForRender, setArrayPromocodesForRender] = useState([]);
  const [arrayPersonalPromocodesForRender, setArrayPersonalPromocodesForRender] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [promocodeCode, setPromocodeCode] = useState('');
  const [idToDelete, setIdToDelete] = useState('');
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'success'>('error');
  const [editingPromocodeId, setEditingPromocodeId] = useState<string | null>(null);
  const [editPromocodeCode, setEditPromocodeCode] = useState('');
  const [editPromocodeDescription, setEditPromocodeDescription] = useState('');
  const [editPromocodeDescriptionDe, setEditPromocodeDescriptionDe] = useState('');
  const [editPromocodeDescriptionEn, setEditPromocodeDescriptionEn] = useState('');
  const [editPromocodeDescriptionRu, setEditPromocodeDescriptionRu] = useState('');
  const [editPromocodeExpiryDate, setEditPromocodeExpiryDate] = useState<Date | null>(null);
  const [editPromocodeForFirstPurchase, setEditPromocodeForFirstPurchase] = useState(false);
  const [isCheckingPromocodeUsage, setIsCheckingPromocodeUsage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);



 const wrapperBox = {
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };

  // Функция для перехода к клиенту
  const handleShowClient = (tlgid: string) => { 
    navigate(`/clients-page?tlgid=${tlgid}`);
  };

  // получить список промокодов
  useEffect(() => {
    const fetchPromocodes = async () => {
      setIsLoading(true);
      try {
        // Загружаем общие промокоды
        const promocodes = await axios.get('/admin_get_promocodes');
        console.log('GENERAL PROMOCODES=', promocodes.data);
        //@ts-ignore
        setArrayPromocodesForRender(promocodes.data);
        
        // Загружаем персональные промокоды
        const personalPromocodes = await axios.get('/admin_get_personal_promocodes');
        console.log('PERSONAL PROMOCODES=', personalPromocodes.data);
        //@ts-ignore
        setArrayPersonalPromocodesForRender(personalPromocodes.data);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromocodes();
  }, []);

  // Обработчик смены вкладок
  //@ts-ignore
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Получить текущий массив промокодов в зависимости от активной вкладки
  const getCurrentPromocodes = () => {
    return activeTab === 0 ? arrayPromocodesForRender : arrayPersonalPromocodesForRender;
  };

  // Обновить текущий массив промокодов
  const updateCurrentPromocodes = (updateFn: any) => {
    if (activeTab === 0) {
      setArrayPromocodesForRender(updateFn);
    } else {
      setArrayPersonalPromocodesForRender(updateFn);
    }
  };

  

  // Функция для деактивации промокода
  const handleDeactivatePromocode = async (promocodeId: string) => {
    setIsCheckingPromocodeUsage(true);
    
    try {
      const endpoint = activeTab === 0 ? '/admin_deactivate_promocode' : '/admin_deactivate_personal_promocode';
      const deactivateResponse = await axios.post(endpoint, {
        id: promocodeId
      });

      console.log('Deactivate response:', deactivateResponse.data);
      
      if (deactivateResponse.data.status === 'ok') {
        // Удаляем деактивированный промокод из текущего массива
        //@ts-ignore
        updateCurrentPromocodes(prev => prev.filter(promocode => promocode._id !== promocodeId));
        
        // Закрываем модальное окно
        setOpenModal(false);
        
        setSnackbarMessage('Promocode deactivated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Promocode deactivated successfully:', deactivateResponse.data.promocode);
      } else {
        console.error('Deactivate failed with response:', deactivateResponse.data);
        setSnackbarMessage(deactivateResponse.data.error || 'Failed to deactivate promocode');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setOpenModal(false);
      }
    } catch (error: any) {
      console.error('Error deactivating promocode:', error);
      
      // Закрываем модальное окно
      setOpenModal(false);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(`Error: ${error.response.data.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error deactivating promocode. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsCheckingPromocodeUsage(false);
    }
  };

  // Функция для начала редактирования
  const handleStartEdit = (promocode: any) => {
    setEditingPromocodeId(promocode._id);
    setEditPromocodeCode(promocode.code);
    setEditPromocodeDescription(promocode.description_admin);
    setEditPromocodeDescriptionDe(promocode.description_users_de || '');
    setEditPromocodeDescriptionEn(promocode.description_users_en || '');
    setEditPromocodeDescriptionRu(promocode.description_users_ru || '');
    setEditPromocodeExpiryDate(promocode.expiryDate ? new Date(promocode.expiryDate) : null);
    setEditPromocodeForFirstPurchase(promocode.forFirstPurshase || false);
  };

  // Функция для отмены редактирования
  const handleCancelEdit = () => {
    setEditingPromocodeId(null);
    setEditPromocodeCode('');
    setEditPromocodeDescription('');
    setEditPromocodeDescriptionDe('');
    setEditPromocodeDescriptionEn('');
    setEditPromocodeDescriptionRu('');
    setEditPromocodeExpiryDate(null);
    setEditPromocodeForFirstPurchase(false);
  };

  // Функция для сохранения изменений
  const handleSaveEdit = async (promocodeId: string) => {
    // Валидация обязательных полей
    if (!editPromocodeCode.trim() || !editPromocodeDescription.trim() || 
        !editPromocodeDescriptionDe.trim() || !editPromocodeDescriptionEn.trim() || 
        !editPromocodeDescriptionRu.trim() || !editPromocodeExpiryDate) {
      setSnackbarMessage('All fields are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const endpoint = activeTab === 0 ? '/admin_update_promocode' : '/admin_update_personal_promocode';
      const response = await axios.post(endpoint, {
        id: promocodeId,
        code: editPromocodeCode.trim(),
        description_admin: editPromocodeDescription.trim(),
        description_users_de: editPromocodeDescriptionDe.trim(),
        description_users_en: editPromocodeDescriptionEn.trim(),
        description_users_ru: editPromocodeDescriptionRu.trim(),
        expiryDate: editPromocodeExpiryDate,
        forFirstPurchase: editPromocodeForFirstPurchase
      });

      if (response.data.status === 'ok') {
        // Обновляем промокод в текущем массиве
        //@ts-ignore
        updateCurrentPromocodes(prev => 
          //@ts-ignore
          prev.map(promocode => 
            //@ts-ignore
            promocode._id === promocodeId ? response.data.promocode : promocode
          )
        );
        
        // Сбрасываем состояние редактирования
        handleCancelEdit();
        
        setSnackbarMessage('Promocode updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Promocode updated successfully:', response.data.promocode);
      }
    } catch (error: any) {
      console.error('Error updating promocode:', error);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error updating promocode. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  // Обработчик нажатия Enter для редактирования
  const handleEditKeyPress = (event: React.KeyboardEvent, promocodeId: string) => {
    if (event.key === 'Enter') {
      handleSaveEdit(promocodeId);
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Обработчик потери фокуса для полей редактирования
  const handleEditBlur = (event: React.FocusEvent) => {
    // Проверяем, что фокус ушел не на другой input редактирования и не на кнопки Save/Cancel
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && (
      relatedTarget.closest('[data-edit-input]') || 
      relatedTarget.closest('[data-edit-button]')
    )) {
      return; // Не отменяем, если фокус на связанных элементах
    }
    
    // Отменяем редактирование с небольшой задержкой
    setTimeout(() => {
      if (editingPromocodeId) {
        handleCancelEdit();
      }
    }, 150);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
          <Typography variant="h4" component="h4">
            Promocodes settings
          </Typography>
           <Typography variant="body1" sx={{mt:3}} >
        General promocodes - promocodes which can be used by all users
      </Typography>
           <Typography variant="body1" >
        Personal promocodes - promocode which can be used by one choosed user
      </Typography>
        </Box>

        <Box sx={{ ...sectionBox, display: 'flex', gap: '20px' }}>
          <Button
            variant="contained"
            startIcon={<AddCircleSharpIcon />}
            onClick={() => navigate('/add_new_promocode-page')}
          >
            Add general promocode
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddCircleSharpIcon />}
            onClick={() => navigate('/add_new_personal_promocode-page')}
            sx={{backgroundColor: '#0e4f8fff'}}
          >
            Add personal promocode
          </Button>
        </Box> 

        <Box sx={sectionBox}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="promocodes tabs">
            <Tab label="General" />
            <Tab label="Personal" />
          </Tabs>
        </Box>

        <Box sx={sectionBox}>
          {getCurrentPromocodes().length === 0 ? (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 4, 
                border: 1, 
                borderColor: 'lightgrey', 
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                No promocodes found
              </Typography>
              
            </Box>
          ) : (
            getCurrentPromocodes().map((promocode: any) => (
              <Stack
                key={promocode._id}
                spacing={1}
                direction="row"
                sx={{
                  border: 1,
                  p: 1,
                  mb: 1,
                  borderRadius: 3,
                  borderColor: 'lightgrey',
                  // alignItems: 'center',
                }}
              >
                <LabelIcon color="primary" sx={{ mr: 1 }} />
                
                <Box sx={{ flexGrow: 1 }}>
                  {editingPromocodeId === promocode._id ? (
                    // Режим редактирования
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                          size="small"
                          label="Promocode"
                          value={editPromocodeCode}
                          onChange={(e) => setEditPromocodeCode(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, promocode._id)}
                          onBlur={handleEditBlur}
                          data-edit-input
                          autoFocus
                        />
                        <TextField
                          size="small"
                          label="Description for admin"
                          value={editPromocodeDescription}
                          onChange={(e) => setEditPromocodeDescription(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, promocode._id)}
                          onBlur={handleEditBlur}
                          data-edit-input
                        />
                        <TextField
                          size="small"
                          label="Description for users (DE)"
                          value={editPromocodeDescriptionDe}
                          onChange={(e) => setEditPromocodeDescriptionDe(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, promocode._id)}
                          onBlur={handleEditBlur}
                          data-edit-input
                        />
                        <TextField
                          size="small"
                          label="Description for users (EN)"
                          value={editPromocodeDescriptionEn}
                          onChange={(e) => setEditPromocodeDescriptionEn(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, promocode._id)}
                          onBlur={handleEditBlur}
                          data-edit-input
                        />
                        <TextField
                          size="small"
                          label="Description for users (RU)"
                          value={editPromocodeDescriptionRu}
                          onChange={(e) => setEditPromocodeDescriptionRu(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, promocode._id)}
                          onBlur={handleEditBlur}
                          data-edit-input
                        />
                        <DatePicker
                          label="Expire Date"
                          value={editPromocodeExpiryDate}
                          onChange={(newValue) => setEditPromocodeExpiryDate(newValue)}
                          format="dd MMM yyyy"
                          slotProps={{
                            textField: {
                              size: "small",
                              onBlur: handleEditBlur,
                              //@ts-ignore
                              'data-edit-input': true
                            }
                          }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={editPromocodeForFirstPurchase}
                              onChange={(e) => setEditPromocodeForFirstPurchase(e.target.checked)}
                              data-edit-input
                            />
                          }
                          label="For first purchase only"
                        />
                      </Box>
                    </LocalizationProvider>
                  ) : (
                    // Режим просмотра
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {promocode.code}
                        </Typography>
                       
                        {promocode.saleInPercent > 0 && (
                          <Chip
                            label={`-${promocode.saleInPercent}% discount for ${promocode.forFirstPurshase ? 'first purchase' : 'all purchases'}`}
                            variant="filled"
                            size="small"
                            color="warning"
                          />
                        )}
                      </Box>

                      {activeTab === 1 &&    
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                         client telegram id: {promocode.tlgid.tlgid}
                        </Typography>
                      }

                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {promocode.description_admin}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expires: {formatDate(promocode.expiryDate)}
                      </Typography>
                      
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {editingPromocodeId === promocode._id ? (
                    // Кнопки в режиме редактирования
                    <>
                      <Tooltip title="Save changes">
                        <IconButton
                          aria-label="save"
                          color="success"
                          data-edit-button
                          onClick={() => handleSaveEdit(promocode._id)}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Cancel editing">
                        <IconButton
                          aria-label="cancel"
                          color="default"
                          data-edit-button
                          onClick={handleCancelEdit}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    // Кнопки в режиме просмотра
                    <>
                      <Tooltip title="Edit promocode">
                        <IconButton
                          aria-label="edit"
                          color="primary"
                          onClick={() => handleStartEdit(promocode)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Кнопка Show client только для персональных промокодов */}
                      {activeTab === 1 && promocode.tlgid && (
                        <Tooltip title="Show client">
                          <IconButton
                            aria-label="show-client"
                            color="info"
                            onClick={() => handleShowClient(promocode.tlgid.tlgid)}
                          >
                            <PersonIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Deactivate promocode">
                        <IconButton
                          aria-label="deactivate"
                          onClick={() => {
                            setPromocodeCode(promocode.code);
                            setIdToDelete(promocode._id);
                            setOpenModal(true);
                          }}
                          sx={{ color: red[500] }}
                        >
                          <StopCircleIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Stack>
            ))
          )}
        </Box>
      </Box>
      
      {/* Модальное окно для подтверждения удаления */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
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
            Deactivate Promocode
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to deactivate promocode "{promocodeCode}"? 
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            
            <Button 
              variant="contained" 
              color="error"
              disabled={isCheckingPromocodeUsage}
              onClick={() => {
                handleDeactivatePromocode(idToDelete);
              }}
              startIcon={isCheckingPromocodeUsage ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isCheckingPromocodeUsage ? 'Processing...' : 'Deactivate'}
            </Button>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar для ошибок валидации */}
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
    </>
  );
};