import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';


import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

export const CashbackBall: FC = () => {

  const [arrayCashbackForRender, setArrayCashbackForRender] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'success'>('error');
  const [editingCashbackId, setEditingCashbackId] = useState<string | null>(null);
  const [editCashbackSum, setEditCashbackSum] = useState('');
  const [editCashbackPercent, setEditCashbackPercent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Обработчик клика для отмены редактирования при клике вне области
  const handleClickOutside = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (editingCashbackId && !target.closest('[data-edit-container]')) {
      handleCancelEdit();
    }
  };

  const wrapperBox = {
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };

  // получить список настроек cashback
  useEffect(() => {
    const fetchCashbackSettings = async () => {
      setIsLoading(true);
      try {
        const cashbackSettings = await axios.get('/admin_get_cashbackball');
        console.log('CASHBACK SETTINGS=', cashbackSettings.data);
        
        //@ts-ignore
        setArrayCashbackForRender(cashbackSettings.data);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashbackSettings();
  }, []);

 


 

  // Обработчик потери фокуса
  // const handleBlur = (event: React.FocusEvent) => {
  //   // Проверяем, что фокус ушел не на другой input и не на кнопку Save
  //   const relatedTarget = event.relatedTarget as HTMLElement;
  //   if (relatedTarget && (
  //     relatedTarget.closest('[data-cashback-input]') || 
  //     relatedTarget.closest('[data-save-button]')
  //   )) {
  //     return; // Не сбрасываем, если фокус на связанных элементах
  //   }
    
  //   // Сбрасываем состояние только если фокус ушел за пределы компонента
  //   setTimeout(() => {
  //     resetAddingState();
  //   }, 150); // Небольшая задержка для корректной работы
  // };

  

  // Функция для начала редактирования
  const handleStartEdit = (cashback: any) => {
    setEditingCashbackId(cashback._id);
    setEditCashbackSum(cashback.sum.toString());
    setEditCashbackPercent(cashback.percent.toString());
    // setEditCashbackName(cashback.name);
  };

  // Функция для отмены редактирования
  const handleCancelEdit = () => {
    setEditingCashbackId(null);
    setEditCashbackSum('');
    setEditCashbackPercent('');
  };

  // Функция для сохранения изменений
  const handleSaveEdit = async (cashbackId: string) => {
    // Валидация обязательных полей
    if (!editCashbackSum.trim() || !editCashbackPercent.trim()) {
      setSnackbarMessage('Sum and percent are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (isNaN(Number(editCashbackSum)) || Number(editCashbackSum) < 0) {
      setSnackbarMessage('Sum must be a positive number');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (isNaN(Number(editCashbackPercent)) || Number(editCashbackPercent) <= 0 || Number(editCashbackPercent) > 100) {
      setSnackbarMessage('Percent must be between 1 and 100');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.post('/admin_update_cashbackball', {
        id: cashbackId,
        sum: parseFloat(editCashbackSum.trim()),
        percent: parseFloat(editCashbackPercent.trim()),
      });

      if (response.data.status === 'ok') {
        // Обновляем настройку в массиве
        //@ts-ignore
        setArrayCashbackForRender(prev => 
          prev.map(cashback => 
            //@ts-ignore
            cashback._id === cashbackId ? response.data.cashbackSetting : cashback
          )
        );
        
        // Сбрасываем состояние редактирования
        handleCancelEdit();
        
        setSnackbarMessage('Cashback setting updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Cashback setting updated successfully:', response.data.cashbackSetting);
      }
    } catch (error: any) {
      console.error('Error updating cashback setting:', error);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error updating cashback setting. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  // Обработчик нажатия Enter для редактирования
  const handleEditKeyPress = (event: React.KeyboardEvent, cashbackId: string) => {
    if (event.key === 'Enter') {
      handleSaveEdit(cashbackId);
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
      if (editingCashbackId) {
        handleCancelEdit();
      }
    }, 150);
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

      <Box sx={wrapperBox} onClick={handleClickOutside}>
        
        

        
        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4">
            Cashback Settings
          </Typography>
        </Box>

        <Box sx={sectionBox}>

            <Typography variant="body1" gutterBottom>
                Three level cashback system.
                The bigger total amounts of clients purchase - the bigger cashback he can get.
            </Typography>
        </Box>
        


        <Box sx={sectionBox}>
          {arrayCashbackForRender.length === 0 ? (
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
                No cashback settings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first cashback setting to get started.
              </Typography>
            </Box>
          ) : (
            arrayCashbackForRender.map((cashback: any) => (
              <Stack
                key={cashback._id}
                spacing={1}
                direction="row"
                sx={{
                  border: 1,
                  p: 1,
                  mb: 1,
                  borderRadius: 3,
                  borderColor: 'lightgrey',
                  alignItems: 'center',
                }}
              >
                <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
                
                <Box sx={{ flexGrow: 1 }}>
                  {editingCashbackId === cashback._id ? (
                    // Режим редактирования
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }} data-edit-container>
                      {/* <TextField
                        size="small"
                        value={editCashbackName}
                        onChange={(e) => setEditCashbackName(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, cashback._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Name"
                        autoFocus
                      /> */}
                      <TextField
                        size="small"
                        value={editCashbackSum}
                        type="number"
                        onChange={(e) => setEditCashbackSum(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, cashback._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Sum"
                      />
                      <TextField
                        size="small"
                        value={editCashbackPercent}
                        type="number"
                        onChange={(e) => setEditCashbackPercent(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, cashback._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Percent"
                        inputProps={{ min: 1, max: 100 }}
                      />
                    </Box>
                  ) : (
                    // Режим просмотра
                    <>
                      <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                        {cashback.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total amount of purchase ≥ {cashback.sum} € | Percent: {cashback.percent}%
                      </Typography>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }} data-edit-container>
                  {editingCashbackId === cashback._id ? (
                    // Кнопки в режиме редактирования
                    <>
                      <Tooltip title="Save changes">
                        <IconButton
                          aria-label="save"
                          color="success"
                          data-edit-button
                          onClick={() => handleSaveEdit(cashback._id)}
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
                      <Tooltip title="Edit cashback setting">
                        <IconButton
                          aria-label="edit"
                          color="primary"
                          onClick={() => handleStartEdit(cashback)}
                        >
                          <EditIcon />
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
