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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';

import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CancelIcon from '@mui/icons-material/Cancel';
import { red } from '@mui/material/colors';

export const Tags: FC = () => {
  const navigate = useNavigate();

  const [arrayTagsForRender, setArrayTagsForRender] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [tagTitle, setTagTitle] = useState('');
  const [idToDelete, setIdToDelete] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'success'>('error');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagDescription, setEditTagDescription] = useState('');
  const [isCheckingTagUsage, setIsCheckingTagUsage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTag, setIsSavingTag] = useState(false);

//   const language = 'en';
//   const domen = import.meta.env.VITE_DOMEN;

 const wrapperBox = {
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };

  // получить список тегов
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const tags = await axios.get('/admin_get_tags');
        console.log('TAGS=', tags.data);
        
        //@ts-ignore
        setArrayTagsForRender(tags.data);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Функция для создания нового тега
  const handleCreateTag = async () => {
    // Валидация обязательных полей
    if (!newTagName.trim() || !newTagDescription.trim()) {
      setSnackbarMessage('Both name and description are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsSavingTag(true);
    try {
      const response = await axios.post('/admin_add_tag', {
        name: newTagName.trim(),
        description: newTagDescription.trim()
      });

      if (response.data.status === 'ok') {
        // Добавляем новый тег в массив
        //@ts-ignore
        setArrayTagsForRender(prev => [response.data.tag, ...prev]);
        
        // Сбрасываем состояние
        resetAddingState();
        
        setSnackbarMessage('Tag created successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Tag created successfully:', response.data.tag);
      }
    } catch (error: any) {
      console.error('Error creating tag:', error);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error creating tag. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsSavingTag(false);
    }
  };

  // Функция сброса состояния
  const resetAddingState = () => {
    setNewTagName('');
    setNewTagDescription('');
    setIsAddingTag(false);
  };

  // Обработчик нажатия Enter
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateTag();
    }
  };

  // Обработчик потери фокуса
  const handleBlur = (event: React.FocusEvent) => {
    // Проверяем, что фокус ушел не на другой input и не на кнопку Save
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && (
      relatedTarget.closest('[data-tag-input]') || 
      relatedTarget.closest('[data-save-button]')
    )) {
      return; // Не сбрасываем, если фокус на связанных элементах
    }
    
    // Сбрасываем состояние только если фокус ушел за пределы компонента
    setTimeout(() => {
      resetAddingState();
    }, 150); // Небольшая задержка для корректной работы
  };

  // Функция для проверки использования тега и удаления
  const handleDeleteTag = async (tagId: string) => {
    setIsCheckingTagUsage(true);
    
    try {
      // Сначала проверяем, используется ли тег
      const checkResponse = await axios.post('/admin_check_tag_usage', {
        tagId: tagId
      });

      console.log('Check response:', checkResponse.data);

      if (checkResponse.data.isUsed) {
        // Если тег используется, показываем предупреждение
        setSnackbarMessage(`You can't delete this tag, because some users have this tag (${checkResponse.data.usersCount} users)`);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        setOpenModal(false);
        return;
      }

      // Если тег не используется, удаляем его
      const deleteResponse = await axios.post('/admin_delete_tag', {
        id: tagId
      });

      console.log('Delete response:', deleteResponse.data);
      
      if (deleteResponse.data.status === 'ok') {
        // Удаляем тег из массива
        //@ts-ignore
        setArrayTagsForRender(prev => prev.filter(tag => tag._id !== tagId));
        
        // Закрываем модальное окно
        setOpenModal(false);
        
        setSnackbarMessage('Tag deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Tag deleted successfully:', deleteResponse.data.deletedTag);
      } else {
        console.error('Delete failed with response:', deleteResponse.data);
        setSnackbarMessage(deleteResponse.data.error || 'Failed to delete tag');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setOpenModal(false);
      }
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      
      // Закрываем модальное окно
      setOpenModal(false);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(`Error: ${error.response.data.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error deleting tag. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsCheckingTagUsage(false);
    }
  };

  // Функция для начала редактирования
  const handleStartEdit = (tag: any) => {
    setEditingTagId(tag._id);
    setEditTagName(tag.name);
    setEditTagDescription(tag.description);
  };

  // Функция для отмены редактирования
  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditTagName('');
    setEditTagDescription('');
  };

  // Функция для сохранения изменений
  const handleSaveEdit = async (tagId: string) => {
    // Валидация обязательных полей
    if (!editTagName.trim() || !editTagDescription.trim()) {
      setSnackbarMessage('Both name and description are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.post('/admin_update_tag', {
        id: tagId,
        name: editTagName.trim(),
        description: editTagDescription.trim()
      });

      if (response.data.status === 'ok') {
        // Обновляем тег в массиве
        //@ts-ignore
        setArrayTagsForRender(prev => 
          prev.map(tag => 
            //@ts-ignore
            tag._id === tagId ? response.data.tag : tag
          )
        );
        
        // Сбрасываем состояние редактирования
        handleCancelEdit();
        
        setSnackbarMessage('Tag updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Tag updated successfully:', response.data.tag);
      }
    } catch (error: any) {
      console.error('Error updating tag:', error);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error updating tag. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  // Обработчик нажатия Enter для редактирования
  const handleEditKeyPress = (event: React.KeyboardEvent, tagId: string) => {
    if (event.key === 'Enter') {
      handleSaveEdit(tagId);
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
      if (editingTagId) {
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

       <Box sx={wrapperBox}>
        
         <Box sx={sectionBox}>
          <Button
            // variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/settings-page')}
          >
            back
          </Button>
        </Box>   

        
        <Box sx={sectionBox}>

     
          <Typography variant="h4" component="h4">
            Clients tags
          </Typography>
       </Box>

        <Box sx={sectionBox}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color={isAddingTag ? "success" : "primary"}
              startIcon={isAddingTag && !isSavingTag ? <SaveIcon /> : isAddingTag && isSavingTag ? <CircularProgress size={20} color="inherit" /> : <AddCircleSharpIcon />}
              data-save-button
              disabled={isSavingTag}
              onClick={() => {
                if (isAddingTag) {
                  handleCreateTag();
                } else {
                  setIsAddingTag(true);
                }
              }}
            >
              {isAddingTag ? (isSavingTag ? 'Saving...' : 'Save tag') : 'Add new tag'}
            </Button>
            
            {isAddingTag && (
              <TextField
                size="small"
                placeholder="Enter tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                data-tag-input
                sx={{ width: 200 }}
                autoFocus
              />
            )}
            
            {isAddingTag && (
              <TextField
                size="small"
                placeholder="Enter description"
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                data-tag-input
                sx={{ width: 400 }}
              />
            )}
          </Box>
        </Box>

        <Box sx={sectionBox}>
          {arrayTagsForRender.length === 0 ? (
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
                No tags found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first tag to get started.
              </Typography>
            </Box>
          ) : (
            arrayTagsForRender.map((tag: any) => (
              <Stack
                key={tag._id}
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
                  {editingTagId === tag._id ? (
                    // Режим редактирования
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        size="small"
                        value={editTagName}
                        onChange={(e) => setEditTagName(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, tag._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Tag name"
                        autoFocus
                      />
                      <TextField
                        size="small"
                        value={editTagDescription}
                        onChange={(e) => setEditTagDescription(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, tag._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Tag description"
                      />
                    </Box>
                  ) : (
                    // Режим просмотра
                    <>
                      <Typography variant="body1" component="div">
                        {tag.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tag.description}
                      </Typography>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {editingTagId === tag._id ? (
                    // Кнопки в режиме редактирования
                    <>
                      <Tooltip title="Save changes">
                        <IconButton
                          aria-label="save"
                          color="success"
                          data-edit-button
                          onClick={() => handleSaveEdit(tag._id)}
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
                      <Tooltip title="Edit tag">
                        <IconButton
                          aria-label="edit"
                          color="primary"
                          onClick={() => handleStartEdit(tag)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete tag">
                        <IconButton
                          aria-label="delete"
                          onClick={() => {
                            setTagTitle(tag.name);
                            setIdToDelete(tag._id);
                            setOpenModal(true);
                          }}
                          sx={{ color: red[500] }}
                        >
                          <DeleteForeverIcon />
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
            Delete Tag
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to delete tag "{tagTitle}"?
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            
            <Button 
              variant="contained" 
              color="error"
              disabled={isCheckingTagUsage}
              onClick={() => {
                handleDeleteTag(idToDelete);
              }}
              startIcon={isCheckingTagUsage ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isCheckingTagUsage ? 'Checking...' : 'Delete'}
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