import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Modal from '@mui/material/Modal';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';
import SettingsIcon from '@mui/icons-material/Settings';

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { red } from '@mui/material/colors';

// import { useNavigate } from 'react-router-dom';

export const Goods: FC = () => {
  const navigate = useNavigate();

  const [arrayTypesForRender, setArrayTypesForRender] = useState([]);
  const [allGoods, setAllGoods] = useState([]);
  const [arrayGoodsForRender, setArrayGoodsForRender] = useState([]);
  const [arrayTypesForGoodTable, setArrayTypesForGoodTable] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [goodName, setGoodName] = useState('');
  const [idToDelete, setIdToDelete] = useState('');

  const [selectedChipId, setSelectedChipId] = useState(1);
  const language = 'en';
  const domen = import.meta.env.VITE_DOMEN;

  // получить список типов товаров + товары
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        const types = await axios.get('/user_get_goodsstype');
        const goods = await axios.get('/user_get_goods');

        console.log('GOODS=', goods);

        //@ts-ignore
        const arrayTemp = types.data.map((item) => ({
          name: item[`name_${language}`],
          id: item._id,
        }));

        //для вывода типов в таблице с товарами
        //@ts-ignore
        const typesForGoodsTable = arrayTemp.map((item) => ({
          [item.id]: item.name,
        }));
        const resultObject = Object.assign({}, ...typesForGoodsTable);
        setArrayTypesForGoodTable(resultObject);

        const allElement = {
          ru: 'Все',
          en: 'All',
          de: 'Alle',
        };

        //@ts-ignore
        const arrayTypesForRender = [
          { name: allElement[language], id: 1 },
          ...arrayTemp,
        ];
        //@ts-ignore
        setArrayTypesForRender(arrayTypesForRender);

        //@ts-ignore
        const arrayGoodsForRender = goods.data.map((item) => ({
          name: item[`name_${language}`],
          description_short: item[`description_short_${language}`],
          description_long: item[`description_long_${language}`],
          img: `${domen}${item.file.url}`,
          id: item._id,
          type: item.type,
        }));

        setAllGoods(arrayGoodsForRender);
        setArrayGoodsForRender(arrayGoodsForRender);

        console.log('formattedTypes', arrayTypesForRender);
        console.log('formattedGoods', arrayGoodsForRender);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchGoodsTypesInfo();
  }, []);

  function typePressedHandler(typeId: string) {
    //@ts-ignore
    setSelectedChipId(typeId);
    console.log('typeId=', typeId);

    //@ts-ignore
    if (typeId == '1') {
      setArrayGoodsForRender(allGoods);
      return;
    }

    //@ts-ignore
    let newArray = [];

    allGoods.map((item) => {
      //@ts-ignore
      if (item.type === typeId) {
        //@ts-ignore
        newArray = [item, ...newArray];
      }
    });
    //@ts-ignore
    setArrayGoodsForRender(newArray);
  }

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

  //@ts-ignore
  function deleteBtnHandler(goodId, goodName) {
    setGoodName(goodName);
    setIdToDelete(goodId);
    setOpenModal(true);
    
  }

  async function modalYesBtnHandler() {

    

    try {

      console.log('idToDelete=',idToDelete)
      
      const deleteResult = await axios.post('/admin_delete_good', {id:idToDelete});

      if (deleteResult.data.status === 'ok') {
        const goods = await axios.get('/user_get_goods');

        //@ts-ignore
        const arrayGoodsForRender = goods.data.map((item) => ({
          name: item[`name_${language}`],
          description_short: item[`description_short_${language}`],
          description_long: item[`description_long_${language}`],
          img: `${domen}${item.file.url}`,
          id: item._id,
          type: item.type,
        }));

        setAllGoods(arrayGoodsForRender);
        setArrayGoodsForRender(arrayGoodsForRender);
        setOpenModal(false);
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      // setShowLoader(false);
      // setWolfButtonActive(true);
    }
  }

  return (
    <>
      <NavMenu />

      <Box component="section" sx={{ p: 5 }}>
        <Button
          variant="contained"
          startIcon={<AddCircleSharpIcon />}
          //  onClick={()=>navigate('/add_new_good-page')}>
          onClick={() => navigate('/add_new_good-page')}
        >
          Добавить новый товар
        </Button>
      </Box>

      <Box component="section" sx={{ p: 3 }}>
        {/* <Typography variant="h5" gutterBottom>
          Фильтровать товары:{' '}
          <Tooltip title="Управление фильтрами" arrow>
            <SettingsIcon color="primary" onClick={()=>navigate('/filters-page')}/>
          </Tooltip>
        </Typography> */}
        <Stack direction="row" spacing={1}>
          {arrayTypesForRender.map((type: any) => (
            <Chip
              key={type.id}
              label={type.name}
              variant={selectedChipId === type.id ? 'filled' : 'outlined'}
              color="primary"
              clickable
              onClick={() => typePressedHandler(type.id)}
            >
              {type.name}
            </Chip>
          ))}
          
          <Tooltip title="Edit filters" arrow>
            <SettingsIcon color="primary" onClick={()=>navigate('/filters-page')}/>
          </Tooltip>
          
        </Stack>
        
      </Box>

      

      <Box component="section" sx={{ p: 3 }}>
        <Stack direction="column" spacing={5}>
          {arrayGoodsForRender.map((item: any) => (
            <Card sx={{ display: 'flex' }} key={item.id}>
              <CardMedia
                component="img"
                sx={{ width: 151 }}
                image={item.img}
                alt="Live from space album cover"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <div style={{ display: 'flex' }}>
                    <Typography component="div" variant="h5" sx={{ mr: 1 }}>
                      {item.name}
                    </Typography>

                    <Chip
                      label={arrayTypesForGoodTable[item.type]}
                      variant="outlined"
                      size="small"
                    />
                  </div>

                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{ color: 'text.secondary' }}
                  >
                    {item.description_short}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    component="div"
                    sx={{ color: 'text.secondary', mt: 1 }}
                  >
                    {item.description_long}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="Edit item">
                    <IconButton
                      aria-label="edit"
                      color="primary"
                      onClick={() => editBtnHandler(item.id)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete item">
                    <IconButton
                      aria-label="edit"
                      sx={{ color: red[500] }}
                      onClick={() => deleteBtnHandler(item.id, item.name)}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Box>
            </Card>
          ))}
        </Stack>
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
              Are you sure you want to delete {goodName} ?
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={modalYesBtnHandler} color="error" sx={{ mr: 2 }}>
                Yes, delete
              </Button>
              <Button variant="contained" onClick={() => setOpenModal(false)} color="success">
                No, leave item alone
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </>
  );
};
