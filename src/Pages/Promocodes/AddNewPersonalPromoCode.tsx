import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export const AddNewPersonalPromoCode: FC = () => {
  const navigate = useNavigate();

  const [promocodeData, setPromocodeData] = useState({
    description_admin: '',
    description_users_de: '',
    description_users_en: '',
    description_users_ru: '',
    code: '',
    sale:'',
    tlgid: ''
  });
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [forFirstPurchase, setForFirstPurchase] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Состояния для валидации пользователя
  const [userValidation, setUserValidation] = useState({
    isChecking: false,
    isValid: false,
    message: '',
    userName: ''
  });

  // Состояние для валидации промокода
  const [promocodeValidation, setPromocodeValidation] = useState({
    isValid: true,
    message: ''
  });

  // Ref для debounce таймера
  //@ts-ignore
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Функция валидации промокода
  //@ts-ignore
  const validatePromocode = (value: string) => {
    // Проверка на пробелы (более одного слова)
    if (value.includes(' ')) {
      return {
        isValid: false,
        message: 'Promocode must be a single word without spaces'
      };
    }

    // Проверка на длину
    if (value.length > 15) {
      return {
        isValid: false,
        message: 'Promocode must be no more than 15 characters'
      };
    }

    return {
      isValid: true,
      message: ''
    };
  };

  // Функция проверки заполненности всех полей
  const isFormValid = () => {
    const requiredFields = [
      'description_admin',
      'description_users_de',
      'description_users_en',
      'description_users_ru',
      'code',
      'sale',
      'tlgid'
    ];

    // Проверяем все поля из promocodeData
    const allFieldsFilled = requiredFields.every(field => 
      promocodeData[field as keyof typeof promocodeData].trim() !== ''
    );

    // Проверяем выбрана ли дата
    const dateSelected = expiryDate !== null;

    // Проверяем что пользователь найден
    const userIsValid = userValidation.isValid;

    // Проверяем валидность промокода
    const promocodeIsValid = promocodeValidation.isValid;

    return allFieldsFilled && dateSelected && userIsValid && promocodeIsValid;
  };

  // Устанавливаем isLoading в false, так как нам не нужно загружать данные
  useEffect(() => {
    setIsLoading(false);

    // Cleanup debounce таймера при размонтировании компонента
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  //@ts-ignore
  const handlePromocodeInput = (e) => {
    const { name, value } = e.target;
    console.log(name, '=', value);

    if (name === 'code') {
      // Удаляем пробелы и преобразуем к нижнему регистру
      let cleanValue = value.replace(/\s/g, '').toLowerCase();
      
      // Если есть пробелы в исходном значении, показываем предупреждение
      if (value.includes(' ')) {
        setPromocodeValidation({
          isValid: false,
          message: 'Promocode must be a single word without spaces'
        });
      }
      // Если длина превышает 15 символов, обрезаем и показываем предупреждение
      else if (cleanValue.length > 15) {
        cleanValue = cleanValue.substring(0, 15);
        setPromocodeValidation({
          isValid: false,
          message: 'Promocode must be no more than 15 characters'
        });
      }
      // Если все в порядке
      else {
        setPromocodeValidation({
          isValid: true,
          message: ''
        });
      }

      setPromocodeData({ ...promocodeData, [name]: cleanValue });
    } else {
      setPromocodeData({ ...promocodeData, [name]: value });
    }

    // Если изменяется поле tlgid, применяем debounce для валидации пользователя
    if (name === 'tlgid') {
      // Очищаем предыдущий таймер
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Сбрасываем состояние валидации при изменении значения
      if (value.trim() === '') {
        setUserValidation({
          isChecking: false,
          isValid: false,
          message: '',
          userName: ''
        });
        return;
      }

      // Устанавливаем новый таймер с задержкой 1 секунда
      debounceTimer.current = setTimeout(() => {
        validateUser(value);
      }, 1000);
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForFirstPurchase(event.target.checked);
  };

  // Функция для проверки пользователя
  const validateUser = async (tlgid: string) => {
    if (!tlgid.trim()) {
      setUserValidation({
        isChecking: false,
        isValid: false,
        message: '',
        userName: ''
      });
      return;
    }

    setUserValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const response = await axios.post('/admin_find_user_by_tlgid', {
        tlgid: tlgid.trim()
      });

      if (response.data.status === 'ok' && response.data.found) {
        setUserValidation({
          isChecking: false,
          isValid: true,
          message: `User found, name: ${response.data.user.name}`,
          userName: response.data.user.name
        });
      } else {
        setUserValidation({
          isChecking: false,
          isValid: false,
          message: 'User with mentioned telegram id not found',
          userName: ''
        });
      }
    } catch (error) {
      console.error('Error validating user:', error);
      setUserValidation({
        isChecking: false,
        isValid: false,
        message: 'Error checking user',
        userName: ''
      });
    }
  };


  async function createPromocodeBtnHandler() {
    setIsSaving(true);
    
    const data = {
      description_admin: promocodeData.description_admin,
      description_users_de: promocodeData.description_users_de,
      description_users_en: promocodeData.description_users_en,
      description_users_ru: promocodeData.description_users_ru,
      code: promocodeData.code,
      sale: promocodeData.sale,
      tlgid: promocodeData.tlgid,
      expiryDate: expiryDate,
      forFirstPurchase: forFirstPurchase
    };

    try {
      const response = await axios.post('/admin_add_new_personal_promocode', data);

      console.log('[Frontend] Personal Promocode created successfully:', response.data);
      setOpenModal(true);
    } catch (error) {
      console.error('Ошибка при создании персонального промокода:', error);
    } finally {
      setIsSaving(false);
    }
  }

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  function modalOkBtnHandler() {
    setOpenModal(false);

    setPromocodeData({
      description_admin: '',
      description_users_de: '',
      description_users_en: '',
      description_users_ru: '',
      code: '',
      sale:'',
      tlgid: ''
    });
    setExpiryDate(null);
    setForFirstPurchase(false);
    setUserValidation({
      isChecking: false,
      isValid: false,
      message: '',
      userName: ''
    });
    setPromocodeValidation({
      isValid: true,
      message: ''
    });
  }

  const wrapperBox = {
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };

  const itemInSectionBox = {
    mb: 3,
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

      <Box component="form" sx={wrapperBox} noValidate autoComplete="off">
        <Box sx={sectionBox}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/promocodes-page')}
          >
            back
          </Button>
        </Box>

        <Box sx={itemInSectionBox}>
          <Typography variant="h4" gutterBottom>
            Add new personal promocode
          </Typography>
        </Box>

        <Box sx={itemInSectionBox}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
          
          <List>
            
             <ListItem></ListItem>   
            <Divider>
              <Chip size="small" label='Promocode info'/>
            </Divider>
             <ListItem></ListItem> 

             <ListItem>
              <TextField
              fullWidth
                label="Promocode"
                name="code"
                variant="standard"
                required
                onChange={handlePromocodeInput}
                value={promocodeData.code}
                error={!promocodeValidation.isValid}
                helperText={promocodeValidation.message}
              />
            </ListItem>

             <ListItem>
              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="User Telegram ID"
                  name="tlgid"
                  variant="standard"
                  required
                  onChange={handlePromocodeInput}
                  value={promocodeData.tlgid}
                  disabled={userValidation.isChecking}
                />
                {userValidation.isChecking && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Checking user...
                    </Typography>
                  </Box>
                )}
                {!userValidation.isChecking && userValidation.message && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: userValidation.isValid ? 'success.main' : 'error.main',
                      mt: 1,
                      display: 'block'
                    }}
                  >
                    {userValidation.message}
                  </Typography>
                )}
              </Box>
            </ListItem>

            <ListItem>
              <TextField
              fullWidth
                label="Set sale value (%)"
                name="sale"
                variant="standard"
                type="number"
                required
                onChange={handlePromocodeInput}
                value={promocodeData.sale}
                inputProps={{ min: 0, max: 100 }}
              />
            </ListItem>

            <ListItem>
              <TextField
              fullWidth
                label="Description for Administrator"
                name="description_admin"
                variant="standard"
                required
                onChange={handlePromocodeInput}
                value={promocodeData.description_admin}
              />
            </ListItem>


            <ListItem>
              <DatePicker
                label="Expire Date"
                value={expiryDate}
                onChange={(newValue) => setExpiryDate(newValue)}
                format="dd MMM yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "standard" as const,
                    required: true
                  }
                }}
              />
            </ListItem>

            
            <ListItem>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={forFirstPurchase}
                    onChange={handleCheckboxChange}
                    name="forFirstPurchase"
                  />
                } 
                label="Promocode can be used for first purchase only" 
              />
            </ListItem>
           
           <ListItem></ListItem>   
            <Divider>
              <Chip size="small" label='User Descriptions'/>
            </Divider>
             <ListItem></ListItem> 

            <ListItem>
              <TextField
              fullWidth
                
                label="Description for users (de)"
                name="description_users_de"
                variant="standard"
                required
                onChange={handlePromocodeInput}
                value={promocodeData.description_users_de}
              />
            </ListItem>

            <ListItem>
              <TextField
              fullWidth
                
                label="Description for users (en)"
                name="description_users_en"
                variant="standard"
                required
                onChange={handlePromocodeInput}
                value={promocodeData.description_users_en}
              />
            </ListItem>

            <ListItem>
              <TextField
              fullWidth
                
                label="Description for users (ru)"
                name="description_users_ru"
                variant="standard"
                required
                onChange={handlePromocodeInput}
                value={promocodeData.description_users_ru}
              />
            </ListItem>    


          </List>
          </LocalizationProvider>
        </Box>

        <Box component="section" sx={sectionBox}>
      <ListItem>
          <Tooltip 
            title={!isFormValid() ? "Fill in all inputs" : isSaving ? "Creating..." : ""}
            placement="top"
            arrow
          >
            <span>
              <Button 
                variant="contained" 
                onClick={createPromocodeBtnHandler} 
                color="success" 
                sx={{width:200}}
                disabled={!isFormValid() || isSaving}
                startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {isSaving ? 'Creating...' : 'Create promocode'}
              </Button>
            </span>
          </Tooltip>
      </ListItem>
        </Box>
     
      </Box>

      <div>
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              New promocode has been created
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={modalOkBtnHandler}>
                Ok
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </>
  );
};