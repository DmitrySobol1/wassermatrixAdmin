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
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// import { useNavigate } from 'react-router-dom';

export const Filters: FC = () => {
  const navigate = useNavigate();

  const [arrayTypesForRender, setArrayTypesForRender] = useState([]);
  const [initialTypes, setInitialTypes] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  //   const language = 'en';
  //   const domen = import.meta.env.VITE_DOMEN;

  // получить список типов товаров + товары
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        const types = await axios.get('/user_get_goodsstype');

        //@ts-ignore
        // const arrayTemp = types.data.map((item) => ({
        //   name: item[`name_${language}`],
        //   id: item._id,
        // }));

        const arrayTemp = types.data.map((item) => ({
          name_de: item.name_de,
          name_en: item.name_en,
          name_ru: item.name_ru,
          id: item._id,
        }));

        //для вывода типов в таблице с товарами
        // const typesForGoodsTable = arrayTemp.map((item) => ({
        //   [item.id]: item.name,
        // }));

        // const resultObject = Object.assign({}, ...typesForGoodsTable);
        // setArrayTypesForGoodTable(resultObject);

        setArrayTypesForRender(arrayTemp);
        setInitialTypes(arrayTemp);

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

    fetchGoodsTypesInfo();
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

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    //   border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

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
      console.log('name', name);
      if (item.id === e.target.id) {
        return { ...item, [name]: e.target.value };
      }
      return item;
    });
    //@ts-ignore
    setArrayTypesForRender(newArray);
  }

  function saveBtnHandler() {
    setOpenModal(true);
  }

  async function modalYesBtnHandler() {
    try {
      const response = await axios.post('/admin_update_filters', {
        arrayTypes: arrayTypesForRender,
      });

      console.log(response.data);
      setOpenModal(false);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      // setShowLoader(false);
      // setWolfButtonActive(true);
    }
  }

  function modalNoBtnHandler() {
    //FIXME: добавить лоадер,чтобы обновились данные перед закрытием модалки
    setArrayTypesForRender(initialTypes);
    setOpenModal(false);
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
            List of filters types:{' '}
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Button
            variant="contained"
            startIcon={<AddCircleSharpIcon />}
            //  onClick={()=>navigate('/add_new_good-page')}>
            onClick={() => navigate('/filters_addnew-page')}
          >
            Add new filter type
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
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        
          <Box component="section" sx={sectionBox}>
            <Button
              variant="contained"
              onClick={saveBtnHandler}
              color="success"
              sx={{width: 200}}
            >
              Save changes
            </Button>
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
                Are you sure you want to save all changes?
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={modalYesBtnHandler}
                  color="success"
                  sx={{ mr: 2 }}
                >
                  Yes, save
                </Button>
                <Button
                  variant="contained"
                  onClick={modalNoBtnHandler}
                  color="error"
                >
                  No, cancel changes
                </Button>
              </Box>
            </Box>
          </Modal>
        </div>
      </Box>
    </>
  );
};
