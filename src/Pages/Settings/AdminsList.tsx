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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CancelIcon from '@mui/icons-material/Cancel';
import { red } from '@mui/material/colors';

interface Admin {
  _id: string;
  tlgid: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminsList: FC = () => {
  const navigate = useNavigate();

  const [arrayAdminsForRender, setArrayAdminsForRender] = useState<Admin[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [idToDelete, setIdToDelete] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminTlgid, setNewAdminTlgid] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminTlgid, setEditAdminTlgid] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

 const wrapperBox = {
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };

  // получить список администраторов
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true)
      try {
        const admins = await axios.get('/admin_get_admins');
        console.log('ADMINS=', admins.data);
        
        setArrayAdminsForRender(admins.data);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        setSnackbarMessage('Error loading admins list');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false)
      }
    };

    fetchAdmins();
  }, []);

  // Функция для создания нового администратора
  const handleCreateAdmin = async () => {
    // Валидация обязательных полей
    if (!newAdminName.trim() || !newAdminTlgid.trim()) {
      setSnackbarMessage('Both name and tlgid are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Валидация tlgid (должен быть числом)
    if (isNaN(Number(newAdminTlgid))) {
      setSnackbarMessage('tlgid must be a number');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsSaveLoading(true);

    try {
      const response = await axios.post('/admin_add_admin', {
        name: newAdminName.trim(),
        tlgid: Number(newAdminTlgid.trim())
      });

      if (response.data.status === 'ok') {
        // Добавляем нового администратора в массив
        setArrayAdminsForRender(prev => [response.data.admin, ...prev]);
        
        // Сбрасываем состояние
        resetAddingState();
        
        setSnackbarMessage('Admin created successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Admin created successfully:', response.data.admin);
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error creating admin. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsSaveLoading(false);
    }
  };

  // Функция сброса состояния
  const resetAddingState = () => {
    setNewAdminName('');
    setNewAdminTlgid('');
    setIsAddingAdmin(false);
  };

  // Обработчик нажатия Enter
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateAdmin();
    }
  };

  // Обработчик потери фокуса
  const handleBlur = (event: React.FocusEvent) => {
    // Проверяем, что фокус ушел не на другой input и не на кнопку Save
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && (
      relatedTarget.closest('[data-admin-input]') || 
      relatedTarget.closest('[data-save-button]')
    )) {
      return; // Не сбрасываем, если фокус на связанных элементах
    }
    
    // Сбрасываем состояние только если фокус ушел за пределы компонента
    setTimeout(() => {
      resetAddingState();
    }, 150); // Небольшая задержка для корректной работы
  };

  // Функция для удаления администратора
  const handleDeleteAdmin = async (adminId: string) => {
    setIsDeleteLoading(true);

    try {
      const response = await axios.post('/admin_delete_admin', {
        id: adminId
      });

      if (response.data.status === 'ok') {
        // Удаляем администратора из массива
        setArrayAdminsForRender(prev => prev.filter(admin => admin._id !== adminId));
        
        // Закрываем модальное окно
        setOpenModal(false);
        
        setSnackbarMessage('Admin deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Admin deleted successfully:', response.data.deletedAdmin);
      }
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      
      // Закрываем модальное окно
      setOpenModal(false);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(`Error: ${error.response.data.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error deleting admin. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Функция для начала редактирования
  const handleStartEdit = (admin: Admin) => {
    setEditingAdminId(admin._id);
    setEditAdminName(admin.name);
    setEditAdminTlgid(admin.tlgid.toString());
  };

  // Функция для отмены редактирования
  const handleCancelEdit = () => {
    setEditingAdminId(null);
    setEditAdminName('');
    setEditAdminTlgid('');
  };

  // Функция для сохранения изменений
  const handleSaveEdit = async (adminId: string) => {
    // Валидация обязательных полей
    if (!editAdminName.trim() || !editAdminTlgid.trim()) {
      setSnackbarMessage('Both name and tlgid are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Валидация tlgid (должен быть числом)
    if (isNaN(Number(editAdminTlgid))) {
      setSnackbarMessage('tlgid must be a number');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsSaveLoading(true);

    try {
      const response = await axios.post('/admin_update_admin', {
        id: adminId,
        name: editAdminName.trim(),
        tlgid: Number(editAdminTlgid.trim())
      });

      if (response.data.status === 'ok') {
        // Обновляем администратора в массиве
        setArrayAdminsForRender(prev => 
          prev.map(admin => 
            admin._id === adminId ? response.data.admin : admin
          )
        );
        
        // Сбрасываем состояние редактирования
        handleCancelEdit();
        
        setSnackbarMessage('Admin updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Admin updated successfully:', response.data.admin);
      }
    } catch (error: any) {
      console.error('Error updating admin:', error);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error updating admin. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsSaveLoading(false);
    }
  };

  // Обработчик нажатия Enter для редактирования
  const handleEditKeyPress = (event: React.KeyboardEvent, adminId: string) => {
    if (event.key === 'Enter') {
      handleSaveEdit(adminId);
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
      if (editingAdminId) {
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
            Admins list
          </Typography>
       </Box>

        <Box sx={sectionBox}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color={isAddingAdmin ? "success" : "primary"}
              startIcon={isSaveLoading && isAddingAdmin ? <CircularProgress size={20} color="inherit" /> : (isAddingAdmin ? <SaveIcon /> : <AddCircleSharpIcon />)}
              data-save-button
              disabled={isSaveLoading && isAddingAdmin}
              onClick={() => {
                if (isAddingAdmin) {
                  handleCreateAdmin();
                } else {
                  setIsAddingAdmin(true);
                }
              }}
            >
              {isAddingAdmin ? 'Save admin' : 'Add new admin'}
            </Button>
            
            {isAddingAdmin && (
              <TextField
                size="small"
                placeholder="Enter admin name"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                data-admin-input
                sx={{ width: 200 }}
                autoFocus
              />
            )}
            
            {isAddingAdmin && (
              <TextField
                size="small"
                placeholder="Enter tlgid (number)"
                value={newAdminTlgid}
                onChange={(e) => setNewAdminTlgid(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                data-admin-input
                sx={{ width: 200 }}
                type="number"
              />
            )}
          </Box>
        </Box>

        <Box sx={sectionBox}>
          {arrayAdminsForRender.length === 0 ? (
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
                No admins found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first admin to get started.
              </Typography>
            </Box>
          ) : (
            arrayAdminsForRender.map((admin: Admin) => (
              <Stack
                key={admin._id}
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
                <AdminPanelSettingsIcon color="primary" sx={{ mr: 1 }} />
                
                <Box sx={{ flexGrow: 1 }}>
                  {editingAdminId === admin._id ? (
                    // Режим редактирования
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        size="small"
                        value={editAdminName}
                        onChange={(e) => setEditAdminName(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, admin._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Admin name"
                        autoFocus
                      />
                      <TextField
                        size="small"
                        value={editAdminTlgid}
                        onChange={(e) => setEditAdminTlgid(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, admin._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="tlgid (number)"
                        type="number"
                      />
                    </Box>
                  ) : (
                    // Режим просмотра
                    <>
                      <Typography variant="body1" component="div">
                        {admin.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        tlgid: {admin.tlgid}
                      </Typography>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {editingAdminId === admin._id ? (
                    // Кнопки в режиме редактирования
                    <>
                      <Tooltip title="Save changes">
                        <IconButton
                          aria-label="save"
                          color="success"
                          data-edit-button
                          disabled={isSaveLoading && editingAdminId === admin._id}
                          onClick={() => handleSaveEdit(admin._id)}
                        >
                          {isSaveLoading && editingAdminId === admin._id ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <SaveIcon />
                          )}
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
                      <Tooltip title="Edit admin">
                        <IconButton
                          aria-label="edit"
                          color="primary"
                          onClick={() => handleStartEdit(admin)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete admin">
                        <IconButton
                          aria-label="delete"
                          onClick={() => {
                            setAdminName(admin.name);
                            setIdToDelete(admin._id);
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
            Delete Admin
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to delete admin "{adminName}"?
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            
            <Button 
              variant="contained" 
              color="error"
              disabled={isDeleteLoading}
              startIcon={isDeleteLoading ? <CircularProgress size={20} color="inherit" /> : null}
              onClick={() => {
                handleDeleteAdmin(idToDelete);
              }}
            >
              Delete
            </Button>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
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
    </>
  );
};