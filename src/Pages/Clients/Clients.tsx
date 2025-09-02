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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import CircularProgress from '@mui/material/CircularProgress';

export const Clients: FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [arrayUsersForRender, setArrayUsersForRender] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]); // Оригинальный список пользователей
//   const [allOrders, setAllOrders] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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
        setAllTags(tags.data);
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
          
          return {
            name: item.name || 'N/A',
            phone: item.phone || 'N/A',
            address: item.address || 'N/A',
            tlgid: item.tlgid,
            id: item._id,
            jbid: item.jbid,
            ordersCount: userOrdersCount,
            tags: item.tags || []
          };
        });

        setArrayUsersForRender(arrayUsersForRender);
        setOriginalUsers(arrayUsersForRender); // Сохраняем оригинальный список

        console.log('formattedUsers', arrayUsersForRender);
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

  // Функция для обновления тегов пользователя
  const handleUserTagsChange = async (userId: string, selectedTagIds: string[]) => {
    try {
      const response = await axios.post('/admin_update_user_tags', {
        userId: userId,
        tagIds: selectedTagIds
      });

      if (response.data.status === 'ok') {
        // Обновляем локальное состояние
        //@ts-ignore
        setArrayUsersForRender(prev => 
          prev.map(user => 
            //@ts-ignore
            user.id === userId 
            //@ts-ignore
              ? { ...user, tags: response.data.user.tags }
              : user
          )
        );
        console.log('User tags updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating user tags:', error);
      alert('Error updating user tags: ' + (error.response?.data?.error || error.message));
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
            All clients
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

        <Box sx={sectionBox}>
          {searchTerm && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {arrayUsersForRender.length} client{arrayUsersForRender.length !== 1 ? 's' : ''} found
              {searchTerm && ` for "${searchTerm}"`}
            </Typography>
          )}
         
          {arrayUsersForRender.map((user: any) => (
            <Stack
              key={user.id}
              spacing={2}
              direction="row"
              sx={{
                border: 1,
                p: 2,
                mb: 1,
                borderRadius: 3,
                borderColor: 'lightgrey',
                alignItems: 'center',
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography component="div" variant="body1" sx={{ mb: 0 }}>
                    <Typography component="span" variant="body1" sx={{ color: 'text.secondary', mr: 2, mb: 0 }}>
                    Name:
                  </Typography>
                  {user.name}
                </Typography>

                <Typography
                  variant="body1"
                  component="div"
                  sx={{ mb: 1 }}
                >
                  <Typography component="span" variant="body1" sx={{ color: 'text.secondary', mr: 2, mb: 0 }}>
                    Phone:
                  </Typography>
                  {user.phone}
                </Typography>

                <Typography
                  variant="body1"
                  component="div"
                  sx={{ mb: 0 }}
                >
                  <Typography component="span" variant="body1" sx={{ color: 'text.secondary', mr: 2 ,mb: 0 }}>
                    Address:
                  </Typography>
                  {user.address}
                </Typography>

                <Typography
                  variant="body1"
                  component="div"
                  sx={{ mb: 1 }}
                >
                  <Typography component="span" variant="body1" sx={{ color: 'text.secondary', mr: 2, mb: 0 }}>
                    Telegram ID:
                  </Typography>
                  {user.tlgid}
                </Typography>

                {/* Select для тегов */}
                <Box sx={{ mt: 2, maxWidth: 300 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tags</InputLabel>
                    <Select
                      multiple
                      value={user.tags.map((tag: any) => tag._id)}
                      onChange={(event) => {
                        const selectedTagIds = typeof event.target.value === 'string' 
                          ? event.target.value.split(',') 
                          : event.target.value;
                        handleUserTagsChange(user.id, selectedTagIds);
                      }}
                      input={<OutlinedInput label="Tags" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((tagId) => {
                            //@ts-ignore
                            const tag = allTags.find(t => t._id === tagId);
                            return (
                                // @ts-ignore 
                              <Chip key={tagId} label={tag?.name || tagId} color="primary" size="small" />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {allTags.map((tag: any) => (
                        <MenuItem key={tag._id} value={tag._id}>
                          {tag.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Tooltip title={user.ordersCount > 0 ? "View client orders" : "No orders to view"}>
                  <span>
                    <IconButton
                      aria-label="orders"
                      color={user.ordersCount > 0 ? "secondary" : "default"}
                      disabled={user.ordersCount === 0}
                      sx={{ 
                        border: 1, 
                        borderRadius: 2, 
                        p: 2,
                        opacity: user.ordersCount > 0 ? 1 : 0.4,
                        cursor: user.ordersCount > 0 ? 'pointer' : 'not-allowed'
                      }}
                      onClick={user.ordersCount > 0 ? () =>
                        navigate('/clientorder-page', { 
                          state: { 
                            clientTlgid: user.tlgid, 
                            clientName: user.name,
                            clientId: user.id 
                          } 
                        }) : undefined
                      }
                    >
                      <LocalShippingIcon sx={{ mr: 1 }} />
                      <Typography component="div" variant="body2">
                        VIEW ORDERS <span>({user.ordersCount})</span>
                      </Typography>
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Chat with user in bot">
                  <IconButton
                    aria-label="chat"
                    color="primary"
                    sx={{ border: 1, borderRadius: 2, p: 2 }}
                    onClick={() =>
                      window.open(`${jb_chat_url}${user.jbid}`, '_blank')
                    }
                  >
                    <TelegramIcon sx={{ mr: 1 }} />
                    <Typography component="div" variant="body2">
                      CHAT WITH USER
                    </Typography>
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          ))}
        </Box>
      </Box>
    </>
  );
};