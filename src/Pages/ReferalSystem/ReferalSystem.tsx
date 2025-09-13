import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import CircularProgress from '@mui/material/CircularProgress';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';

import GroupIcon from '@mui/icons-material/Group';
import AddCardIcon from '@mui/icons-material/AddCard';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CancelIcon from '@mui/icons-material/Cancel';
import { red } from '@mui/material/colors';

export const ReferalSystem : FC = () => {
  // const navigate = useNavigate();

  const [arrayItemsForRender, setArrayItemsForRender] = useState([]);
  const [arrayPurchaseItemsForRender, setArrayPurchaseItemsForRender] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [idToDelete, setIdToDelete] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newQty, setNewQty] = useState('');
  const [newSale, setNewSale] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'success'>('error');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editSale, setEditSale] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPurchaseSale, setEditPurchaseSale] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingItem, setIsSavingItem] = useState(false);

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

  // получить список записей referals_promoForQuantity и referals_promoForPurchase
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const [quantityItems, purchaseItems] = await Promise.all([
          axios.get('/referals_promoForQuantity'),
          axios.get('/referals_promoForPurchase')
        ]);

        console.log('QUANTITY ITEMS=', quantityItems.data);
        console.log('PURCHASE ITEMS=', purchaseItems.data);

        //@ts-ignore
        setArrayItemsForRender(quantityItems.data);
        //@ts-ignore
        setArrayPurchaseItemsForRender(purchaseItems.data);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Функция для создания новой записи
  const handleCreateItem = async () => {
    // Валидация обязательных полей
    if (!newQty.trim() || !newSale.trim() || !newDescription.trim()) {
      setSnackbarMessage('All fields are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Валидация положительных значений
    const qtyValue = Number(newQty.trim());
    const saleValue = Number(newSale.trim());
    if (isNaN(qtyValue) || qtyValue <= 0) {
      setSnackbarMessage('Qty must be a positive number');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (isNaN(saleValue) || saleValue <= 0) {
      setSnackbarMessage('Sale must be a positive number');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsSavingItem(true);
    try {
      const response = await axios.post('/referals_promoForQuantity', {
        qty: parseInt(newQty.trim()),
        sale: parseInt(newSale.trim()),
        description: newDescription.trim()
      });

      if (response.data.status === 'ok') {
        // Добавляем новую запись в массив
        //@ts-ignore
        setArrayItemsForRender(prev => [response.data.item, ...prev]);
        
        // Сбрасываем состояние
        resetAddingState();
        
        setSnackbarMessage('Item created successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Item created successfully:', response.data.item);
      }
    } catch (error: any) {
      console.error('Error creating item:', error);
      
      if (error.response?.data?.error) {
        setSnackbarMessage(error.response.data.error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error creating item. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsSavingItem(false);
    }
  };

  // Функция для смены табов
  // @ts-ignore
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };


  // Функция сброса состояния
  const resetAddingState = () => {
    setNewQty('');
    setNewSale('');
    setNewDescription('');
    setIsAddingItem(false);
  };


  // Обработчик нажатия Enter
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateItem();
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

  // Функция для удаления элемента
  const handleDeleteItem = async (itemId: string) => {
    try {
      const deleteResponse = await axios.delete(`/referals_promoForQuantity/${itemId}`);
      
      if (deleteResponse.data.status === 'ok') {
        // Удаляем элемент из массива
        //@ts-ignore
        setArrayItemsForRender(prev => prev.filter(item => item._id !== itemId));
        
        // Закрываем модальное окно
        setOpenModal(false);
        
        setSnackbarMessage('Item deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Item deleted successfully:', deleteResponse.data.deletedItem);
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      
      // Закрываем модальное окно
      setOpenModal(false);
      
      setSnackbarMessage('Error deleting item. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Функция для начала редактирования
  const handleStartEdit = (item: any) => {
    setEditingItemId(item._id);
    setEditQty(item.qty.toString());
    setEditSale(item.sale.toString());
    setEditDescription(item.description);
  };

  // Функция для начала редактирования Purchase
  const handleStartPurchaseEdit = (item: any) => {
    setEditingItemId(item._id);
    setEditPurchaseSale(item.sale.toString());
  };

  // Функция для отмены редактирования
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditQty('');
    setEditSale('');
    setEditDescription('');
    setEditPurchaseSale('');
  };

  // Функция для сохранения изменений
  const handleSaveEdit = async (itemId: string) => {
    // Валидация обязательных полей
    if (!editQty.trim() || !editSale.trim() || !editDescription.trim()) {
      setSnackbarMessage('All fields are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Валидация положительных значений
    const qtyValue = Number(editQty.trim());
    const saleValue = Number(editSale.trim());
    if (isNaN(qtyValue) || qtyValue <= 0) {
      setSnackbarMessage('Qty must be a positive number');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (isNaN(saleValue) || saleValue <= 0) {
      setSnackbarMessage('Sale must be a positive number');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.put(`/referals_promoForQuantity/${itemId}`, {
        qty: parseInt(editQty.trim()),
        sale: parseInt(editSale.trim()),
        description: editDescription.trim()
      });

      if (response.data.status === 'ok') {
        // Обновляем элемент в массиве
        //@ts-ignore
        setArrayItemsForRender(prev => 
          prev.map(item => 
            //@ts-ignore
            item._id === itemId ? response.data.item : item
          )
        );
        
        // Сбрасываем состояние редактирования
        handleCancelEdit();
        
        setSnackbarMessage('Item updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Item updated successfully:', response.data.item);
      }
    } catch (error: any) {
      console.error('Error updating item:', error);
      
      setSnackbarMessage('Error updating item. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Функция для сохранения изменений Purchase
  const handleSavePurchaseEdit = async (itemId: string) => {
    // Валидация поля sale
    if (!editPurchaseSale.trim()) {
      setSnackbarMessage('Sale field is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Валидация на отрицательные значения
    const saleValue = Number(editPurchaseSale.trim());
    if (isNaN(saleValue) || saleValue < 0) {
      setSnackbarMessage('Sale value must be 0 or positive number');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.put(`/referals_promoForPurchase/${itemId}`, {
        sale: Number(editPurchaseSale.trim())
      });

      if (response.data.status === 'ok') {
        // Обновляем элемент в массиве
        //@ts-ignore
        setArrayPurchaseItemsForRender(prev =>
          prev.map(item =>
            //@ts-ignore
            item._id === itemId ? response.data.item : item
          )
        );

        // Сбрасываем состояние редактирования
        handleCancelEdit();

        setSnackbarMessage('Purchase item updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        console.log('Purchase item updated successfully:', response.data.item);
      }
    } catch (error: any) {
      console.error('Error updating purchase item:', error);

      setSnackbarMessage('Error updating purchase item. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Обработчик нажатия Enter для редактирования
  const handleEditKeyPress = (event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter') {
      handleSaveEdit(itemId);
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Обработчик нажатия Enter для редактирования Purchase
  const handlePurchaseEditKeyPress = (event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter') {
      handleSavePurchaseEdit(itemId);
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Функция для удаления Purchase элемента
  const handleDeletePurchaseItem = async (itemId: string) => {
    try {
      const deleteResponse = await axios.delete(`/referals_promoForPurchase/${itemId}`);

      if (deleteResponse.data.status === 'ok') {
        // Удаляем элемент из массива
        //@ts-ignore
        setArrayPurchaseItemsForRender(prev => prev.filter(item => item._id !== itemId));

        // Закрываем модальное окно
        setOpenModal(false);

        setSnackbarMessage('Purchase item deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        console.log('Purchase item deleted successfully:', deleteResponse.data.deletedItem);
      }
    } catch (error: any) {
      console.error('Error deleting purchase item:', error);

      // Закрываем модальное окно
      setOpenModal(false);

      setSnackbarMessage('Error deleting purchase item. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
      if (editingItemId) {
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

     
          <Typography variant="h4" component="h4">
            Referal system
          </Typography>
       </Box>


        <Box sx={sectionBox}>

           <Typography variant="body1" sx={{mt:3}} >
        There are two types of reward for referal inviting:
      </Typography>
           <Typography variant="body1" >
        1) for quantity of invited referals - we give to referer promocodes.
        </Typography>

          <Typography variant="body1" >
        2) for purchase of invited referals - we present cashback points to referers
        </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="referal system tabs">
            <Tab label="for quantity" />
            <Tab label="for purchase" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <>
        <Box sx={sectionBox}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color={isAddingItem ? "success" : "primary"}
              startIcon={isAddingItem && !isSavingItem ? <SaveIcon /> : isAddingItem && isSavingItem ? <CircularProgress size={20} color="inherit" /> : <AddCircleSharpIcon />}
              data-save-button
              disabled={isSavingItem}
              onClick={() => {
                if (isAddingItem) {
                  handleCreateItem();
                } else {
                  setIsAddingItem(true);
                }
              }}
            >
              {isAddingItem ? (isSavingItem ? 'Saving...' : 'Save item') : 'Add new item'}
            </Button>
            
            {isAddingItem && (
              <TextField
                size="small"
                placeholder="Qty"
                type="number"
                value={newQty}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number(value) > 0 && !isNaN(Number(value)))) {
                    setNewQty(value);
                  }
                }}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                data-tag-input
                sx={{ width: 120 }}
                autoFocus
                inputProps={{ min: 1 }}
              />
            )}
            
            {isAddingItem && (
              <TextField
                size="small"
                placeholder="Sale %"
                type="number"
                value={newSale}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number(value) > 0 && !isNaN(Number(value)))) {
                    setNewSale(value);
                  }
                }}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                data-tag-input
                sx={{ width: 120 }}
                inputProps={{ min: 1 }}
              />
            )}

            {isAddingItem && (
              <TextField
                size="small"
                placeholder="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                data-tag-input
                sx={{ width: 200 }}
              />
            )}
          </Box>
        </Box>

        <Box sx={sectionBox}>
          {arrayItemsForRender.length === 0 ? (
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
                No items found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first item to get started.
              </Typography>
            </Box>
          ) : (
            arrayItemsForRender
              .sort((a: any, b: any) => a.qty - b.qty)
              .map((item: any) => (
              <Stack
                key={item._id}
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
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                
                <Box sx={{ flexGrow: 1 }}>
                  {editingItemId === item._id ? (
                    // Режим редактирования
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={editQty}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (Number(value) > 0 && !isNaN(Number(value)))) {
                            setEditQty(value);
                          }
                        }}
                        onKeyPress={(e) => handleEditKeyPress(e, item._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Qty"
                        sx={{ width: 120 }}
                        autoFocus
                        inputProps={{ min: 1 }}
                      />
                      <TextField
                        size="small"
                        type="number"
                        value={editSale}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (Number(value) > 0 && !isNaN(Number(value)))) {
                            setEditSale(value);
                          }
                        }}
                        onKeyPress={(e) => handleEditKeyPress(e, item._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Sale %"
                        sx={{ width: 120 }}
                        inputProps={{ min: 1 }}
                      />
                      <TextField
                        size="small"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, item._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Description"
                        sx={{ width: 200 }}
                      />
                    </Box>
                  ) : (
                    // Режим просмотра
                    <>
                      <Typography variant="body1" component="div">
                        quantity of referals: {item.qty} 
                      </Typography>
                      <Typography variant="body1" component="div">
                         sale promocode for referer: {item.sale}% 
                      </Typography>
                      <Typography variant="body2" component="div">
                         description: {item.description}
                      </Typography>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {editingItemId === item._id ? (
                    // Кнопки в режиме редактирования
                    <>
                      <Tooltip title="Save changes">
                        <IconButton
                          aria-label="save"
                          color="success"
                          data-edit-button
                          onClick={() => handleSaveEdit(item._id)}
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
                      <Tooltip title="Edit item">
                        <IconButton
                          aria-label="edit"
                          color="primary"
                          onClick={() => handleStartEdit(item)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete item">
                        <IconButton
                          aria-label="delete"
                          onClick={() => {
                            setItemTitle(`Qty: ${item.qty}`);
                            setIdToDelete(item._id);
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
        </>
        )}

        {activeTab === 1 && (
          <>

        <Box sx={sectionBox}>
          {arrayPurchaseItemsForRender.length === 0 ? (
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
                No purchase items found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first purchase item to get started.
              </Typography>
            </Box>
          ) : (
            arrayPurchaseItemsForRender
              .sort((a: any, b: any) => a.purchaseAmount - b.purchaseAmount)
              .map((item: any) => (
              <Stack
                key={item._id}
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
                <AddCardIcon color="primary" sx={{ mr: 1 }} />

                <Box sx={{ flexGrow: 1 }}>
                  {editingItemId === item._id ? (
                    // Режим редактирования - только поле sale
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="body1" component="div">
                        cashback points to referer for each purchase of his referal: {item.purchaseAmount}
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={editPurchaseSale}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
                            setEditPurchaseSale(value);
                          }
                        }}
                        onKeyPress={(e) => handlePurchaseEditKeyPress(e, item._id)}
                        onBlur={handleEditBlur}
                        data-edit-input
                        placeholder="Sale %"
                        sx={{ width: 80 }}
                        autoFocus
                        inputProps={{ min: 0 }}
                      />
                      <Typography variant="body1" component="div">%</Typography>
                      <Typography variant="body2" component="div">
                        description: {item.description}
                      </Typography>
                    </Box>
                  ) : (
                    // Режим просмотра
                    <>
                      <Typography variant="body1" component="div">
                         cashback points to referer for each purchase of his referal: {item.sale}%
                      </Typography>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {editingItemId === item._id ? (
                    // Кнопки в режиме редактирования
                    <>
                      <Tooltip title="Save changes">
                        <IconButton
                          aria-label="save"
                          color="success"
                          data-edit-button
                          onClick={() => handleSavePurchaseEdit(item._id)}
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
                      <Tooltip title="Edit item">
                        <IconButton
                          aria-label="edit"
                          color="primary"
                          onClick={() => handleStartPurchaseEdit(item)}
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
        </>
        )}
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
            Delete Item
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to delete item "{itemTitle}"?
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                if (activeTab === 0) {
                  handleDeleteItem(idToDelete);
                } else {
                  handleDeletePurchaseItem(idToDelete);
                }
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