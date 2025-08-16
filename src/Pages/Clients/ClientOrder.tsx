import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import TelegramIcon from '@mui/icons-material/Telegram';

import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';

export const ClientOrder: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientTlgid, clientName } = location.state || {};

  const [allOrders, setAllOrders] = useState([]); // Все заказы клиента
  const [ordersForRender, setOrdersForRender] = useState([]); // Отображаемые заказы
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]); // Фильтры для Chip
  const [selectedFilterId, setSelectedFilterId] = useState('all'); // Выбранный фильтр
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const domen = import.meta.env.VITE_DOMEN;
  const jb_chat_url = import.meta.env.VITE_JB_CHAR_URL;

  // получить список заказов и статусов для конкретного клиента
  useEffect(() => {
    if (!clientTlgid) {
      console.error('No client tlgid provided');
      navigate('/clients-page');
      return;
    }

    const fetchData = async () => {
      try {
        // Загружаем заказы
        const ordersResponse = await axios.get('/admin_get_orders');
        const allOrdersData = ordersResponse.data.orders;
        
        // Фильтруем заказы только для текущего клиента
        const clientOrders = allOrdersData.filter((order: any) => order.tlgid === clientTlgid);
        
        //@ts-ignore
        setAllOrders(clientOrders);
        //@ts-ignore
        setOrdersForRender(clientOrders);
        
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
            id: status._id
          })),
          { name: 'paid', id: 'paid', type: 'payment' },
          { name: 'not paid', id: 'not_paid', type: 'payment' }
        ];
        
        //@ts-ignore
        setStatusFilters(filtersArray);
        
        console.log('client orders=', clientOrders);
        console.log('statuses=', statusesData);
        console.log('filters=', filtersArray);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      }
    };

    fetchData();
  }, [clientTlgid, navigate]);

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

    if (filterId === 'all') {
      //@ts-ignore
      setOrdersForRender(allOrders);
      return;
    }

    // Фильтрация по статусу оплаты
    if (filterId === 'paid') {
      //@ts-ignore
      const filteredOrders = allOrders.filter((order: any) => 
        order.payStatus === true
      );
      //@ts-ignore
      setOrdersForRender(filteredOrders);
      return;
    }

    if (filterId === 'not_paid') {
      //@ts-ignore
      const filteredOrders = allOrders.filter((order: any) => 
        order.payStatus === false
      );
      //@ts-ignore
      setOrdersForRender(filteredOrders);
      return;
    }

    // Фильтруем заказы по выбранному статусу заказа
    //@ts-ignore
    const filteredOrders = allOrders.filter((order: any) => 
      order.orderStatus?._id === filterId
    );
    
    //@ts-ignore
    setOrdersForRender(filteredOrders);
  };

  // Обработчик изменения статуса заказа
  const handleStatusChange = async (orderId: string, newStatusId: string) => {
    try {
      const response = await axios.post('/admin_update_order_status', {
        orderId: orderId,
        statusId: newStatusId
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
        setAllOrders(prevOrders => updateOrderInArray(prevOrders));
        //@ts-ignore
        setOrdersForRender(prevOrders => updateOrderInArray(prevOrders));

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
      const currentOrder = ordersForRender.find((order: any) => order._id === orderId);
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
        eta: newEta
      });

      if (response.data.status === 'ok') {
        // Обновляем все массивы заказов
        const updateOrderInArray = (orders: any[]) => 
          orders.map((order: any) => 
            order._id === orderId 
              ? { ...order, eta: newEta }
              : order
          );

        //@ts-ignore
        setAllOrders(prevOrders => updateOrderInArray(prevOrders));
        //@ts-ignore
        setOrdersForRender(prevOrders => updateOrderInArray(prevOrders));

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

  return (
    <>
      <NavMenu />

      <Box sx={wrapperBox}>
        <Box sx={sectionBox}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/clients-page')}
            sx={{ mb: 2 }}
          >
            Back to Clients
          </Button>
          
          <Typography variant="h4" component="h4">
            Orders for: {clientName || `User ${clientTlgid}`}
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 1, mb: 2, color: 'text.secondary' }}>
            Total orders: {allOrders.length}
          </Typography>
        </Box>

        {/* Фильтры */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1}>
            {statusFilters.map((filter: any) => {
              let chipColor: "primary" | "error" | "success" | "info" | "warning" | "default" | "secondary" = "primary";
              const hasOrders = allOrders.length > 0;
              
              // Устанавливаем цвета для фильтров оплаты только если есть заказы
              if (hasOrders) {
                if (filter.id === 'paid') {
                  chipColor = "success";
                } else if (filter.id === 'not_paid') {
                  chipColor = "error";
                }
              } else {
                // Если нет заказов, все фильтры серые
                chipColor = "default";
              }

              return (
                <Chip
                  key={filter.id}
                  label={filter.name}
                  variant={selectedFilterId === filter.id ? 'filled' : 'outlined'}
                  color={chipColor}
                  clickable={hasOrders}
                  disabled={!hasOrders}
                  onClick={hasOrders ? () => statusPressedHandler(filter.id) : undefined}
                  sx={{
                    opacity: hasOrders ? 1 : 0.4,
                    cursor: hasOrders ? 'pointer' : 'not-allowed',
                    ...(hasOrders ? {} : {
                      '&:hover': {
                        backgroundColor: 'action.disabled'
                      }
                    })
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        <Box sx={sectionBox}>
          {ordersForRender.length === 0 ? (
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
              {allOrders.length === 0 ? (
                <>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No orders found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This client has not placed any orders yet.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No orders with that filter
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try selecting a different filter to see this client's orders.
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            ordersForRender.map((order: any) => (
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
                    <div style={{ display: 'flex', gap: 50, alignItems: 'center' }}>
                      
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <AccountCircleIcon color="action" />
                          <span>User: {order.tlgid}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          
                          <Chip 
                            label={order.payStatus ? 'paid' : 'not paid'}
                            color={order.payStatus ? 'success' : 'error'}
                            size="small"
                            variant="filled"
                          />
                        </div>

                        <div>
                            <FormControl size="small" sx={{ minWidth: 120, border:1, borderRadius:30 }}>
                              <Select
                                value={order.orderStatus?._id || ''}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                displayEmpty
                                sx={{ fontSize: '0.875rem', borderRadius:30 }}
                              >
                                {orderStatuses.map((status: any) => (
                                  <MenuItem key={status._id} value={status._id}>
                                    {status.name_en}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                        </div>
                             {order.orderStatus?.name_en === 'on the way' &&
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ 
                                    color: order.eta ? 'black' : 'red'
                                  }}>
                                    {order.eta ? 'estimate date of delivery:' : 'set estimate date of delivery:'}
                                  </span>
                                  <TextField
                                    type="date"
                                    value={order.eta || ''}
                                    onChange={(e) => handleEtaChange(order._id, e.target.value)}
                                    size="small"
                                    sx={{ width: 150 }}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                  />
                                </div>
                             }     
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
                    Order date:  {order.formattedDate}
                  </Typography>
                  
                </div>

                <div style={{ marginTop: 8 }}>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: 'text.primary' }}
                  >
                    <div>Delivery info: {order.country} ({order.regionDelivery}), {order.adress} </div> 
                  </Typography>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: 'text.primary' }}
                  >
                    <div>Contact info:  {order.name} | {order.phone}</div> 
                   
                  </Typography>
                </div>

                

                <div style={{ marginTop: 20, marginBottom: 15 }}>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 2 }}
                  >
                    <span>
                      Items: {order.qtyItemsInOrder} {'  '} |{'  '}{' '}
                      Total: {order.totalAmount.toFixed(2)} €
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
                          <ListItem alignItems="flex-start" key={`${item.itemId}-${index}`}>
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
                                    {item.qty} pcs x {item.price_eu} € = {item.qty * item.price_eu} €
                                  </Typography>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color: 'text.secondary',
                                      display: 'block',
                                    }}
                                  >
                                    Delivery: {item[`delivery_price_${order.regionDelivery}`]} € x {item.qty} = {(item[`delivery_price_${order.regionDelivery}`] * item.qty).toFixed(2)} €
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
            ))
          )}
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