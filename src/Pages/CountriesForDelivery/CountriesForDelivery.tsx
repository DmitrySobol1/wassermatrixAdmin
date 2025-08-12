import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// import { useNavigate } from 'react-router-dom';

export const CountriesForDelivery: FC = () => {
  const navigate = useNavigate();

  const [arrayTypesForRender, setArrayTypesForRender] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  //   const language = 'en';
  //   const domen = import.meta.env.VITE_DOMEN;

  // получить список стран для доставки
  useEffect(() => {
    const fetchCountriesInfo = async () => {
      try {
        const countries = await axios.get('/admin_get_countries');

        // @ts-ignore
        const arrayTemp = countries.data.map((item) => ({
          name_de: item.name_de,
          name_en: item.name_en,
          name_ru: item.name_ru,
          id: item._id,
          isEU: item.isEU
        }));

        //для вывода типов в таблице с товарами
        // const typesForGoodsTable = arrayTemp.map((item) => ({
        //   [item.id]: item.name,
        // }));

        // const resultObject = Object.assign({}, ...typesForGoodsTable);
        // setArrayTypesForGoodTable(resultObject);

        setArrayTypesForRender(arrayTemp);

        console.log('type1', arrayTemp);

        // console.log('type2', typesForGoodsTable);
        // console.log('type3', resultObject);

        // setAllGoods(arrayGoodsForRender);
        // setArrayGoodsForRender(arrayGoodsForRender);

        // console.log('formattedTypes', arrayTypesForRender);
        // console.log('formattedTypes', arrayTypesForRender);
        // console.log('formattedGoods', arrayGoodsForRender);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchCountriesInfo();
  }, []);

  //   function typePressedHandler(typeId: string) {
  //     //@ts-ignore
  //     setSelectedChipId(typeId);
  //     console.log('typeId=', typeId);

  //     //@ts-ignore
  //     if (typeId == '1') {
  //       setArrayGoodsForRender(allGoods);
  //       return;
  //     }

  //     //@ts-ignore
  //     let newArray = [];

  //     allGoods.map((item) => {
  //       //@ts-ignore
  //       if (item.type === typeId) {
  //         //@ts-ignore
  //         newArray = [item, ...newArray];
  //       }
  //     });
  //     //@ts-ignore
  //     setArrayGoodsForRender(newArray);
  //   }

  //@ts-ignore
  function editBtnHandler(goodId) {
    navigate('/edit_good-page', {
      state: {
        goodId,
      },
    });
  }


  //   function deleteBtnHandler(goodId, goodName) {
  //     setGoodName(goodName);
  //     setIdToDelete(goodId);
  //     setOpenModal(true);
  //   }

  //   async function modalYesBtnHandler() {
  //     try {
  //       console.log('idToDelete=', idToDelete);

  //       const deleteResult = await axios.post('/admin_delete_good', {
  //         id: idToDelete,
  //       });

  //       if (deleteResult.data.status === 'ok') {
  //         const goods = await axios.get('/user_get_goods');

  //         //@ts-ignore
  //         const arrayGoodsForRender = goods.data.map((item) => ({
  //           name: item[`name_${language}`],
  //           description_short: item[`description_short_${language}`],
  //           description_long: item[`description_long_${language}`],
  //           img: `${domen}${item.file.url}`,
  //           id: item._id,
  //           type: item.type,
  //         }));

  //         setAllGoods(arrayGoodsForRender);
  //         setArrayGoodsForRender(arrayGoodsForRender);
  //         setOpenModal(false);
  //       }
  //     } catch (error) {
  //       console.error('Ошибка при выполнении запроса:', error);
  //     } finally {
  //       // setShowLoader(false);
  //       // setWolfButtonActive(true);
  //     }
  //   }

  function inputHandler(e: any) {
    const newArray = arrayTypesForRender.map((item: any) => {
      const name = e.target.name;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      console.log('name', name, 'value', value);
      if (item.id === e.target.id || (e.target.type === 'checkbox' && item.id === e.target.dataset.id)) {
        return { ...item, [name]: value };
      }
      return item;
    });
    //@ts-ignore
    setArrayTypesForRender(newArray);
  }

  // Автосохранение при потере фокуса
  async function handleBlur(e: any) {
    const countryId = e.target.id || e.target.dataset.id;
    const country = arrayTypesForRender.find((item: any) => item.id === countryId);
    
    if (country) {
      await saveCountry(country);
    }
  }

  // Автосохранение для checkbox
  async function handleCheckboxChange(e: any, id:any) {
    const countryId = id;
    const isChecked = e.target.checked;

    console.log("countryId", countryId)
    
    console.log('Checkbox changed:', countryId, isChecked);
    
    // Сначала обновляем состояние
    const newArray = arrayTypesForRender.map((item: any) => {
      if (item.id === countryId) {
        return { ...item, isEU: isChecked };
      }
      return item;
    });
    //@ts-ignore
    setArrayTypesForRender(newArray);
    
    // Затем сохраняем на сервере
    const country = arrayTypesForRender.find((item: any) => item.id === countryId);
    if (country && typeof country === 'object') {
      //@ts-ignore
      const updatedCountry = { ...country, isEU: isChecked };
      await saveCountry(updatedCountry);
    }
  }

  // Функция сохранения одной страны
  async function saveCountry(country: any) {
    try {
      const response = await axios.post('/admin_update_country', {
        id: country.id,
        name_en: country.name_en,
        name_de: country.name_de,
        name_ru: country.name_ru,
        isEU: country.isEU,
      });

      if (response.data.status === 'ok') {
        setSnackbarMessage('Изменения сохранены');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      setSnackbarMessage('Ошибка при сохранении');
      setSnackbarOpen(true);
    }
  }


  const wrapperBox = {
    // bgcolor: 'grey',
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };

  // const itemInSectionBox = {
  //   mb: 3,
  // };

  return (
    <>
      <NavMenu />

      <Box sx={wrapperBox}>
        <Box sx={sectionBox}>
          <Button
            //   variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/goods-page')}
          >
            back
          </Button>
        </Box>

        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4">
            List of countries for delivery:{' '}
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Button
            variant="contained"
            startIcon={<AddCircleSharpIcon />}
            onClick={() => navigate('/countries_addnew-page')}
          >
            Add new country
          </Button>
        </Box>

        <Box sx={sectionBox}>
          <Stack direction="column" spacing={3}>
            {arrayTypesForRender.map((item: any) => (
              
              <Card key={item.id}>
                <CardContent>
                  <TextField
                    // key={item.id}
                    fullWidth
                    name="name_de"
                    id={item.id}
                    onChange={(e) => inputHandler(e)}
                    onBlur={(e) => handleBlur(e)}
                    value={item.name_de}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">DE:</InputAdornment>
                        ),
                      },
                    }}
                    variant="standard"
                  />

                  <TextField
                    fullWidth
                    // key={item.id}
                    name="name_en"
                    id={item.id}
                    onChange={(e) => inputHandler(e)}
                    onBlur={(e) => handleBlur(e)}
                    value={item.name_en}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">EN:</InputAdornment>
                        ),
                      },
                    }}
                    variant="standard"
                  />

                  <TextField
                    fullWidth
                    // key={item.id}
                    name="name_ru"
                    id={item.id}
                    onChange={(e) => inputHandler(e)}
                    onBlur={(e) => handleBlur(e)}
                    value={item.name_ru}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">RU:</InputAdornment>
                        ),
                      },
                    }}
                    variant="standard"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={item.isEU || false}
                        onChange={(e) => handleCheckboxChange(e, item.id)}
                        name="isEU"
                      />
                    }
                    label="EU Country"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarMessage.includes('Ошибка') ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};
