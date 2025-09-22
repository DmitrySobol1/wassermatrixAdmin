import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';

import IconButton from '@mui/material/IconButton';
import TelegramIcon from '@mui/icons-material/Telegram';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';



const CRM_STAGES = [
  { id: 0, name: 'Периодические рассылки', color: '#e3f2fd' },
  { id: 1, name: 'Вошел в апп', color: '#f3e5f5' },
  { id: 2, name: 'Положил в корзину, но не перешел к оплате', color: '#fff3e0' },
  { id: 3, name: 'Перешел к оплате, но прервал оплату', color: '#fff8e1' },
  { id: 4, name: 'Оплатил 1ый раз', color: '#f1f8e9' },
  { id: 5, name: 'Оплатил >1 раза', color: '#e8f5e8' },
];

export const Crm: FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [arrayUsersForRender, setArrayUsersForRender] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]); // Оригинальный список пользователей
  // const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);
  const [infoMenuAnchor, setInfoMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [promoMenuAnchor, setPromoMenuAnchor] = useState<HTMLElement | null>(null);
  const [personalPromocodes, setPersonalPromocodes] = useState<any[]>([]);
  const [isLoadingPromocodes, setIsLoadingPromocodes] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [adminDoAction, setAdminDoAction] = useState('admin do action')
  const [chipColor, setChipColor] = useState<'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'>('warning')
  
  const jb_chat_url = import.meta.env.VITE_JB_CHAR_URL;

  // Ref для debounce таймера 
  //@ts-ignore
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Инициализация searchTerm из URL параметров
  useEffect(() => {
    const tlgidFromUrl = searchParams.get('tlgid');
    if (tlgidFromUrl) {
      setSearchTerm(tlgidFromUrl);
    }
  }, [searchParams]);

  // получить список пользователей и заказов
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Загружаем пользователей
        const users = await axios.get('/admin_get_users');
        console.log('USERS=', users);

        // Загружаем теги
        const tags = await axios.get('/admin_get_tags');
        //@ts-ignore
        // setAllTags(tags.data);
        console.log('TAGS=', tags.data);

        // Загружаем заказы
        const orders = await axios.get('/admin_get_orders');
        const ordersData = orders.data.orders;
        //@ts-ignore
        // setAllOrders(ordersData);

        // Подсчитываем количество заказов для каждого пользователя
        //@ts-ignore
        const arrayUsersForRender = users.data.map((item) => {
          const userOrdersCount = ordersData.filter((order: any) => order.tlgid === item.tlgid).length;

          // Проверяем что приходит с сервера
        //   console.log('Raw user item:', item);
        //   console.log('User crmStatus before:', item.crmStatus);

          // ВАЖНО: Принудительно устанавливаем статус, если его нет
          const crmStatus = item.crmStatus || 1;
        //   console.log('User crmStatus after:', crmStatus);

          return {
            name: item.name || 'N/A',
            phone: item.phone || 'N/A',
            address: item.address || 'N/A',
            tlgid: item.tlgid,
            id: item._id,
            jbid: item.jbid,
            ordersCount: userOrdersCount,
            tags: item.tags || [],
            crmStatus: crmStatus,
            isWaitisWaitingAdminAction: item.isWaitingAdminAction || false 
          };
        });

        // console.log('BEFORE SET - formattedUsers', arrayUsersForRender);
        // console.log('BEFORE SET - User CRM statuses:', arrayUsersForRender.map((u: any) => ({
        //   name: u.name,
        //   crmStatus: u.crmStatus,
        //   id: u.id
        // })));

        setArrayUsersForRender(arrayUsersForRender);
        setOriginalUsers(arrayUsersForRender); // Сохраняем оригинальный список
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Выполняем поиск при изменении searchTerm (включая инициализацию из URL)
  useEffect(() => {
    if (originalUsers.length > 0) {
      searchUsers(searchTerm);
    }
  }, [searchTerm, originalUsers]);

  // Функция поиска пользователей по tlgid
  const searchUsers = (searchValue: string) => {
    setIsSearching(true);
    
    if (!searchValue.trim()) {
      // Если поиск пустой, показываем всех пользователей
      setArrayUsersForRender(originalUsers);
      setIsSearching(false);
      return;
    }

    // Фильтруем пользователей по tlgid
    //@ts-ignore
    const filteredUsers = originalUsers.filter(user => 
      //@ts-ignore
      user.tlgid.toString().includes(searchValue.trim())
    );

    setArrayUsersForRender(filteredUsers);
    setIsSearching(false);
  };

  // Функция для обновления URL параметров
  const updateUrlParams = (tlgidValue: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (tlgidValue.trim()) {
      newSearchParams.set('tlgid', tlgidValue.trim());
    } else {
      newSearchParams.delete('tlgid');
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

  // Обработчик нажатия Enter
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Очищаем таймер и обновляем URL немедленно
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      updateUrlParams(searchTerm);
    }
  };

  // Функция очистки поля поиска
  const handleClearSearch = () => {
    setSearchTerm('');
    updateUrlParams('');
  };

  // Cleanup таймера при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Загрузка персональных промокодов при открытии меню
  useEffect(() => {
    const fetchPersonalPromocodes = async () => {
      if (promoMenuAnchor && selectedUser) {
        setIsLoadingPromocodes(true);
        try {
          const response = await axios.get(`/admin_get_personal_promocodes/${selectedUser.id}`);
          console.log('Personal promocodes response:', response.data);
          setPersonalPromocodes(response.data.promocodes || []);
        } catch (error) {
          console.error('Error fetching personal promocodes:', error);
          setPersonalPromocodes([]);
        } finally {
          setIsLoadingPromocodes(false);
        }
      }
    };

    fetchPersonalPromocodes();
  }, [promoMenuAnchor, selectedUser]);

  // Функция для обновления тегов пользователя
  // const handleUserTagsChange = async (userId: string, selectedTagIds: string[]) => {
  //   try {
  //     const response = await axios.post('/admin_update_user_tags', {
  //       userId: userId,
  //       tagIds: selectedTagIds
  //     });

  //     if (response.data.status === 'ok') {
  //       // Обновляем локальное состояние
  //       //@ts-ignore
  //       setArrayUsersForRender(prev =>
  //         prev.map(user =>
  //           //@ts-ignore
  //           user.id === userId
  //           //@ts-ignore
  //             ? { ...user, tags: response.data.user.tags }
  //             : user
  //         )
  //       );
  //       console.log('User tags updated successfully');
  //     }
  //   } catch (error: any) {
  //     console.error('Error updating user tags:', error);
  //     alert('Error updating user tags: ' + (error.response?.data?.error || error.message));
  //   }
  // };

  // Обработчики для действий администратора
  const handleChipClick = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setSelectedUser(user);

    // Проверяем crmStatus пользователя
    if (user.crmStatus === 2) {
      // Показываем обычное меню действий для crmStatus == 2
      setActionMenuAnchor(event.currentTarget);
    } else if (user.crmStatus === 3) {
      // Показываем информационное меню для crmStatus == 3
      setInfoMenuAnchor(event.currentTarget);
    }
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setPromoMenuAnchor(null);
    setSelectedUser(null);
    setPersonalPromocodes([]);
  };

  const handleInfoMenuClose = () => {
    setInfoMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleAlreadySentClick = async () => {
    if (!selectedUser) return;

    try {
      // Обновляем в БД isWaitingAdminAction на false
      const response = await axios.post('/admin_update_waiting_status', {
        userId: selectedUser.id,
        isWaitingAdminAction: false
      });

      if (response.data.status === 'ok') {
        // Обновляем текст в chip
        setAdminDoAction('ok');
        setChipColor('success')

        // Обновляем локальное состояние пользователя
        setArrayUsersForRender((prev: any) =>
          prev.map((user: any) =>
            user.id === selectedUser.id
              ? { ...user, isWaitingAdminAction: false }
              : user
          )
        );

        // Показываем уведомление об успехе
        setSnackbarMessage('Status updated successfully');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating admin action status:', error);
      alert('Error updating status');
    }

    handleInfoMenuClose();
  };

  const handlePromoMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPromoMenuAnchor(event.currentTarget);
  };

  const handlePromoMenuClose = () => {
    setPromoMenuAnchor(null);
    setPersonalPromocodes([]);
  };

  const handleSelectPromocode = async (promocode: any) => {
    console.log('Selected promocode:', promocode);

    try {
      const response = await axios.post('/send_personalpromo_tojb', {
        promocodeId: promocode._id,
        userId: selectedUser.id,
        userTlgid: selectedUser.tlgid
      });

      if (response.data.status === 'ok') {
        setAdminDoAction('message sent')
        setChipColor('success')
        
        setSnackbarMessage('Message with promocode sent to user');
        setSnackbarOpen(true);
      } else {
        alert('Ошибка отправки промокода');
      }
    } catch (error) {
      console.error('Error sending promocode:', error);
      alert('Ошибка при отправке промокода');
    }

    handleActionMenuClose();
  };

  // const handleAction2 = async () => {
  //   if (selectedUser) {
  //     console.log('Action 2 для пользователя:', selectedUser.name);
  //     // Здесь можно добавить API вызов для выполнения действия 2
  //     try {
  //       // Пример API вызова:
  //       // await axios.post('/admin_action2', { userId: selectedUser.id });
  //       alert(`Action 2 выполнен для пользователя ${selectedUser.name}`);
  //     } catch (error) {
  //       console.error('Ошибка выполнения Action 2:', error);
  //     }
  //   }
  //   handleActionMenuClose();
  // };

  // Группировка пользователей по этапам
  const getUsersByStage = (stageId: Number) => {
    // console.log(`Filtering for stage: ${stageId}`);
    // console.log('All users:', arrayUsersForRender);

    //@ts-ignore
    const filteredUsers = arrayUsersForRender.filter(user => {
        //@ts-ignore
    //   console.log(`Comparing: user.crmStatus="${user.crmStatus}" with stageId="${stageId}"`);
      //@ts-ignore
      return user.crmStatus === stageId;
    });

    // console.log(`Stage ${stageId}: found ${filteredUsers.length} users`, filteredUsers);
    return filteredUsers;
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
            CRM
          </Typography>
        
        </Box>

        <Box sx={sectionBox}>
          <TextField
            fullWidth
            label="🔍 Search by Telegram ID"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
            placeholder="🔍 telegram id..."
            disabled={isSearching}
            sx={{ maxWidth: 250 }}
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
        </Box>

        {/* CRM Pipeline */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Всего клиентов: {arrayUsersForRender.length}
            {searchTerm && ` | Поиск: "${searchTerm}"`}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, minHeight: '600px', overflowX: 'auto' }}>
            {CRM_STAGES.map((stage) => {
              const stageUsers = getUsersByStage(stage.id);
              return (
                <Box key={stage.id} sx={{ flex: '1 1 14.28%', minWidth: '250px' }}>
                  
                  <Card
                    sx={{
                      height: '100%',
                      minHeight: '600px',
                      backgroundColor: stage.color,
                      border: '1px solid',
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                      '&:hover': {
                        boxShadow: 2,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                          {stage.name}
                        </Typography>
                        <Badge badgeContent={stageUsers.length} color="primary" />
                      </Stack>

                      <Stack spacing={2}>
                        {stageUsers.length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              textAlign: 'center',
                              py: 4,
                              fontStyle: 'italic'
                            }}
                          >
                            Нет клиентов
                          </Typography>
                        ) : (
                          stageUsers.map((user: any) => (
                          <Card
                            key={user.id}
                            sx={{
                              cursor: 'default',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 2,
                              }
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0 }}>
                                {user.name} 
                              </Typography>

                              {user.isWaitisWaitingAdminAction &&
                                <Chip
                                  label={adminDoAction}
                                  size="medium"
                                  color={chipColor}
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: '18px',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: 'warning.dark'
                                    }
                                  }}
                                  onClick={(event) => handleChipClick(event, user)}
                                />
                              }

                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0 }}>
                                telegram id: {user.tlgid}
                              </Typography>

                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0 }}>
                                📞 {user.phone}
                              </Typography>


                              {user.tags.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                  {user.tags.slice(0, 2).map((tag: any) => (
                                    <Chip
                                      key={tag._id}
                                      label={tag.name}
                                      size="small"
                                      color="secondary"
                                      sx={{ fontSize: '0.65rem', height: '18px' }}
                                    />
                                  ))}
                                  {user.tags.length > 2 && (
                                    <Chip
                                      label={`+${user.tags.length - 2}`}
                                      size="small"
                                      color="default"
                                      sx={{ fontSize: '0.65rem', height: '18px' }}
                                    />
                                  )}
                                </Box>
                              )}

                              <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                                <Tooltip title="Просмотр заказов">
                                  <IconButton
                                    size="small"
                                    color={user.ordersCount > 0 ? "secondary" : "default"}
                                    disabled={user.ordersCount === 0}
                                    onClick={() => {
                                      if (user.ordersCount > 0) {
                                        navigate('/clientorder-page', {
                                          state: {
                                            clientTlgid: user.tlgid,
                                            clientName: user.name,
                                            clientId: user.id
                                          }
                                        });
                                      }
                                    }}
                                  >
                                    <LocalShippingIcon sx={{ fontSize: '1rem' }} /> 
                                        {user.ordersCount > 0 && (
                                            <Typography variant="caption" color="secondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                                            ({user.ordersCount}) 
                                            </Typography>
                                        )} 
                                  </IconButton>
                                </Tooltip>

                                {/* {user.ordersCount > 0 && (
                                <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                                  📦 {user.ordersCount} заказ{user.ordersCount === 1 ? '' : user.ordersCount < 5 ? 'а' : 'ов'}
                                </Typography>
                              )} */}

                                <Tooltip title="Написать в боте">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => window.open(`${jb_chat_url}${user.jbid}`, '_blank')}
                                  >
                                    <TelegramIcon sx={{ fontSize: '1rem' }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Меню действий администратора */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem
            onMouseEnter={handlePromoMenuOpen}
            // sx={{
            //   pr: 4,
            //   '&:hover': {
            //     backgroundColor: 'orange'
            //   },
            //   '&:focus': {
            //     backgroundColor: 'orange'
            //   }
            // }}
          >
            Give personal promo {'>'}
          </MenuItem>
          {/* <MenuItem onClick={handleAction2}>Action 2</MenuItem> */}
        </Menu>

        {/* Вложенное меню для промокодов */}
        <Menu
          anchorEl={promoMenuAnchor}
          open={Boolean(promoMenuAnchor)}
          onClose={handlePromoMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          sx={{
            ml: 1,
            '& .MuiPaper-root': {
              minWidth: '200px'
            }
          }}
        >
          {isLoadingPromocodes ? (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : personalPromocodes.length === 0 ? (
            <MenuItem
            // onClick={() => navigate('/add_new_personal_promocode-page')}
              onClick={(e) => {
                e.preventDefault();
                handlePromoMenuClose();
                navigate(`/add_new_personal_promocode-page?tlgid=${selectedUser?.tlgid}`);
              }}
              sx={{ fontStyle: 'italic', cursor: 'pointer' }}
            >
              no promocodes (press to create new)
            </MenuItem>
          ) : (
            personalPromocodes.map((promo: any) => (
              <MenuItem
                key={promo._id || promo.code}
                onClick={() => handleSelectPromocode(promo)}
              >
                <Box>
                  <Typography variant="body2">
                    {promo.code}
                  </Typography>
                  {promo.discount && (
                    <Typography variant="caption" color="text.secondary">
                      Скидка: {promo.discount}%
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Меню для crmStatus == 3 */}
        <Menu
          anchorEl={infoMenuAnchor}
          open={Boolean(infoMenuAnchor)}
          onClose={handleInfoMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem
            onClick={handleAlreadySentClick}
            sx={{ fontStyle: 'italic', cursor: 'pointer' }}
          >
            ✅ admin already sent message to user
          </MenuItem>
        </Menu>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

      </Box>
    </>
  );
};