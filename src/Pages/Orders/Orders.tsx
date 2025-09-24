import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import CircularProgress from '@mui/material/CircularProgress';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TelegramIcon from '@mui/icons-material/Telegram';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import IconButton from '@mui/material/IconButton';

export const Orders: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // const [orders,setOrders] = useState([]);
  const [originalOrders, setOriginalOrders] = useState([]); // Оригинальный список заказов для поиска
  const [ordersForRender, setOrdersForRender] = useState([]); // Отображаемые заказы
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]); // Фильтры для Chip
  const [selectedFilterId, setSelectedFilterId] = useState('all'); // Выбранный фильтр
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserSearching, setIsUserSearching] = useState(false);
  const domen = import.meta.env.VITE_DOMEN;
  const jb_chat_url = import.meta.env.VITE_JB_CHAR_URL;

  // Ref для debounce таймера
  //@ts-ignore
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  //@ts-ignore
  const userDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Функция отправки сообщения клиенту о доставке
  const sendMessageToClient = async (order: any) => {
    // Проверяем, что сообщение еще не отправлено
    if (order.messageToClientAboutDelivery) {
      return;
    }

    console.log('btn pressed')

    // Проверяем, что есть дата доставки
    if (!order.eta) {
      setSnackbarMessage('Error: please set delivery date first');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.post('/user_sendTlgMessage', {
        tlgid: order.tlgid,
        eta: order.eta,
        orderId: order._id
      });

      if (response.data.status === 'ok') {
        // Обновляем статус в локальном состоянии
        const updateOrderInArray = (orders: any[]) =>
          orders.map((o: any) =>
            o._id === order._id
              ? { ...o, messageToClientAboutDelivery: true }
              : o
          );

        // @ts-ignore
        setOriginalOrders((prevOrders) => updateOrderInArray(prevOrders));
        // @ts-ignore
        setOrdersForRender((prevOrders) => updateOrderInArray(prevOrders));

        // Показываем уведомление об успешной отправке
        setSnackbarMessage('Message to client have been sent');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error sending message to client:', error);
      setSnackbarMessage('Error sending message to client');
      setSnackbarOpen(true);
    }
  };

  // Инициализация searchTerm и userSearchTerm из URL параметров
  useEffect(() => {
    const orderIdFromUrl = searchParams.get('orderId');
    if (orderIdFromUrl) {
      setSearchTerm(orderIdFromUrl);
    }
    const userIdFromUrl = searchParams.get('userId');
    if (userIdFromUrl) {
      setUserSearchTerm(userIdFromUrl);
    }
    const filterFromUrl = searchParams.get('filter');
    if (filterFromUrl) {
      setSelectedFilterId(filterFromUrl);
    }
  }, [searchParams]);

  // получить список заказов и статусов
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Загружаем заказы
        const ordersResponse = await axios.get('/admin_get_orders');
        const ordersData = ordersResponse.data.orders;

        //@ts-ignore
        // setOrders(ordersData);
        //@ts-ignore
        setOriginalOrders(ordersData); // Сохраняем оригинальный список для поиска
        //@ts-ignore
        setOrdersForRender(ordersData);

        // Загружаем статусы
        const statusesResponse = await axios.get('/admin_get_order_statuses');
        const statusesData = statusesResponse.data;

        //@ts-ignore
        setOrderStatuses(statusesData);

        // Создаем массив фильтров: All + статусы + фильтры по оплате
        const filtersArray = [
          { name: 'All', id: 'all' },
          ...statusesData.map((status: any) => ({
            name: status.name_en,
            id: status._id,
          })),
          { name: 'paid', id: 'paid', type: 'payment' },
          { name: 'not paid', id: 'not_paid', type: 'payment' },
        ];

        //@ts-ignore
        setStatusFilters(filtersArray);

        console.log('orders=', ordersResponse.data);
        console.log('statuses=', statusesData);
        console.log('filters=', filtersArray);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Выполняем поиск при изменении searchTerm или userSearchTerm (включая инициализацию из URL)
  useEffect(() => {
    if (originalOrders.length > 0) {
      searchOrders(searchTerm, userSearchTerm);
    }
  }, [searchTerm, userSearchTerm, originalOrders]);

  // Применяем фильтр из URL после загрузки данных
  useEffect(() => {
    if (originalOrders.length > 0 && selectedFilterId !== 'all') {
      statusPressedHandler(selectedFilterId);
    }
  }, [originalOrders, selectedFilterId]);

  // Функция поиска заказов по ID и telegram ID
  const searchOrders = (orderSearchValue: string, userSearchValue: string) => {
    setIsSearching(true);
    setIsUserSearching(true);

    // Если оба поиска пустые, показываем все заказы
    if (!orderSearchValue.trim() && !userSearchValue.trim()) {
      //@ts-ignore
      setOrdersForRender(originalOrders);
      setIsSearching(false);
      setIsUserSearching(false);
      // Применяем текущий фильтр если он активен
      if (selectedFilterId !== 'all') {
        statusPressedHandler(selectedFilterId);
      }
      return;
    }

    // Фильтруем заказы
    //@ts-ignore
    const filteredOrders = originalOrders.filter(order => {
      let matchesOrderId = true;
      let matchesUserId = true;

      // Проверка по order ID
      if (orderSearchValue.trim()) {
        //@ts-ignore
        matchesOrderId = order._id.toString().includes(orderSearchValue.trim());
      }

      // Проверка по telegram ID
      if (userSearchValue.trim()) {
        //@ts-ignore
        matchesUserId = order.tlgid.toString().includes(userSearchValue.trim());
      }

      return matchesOrderId && matchesUserId;
    });

    //@ts-ignore
    setOrdersForRender(filteredOrders);
    setIsSearching(false);
    setIsUserSearching(false);
  };

  // Функция для обновления URL параметров
  const updateUrlParams = (orderIdValue: string, userIdValue?: string) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (orderIdValue.trim()) {
      newSearchParams.set('orderId', orderIdValue.trim());
    } else {
      newSearchParams.delete('orderId');
    }

    if (userIdValue !== undefined) {
      if (userIdValue.trim()) {
        newSearchParams.set('userId', userIdValue.trim());
      } else {
        newSearchParams.delete('userId');
      }
    }

    setSearchParams(newSearchParams);
  };

  // Обработчик изменения поля поиска с debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Очищаем предыдущий таймер
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Устанавливаем новый таймер с задержкой 1 секунда
    debounceTimer.current = setTimeout(() => {
      updateUrlParams(value);
    }, 1000);
  };

  // Обработчик изменения поля поиска по telegram ID с debounce
  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserSearchTerm(value);

    // Очищаем предыдущий таймер
    if (userDebounceTimer.current) {
      clearTimeout(userDebounceTimer.current);
    }

    // Устанавливаем новый таймер с задержкой 1 секунда
    userDebounceTimer.current = setTimeout(() => {
      updateUrlParams(searchTerm, value);
    }, 1000);
  };

  // Обработчик нажатия Enter для order ID
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Очищаем таймер и обновляем URL немедленно
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      updateUrlParams(searchTerm);
    }
  };

  // Обработчик нажатия Enter для user ID
  const handleUserSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Очищаем таймер и обновляем URL немедленно
      if (userDebounceTimer.current) {
        clearTimeout(userDebounceTimer.current);
      }
      updateUrlParams(searchTerm, userSearchTerm);
    }
  };

  // Функция очистки поля поиска order ID
  const handleClearSearch = () => {
    setSearchTerm('');
    updateUrlParams('', userSearchTerm);
  };

  // Функция очистки поля поиска user ID
  const handleClearUserSearch = () => {
    setUserSearchTerm('');
    updateUrlParams(searchTerm, '');
  };

  // Cleanup таймера при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (userDebounceTimer.current) {
        clearTimeout(userDebounceTimer.current);
      }
    };
  }, []);

  const wrapperBox = {
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };

  // const getStatusColor = (statusObj: any) => {
  //   if (!statusObj || !statusObj.name_en) return 'default';

  //   switch (statusObj.name_en.toLowerCase()) {
  //     case 'new':
  //     case 'created':
  //       return 'success';
  //     case 'processing':
  //     case 'in progress':
  //       return 'warning';
  //     case 'completed':
  //     case 'done':
  //     case 'delivered':
  //       return 'primary';
  //     case 'cancelled':
  //     case 'canceled':
  //       return 'error';
  //     default:
  //       return 'default';
  //   }
  // };

  // const getStatusText = (statusObj: any) => {
  //   if (!statusObj) return 'Неизвестный статус';

  //   // Возвращаем локализованное название статуса
  //   return statusObj.name_en || statusObj.name_ru || statusObj.name_de || 'Неизвестный статус';
  // };

  // Обработчик фильтрации по статусу
  const statusPressedHandler = (filterId: string) => {
    setSelectedFilterId(filterId);
    console.log('filterId=', filterId);

    // Определяем базовый массив для фильтрации (учитываем поиск)
    //@ts-ignore
    let baseOrders = originalOrders;

    // Применяем фильтры поиска
    if (searchTerm.trim() || userSearchTerm.trim()) {
      //@ts-ignore
      baseOrders = originalOrders.filter(order => {
        let matchesOrderId = true;
        let matchesUserId = true;

        if (searchTerm.trim()) {
          //@ts-ignore
          matchesOrderId = order._id.toString().includes(searchTerm.trim());
        }

        if (userSearchTerm.trim()) {
          //@ts-ignore
          matchesUserId = order.tlgid.toString().includes(userSearchTerm.trim());
        }

        return matchesOrderId && matchesUserId;
      });
    }

    if (filterId === 'all') {
      //@ts-ignore
      setOrdersForRender(baseOrders);
      return;
    }

    // Фильтрация по статусу оплаты
    if (filterId === 'paid') {
      //@ts-ignore
      const filteredOrders = baseOrders.filter(
        (order: any) => order.payStatus === true
      );
      //@ts-ignore
      setOrdersForRender(filteredOrders);
      return;
    }

    if (filterId === 'not_paid') {
      //@ts-ignore
      const filteredOrders = baseOrders.filter(
        (order: any) => order.payStatus === false
      );
      //@ts-ignore
      setOrdersForRender(filteredOrders);
      return;
    }

    // Фильтруем заказы по выбранному статусу заказа
    //@ts-ignore
    const filteredOrders = baseOrders.filter(
      (order: any) => order.orderStatus?._id === filterId
    );

    //@ts-ignore
    setOrdersForRender(filteredOrders);

  };

  // Обработчик изменения статуса заказа
  const handleStatusChange = async (orderId: string, newStatusId: string) => {
    try {
      const response = await axios.post('/admin_update_order_status', {
        orderId: orderId,
        statusId: newStatusId,
      });

      if (response.data.status === 'ok') {
        // Обновляем все массивы заказов
        const updateOrderInArray = (orders: any[]) =>
          orders.map((order: any) =>
            order._id === orderId
              ? { ...order, orderStatus: response.data.order.orderStatus }
              : order
          );

        //@ts-ignore
        // setOrders(prevOrders => updateOrderInArray(prevOrders));
        //@ts-ignore
        setOriginalOrders((prevOrders) => updateOrderInArray(prevOrders));
        //@ts-ignore
        setOrdersForRender((prevOrders) => updateOrderInArray(prevOrders));

        // Показываем уведомление
        setSnackbarMessage('Information saved');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      setSnackbarMessage('Error saving information');
      setSnackbarOpen(true);
    }
  };

  // Обработчик изменения даты доставки (ETA)
  const handleEtaChange = async (orderId: string, newEta: string) => {
    try {
      // Находим текущий статус заказа
      const currentOrder = ordersForRender.find(
        (order: any) => order._id === orderId
      );
      //@ts-ignore
      const currentStatusId = currentOrder?.orderStatus?._id;

      if (!currentStatusId) {
        setSnackbarMessage('Error: Order status not found');
        setSnackbarOpen(true);
        return;
      }

      const response = await axios.post('/admin_update_order_status', {
        orderId: orderId,
        statusId: currentStatusId,
        eta: newEta,
      });

      if (response.data.status === 'ok') {
        // Обновляем все массивы заказов
        const updateOrderInArray = (orders: any[]) =>
          orders.map((order: any) =>
            order._id === orderId ? { ...order, eta: newEta } : order
          );

        //@ts-ignore
        setOriginalOrders((prevOrders) => updateOrderInArray(prevOrders));
        //@ts-ignore
        setOrdersForRender((prevOrders) => updateOrderInArray(prevOrders));

        // Показываем уведомление
        setSnackbarMessage('ETA date saved successfully');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при обновлении ETA:', error);
      setSnackbarMessage('Error saving ETA date');
      setSnackbarOpen(true);
    }
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
            Users orders
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="🔍 Search by Order ID"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              placeholder="🔍 order id..."
              disabled={isSearching}
              sx={{ maxWidth: 350 }}
              helperText={isSearching ? "Searching..." : ''}
              InputProps={{
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={handleClearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="🔍 Search by Telegram ID"
              variant="outlined"
              value={userSearchTerm}
              onChange={handleUserSearchChange}
              onKeyPress={handleUserSearchKeyPress}
              placeholder="🔍 telegram id..."
              disabled={isUserSearching}
              sx={{ maxWidth: 350 }}
              helperText={isUserSearching ? "Searching..." : ''}
              InputProps={{
                endAdornment: userSearchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear user search"
                      onClick={handleClearUserSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Box>

        {/* Фильтры */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1}>
            {statusFilters.map((filter: any) => {
              let chipColor:
                | 'primary'
                | 'error'
                | 'success'
                | 'info'
                | 'warning'
                | 'default'
                | 'secondary' = 'primary';

              // Устанавливаем цвета для фильтров оплаты
              if (filter.id === 'paid') {
                chipColor = 'success';
              } else if (filter.id === 'not_paid') {
                chipColor = 'error';
              }

              return (
                <Chip
                  key={filter.id}
                  label={filter.name}
                  variant={
                    selectedFilterId === filter.id ? 'filled' : 'outlined'
                  }
                  color={chipColor}
                  clickable
                  onClick={() => statusPressedHandler(filter.id)}
                />
              );
            })}
          </Stack>
        </Box>

        <Box sx={sectionBox}>
          {(searchTerm || userSearchTerm) && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {ordersForRender.length} order{ordersForRender.length !== 1 ? 's' : ''} found
              {searchTerm && ` for order ID "${searchTerm}"`}
              {userSearchTerm && ` for telegram ID "${userSearchTerm}"`}
            </Typography>
          )}

          {ordersForRender.map((order: any) => (
            <Stack
              key={order._id}
              spacing={2}
              direction="row"
              sx={{
                border: 1,
                p: 2,
                mb: 2,
                borderRadius: 3,
                borderColor: 'lightgrey',
              }}
            >
              <div style={{ display: 'block', width: '100%' }}>
                <div>
                  <Typography component="div" variant="h6">
                    <div
                      style={{ display: 'flex', gap: 50, alignItems: 'center' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                        }}
                      >
                        <AccountCircleIcon color="action" />
                        <span>User: {order.tlgid}</span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <Chip
                          label={order.payStatus ? 'paid' : 'not paid'}
                          color={order.payStatus ? 'success' : 'error'}
                          size="small"
                          variant="filled"
                        />
                      </div>

                      <div>
                        <FormControl
                          size="small"
                          sx={{ minWidth: 120, border: 1, borderRadius: 30 }}
                        >
                          <Select
                            value={order.orderStatus?._id || ''}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                            displayEmpty
                            sx={{ fontSize: '0.875rem', borderRadius: 30 }}
                          >
                            {orderStatuses.map((status: any) => (
                              <MenuItem key={status._id} value={status._id}>
                                {status.name_en}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                      {order.orderStatus?.name_en === 'on the way' && (
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              color: order.eta ? 'black' : 'red',
                            }}
                          >
                            {order.eta
                              ? 'estimate date of delivery:'
                              : 'set estimate date of delivery:'}
                          </span>
                          <TextField
                          disabled = {order.messageToClientAboutDelivery? true : false}
                            type="date"
                            value={order.eta || ''}
                            onChange={(e) =>
                              handleEtaChange(order._id, e.target.value)
                            }
                            size="small"
                            sx={{ width: 150, mr: 5 }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                          <span
                            style={{
                              color: order.messageToClientAboutDelivery === true ? '#2e7d32' : 'white',
                              border: `1px solid ${order.messageToClientAboutDelivery === true ? '#2e7d32' : '#d32f2f'}`,
                              borderRadius: 15,
                              backgroundColor: order.messageToClientAboutDelivery === true ? '#fff' : '#d32f2f',
                              padding: '7px 10px 7px 10px ',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                              cursor: order.messageToClientAboutDelivery === true ? 'default' : 'pointer',
                              opacity: order.messageToClientAboutDelivery === true ? 0.7 : 1,
                            }}
                            onClick={() => sendMessageToClient(order)}
                          >
                            <TelegramIcon /> {order.messageToClientAboutDelivery ? 'message sent': 'send message to client'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Typography>
                </div>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ color: 'text.secondary' }}
                >
                  Order ID: {order._id}
                </Typography>

                <div style={{ marginTop: 20 }}>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: 'text.primary' }}
                  >
                    Order date: {order.formattedDate}
                  </Typography>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: 'text.primary' }}
                  >
                    <div>
                      Delivery info: {order.country} ({order.regionDelivery}),{' '}
                      {order.adress}{' '}
                    </div>
                  </Typography>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: 'text.primary' }}
                  >
                    <div>
                      Contact info: {order.name} | {order.phone}
                    </div>
                  </Typography>
                </div>

                <div style={{ marginTop: 20, marginBottom: 15 }}>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <span>
                      Items: {order.qtyItemsInOrder} {'  '} |{'  '} Total:{' '}
                      {order.totalAmount.toFixed(2)} €
                    </span>
                    {/* <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.orderStatus?._id || ''}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        displayEmpty
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {orderStatuses.map((status: any) => (
                          <MenuItem key={status._id} value={status._id}>
                            {status.name_en}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl> */}
                  </Typography>
                </div>

                <div>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                      sx={{ width: '100%' }}
                    >
                      <Typography component="span" variant="subtitle2">
                        Click - to show items in order
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      <List
                        sx={{
                          width: '100%',
                          maxWidth: 600,
                          bgcolor: 'background.paper',
                        }}
                      >
                        {order.goods.map((item: any, index: number) => (
                          <ListItem
                            alignItems="flex-start"
                            key={`${item.itemId}-${index}`}
                          >
                            <ListItemAvatar>
                              <Avatar
                                alt={item.name_en}
                                src={`${domen}${item.file?.url}`}
                              />
                            </ListItemAvatar>

                            <ListItemText
                              primary={
                                <Typography component="span" variant="body1">
                                  {item.name_en}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color: 'text.secondary',
                                      display: 'block',
                                    }}
                                  >
                                    {/* {item.qty} pcs x {item.price_eu} € ={' '}
                                    {item.qty * item.price_eu} € */}
                                    {item.qty} pcs x {item.actualPurchasePriceInEu} € ={' '}
                                    {item.qty * item.actualPurchasePriceInEu} €
                                    {item.isPurchasedBySale && <span style={{backgroundColor:'#ed6c02', padding:'2px 5px 2px 5px', marginLeft:10, color: 'white', borderRadius:10}}>by sale</span>}
                                    {item.isPurchasedByPromocode && <span style={{backgroundColor:'#ed6c02', padding:'2px 5px 2px 5px', marginLeft:10, color: 'white', borderRadius:10}}>by promocode</span>}
                                    {item.isPurchasedByCashback && <span style={{backgroundColor:'#ed6c02', padding:'2px 5px 2px 5px', marginLeft:10, color: 'white', borderRadius:10}}>written-off cashback</span>}
                                  </Typography>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color: 'text.secondary',
                                      display: 'block',
                                    }}
                                  >
                                    Delivery:{' '}
                                    {
                                      item[
                                        `delivery_price_${order.regionDelivery}`
                                      ]
                                    }{' '}
                                    € x {item.qty} ={' '}
                                    {(
                                      item[
                                        `delivery_price_${order.regionDelivery}`
                                      ] * item.qty
                                    ).toFixed(2)}{' '}
                                    €
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </div>

                <div>
                  <Tooltip title="write to user in bot">
                    <IconButton
                      aria-label="write"
                      color="primary"
                      sx={{ mr: 3, mt: 2, border: 1, borderRadius: 2 }}
                      onClick={() =>
                        window.open(`${jb_chat_url}${order.jbid}`, '_blank')
                      }
                    >
                      <TelegramIcon />
                      {''}{' '}
                      <Typography component="div" variant="body1">
                        CHAT WITH USER
                      </Typography>
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </Stack>
          ))}
        </Box>
      </Box>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes('Error') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
