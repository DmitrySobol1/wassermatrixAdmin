import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';
import SettingsIcon from '@mui/icons-material/Settings';
import PriceChangeIcon from '@mui/icons-material/PriceChange';

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { red } from '@mui/material/colors';
// import { Avatar } from '@mui/material';
// import { CancelScheduleSendSharp } from '@mui/icons-material';

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
  
  // Special offer состояние
  const [isAddingSpecialOffer, setIsAddingSpecialOffer] = useState(false);
  const [currentEditingGoodId, setCurrentEditingGoodId] = useState<string | null>(null);
  const [saleValue, setSaleValue] = useState('');
  const [infoTextDe, setInfoTextDe] = useState('');
  const [infoTextEn, setInfoTextEn] = useState('');
  const [infoTextRu, setInfoTextRu] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
  const language = 'en';
  const domen = import.meta.env.VITE_DOMEN;

  // получить список типов товаров + товары
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        const types = await axios.get('/user_get_goodsstype');
        const goods = await axios.get('/admin_get_goods');

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
          { name: 'with special offer', id: 'special_offer' },
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
          isSaleNow: item.isSaleNow
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

    // Фильтр для special offer
    if (typeId === 'special_offer') {
      //@ts-ignore
      const specialOfferGoods = allGoods.filter((item) => item.isSaleNow === true);
      //@ts-ignore
      setArrayGoodsForRender(specialOfferGoods);
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

  // Функции для special offer
  const handleAddSpecialOffer = (goodId: string) => {
    setCurrentEditingGoodId(goodId);
    setIsAddingSpecialOffer(true);
    // Сброс полей
    setSaleValue('');
    setInfoTextDe('');
    setInfoTextEn('');
    setInfoTextRu('');
  };

  const resetSpecialOfferState = () => {
    setIsAddingSpecialOffer(false);
    setCurrentEditingGoodId(null);
    setSaleValue('');
    setInfoTextDe('');
    setInfoTextEn('');
    setInfoTextRu('');
  };

  const handleSaveSpecialOffer = async () => {
    // Валидация - все поля должны быть заполнены
    if (!saleValue.trim() || !infoTextDe.trim() || !infoTextEn.trim() || !infoTextRu.trim()) {
      setSnackbarMessage('inputs can`t be empty');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Валидация saleValue
    if (isNaN(Number(saleValue)) || Number(saleValue) <= 0) {
      setSnackbarMessage('Sale value must be a positive number');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.post('/admin_update_sale_info', {
        goodId: currentEditingGoodId,
        saleValue: Number(saleValue),
        infoForFront_de: infoTextDe.trim(),
        infoForFront_en: infoTextEn.trim(),
        infoForFront_ru: infoTextRu.trim(),
      });

      if (response.data.status === 'ok') {
        // Обновляем локальное состояние товаров
        //@ts-ignore
        setAllGoods(prev => 
          prev.map(good => 
            //@ts-ignore
            good.id === currentEditingGoodId 
              //@ts-ignore
              ? { ...good, saleInfo: response.data.good.saleInfo, isSaleNow: true }
              : good
          )
        );
        
        //@ts-ignore
        setArrayGoodsForRender(prev => 
          prev.map(good => 
            //@ts-ignore
            good.id === currentEditingGoodId 
            //@ts-ignore
              ? { ...good, saleInfo: response.data.good.saleInfo, isSaleNow: true }
              : good
          )
        );

        resetSpecialOfferState();
        
        // Показываем успешное сообщение
        setSnackbarMessage('special offer successully set');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Special offer updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating special offer:', error);
      setSnackbarMessage('Error updating special offer: ' + (error.response?.data?.error || error.message));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleBlurSpecialOffer = (event: React.FocusEvent) => {
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && (
      relatedTarget.closest('[data-special-offer-input]') || 
      relatedTarget.closest('[data-special-offer-button]')
    )) {
      return; // Не сбрасываем, если фокус на связанных элементах
    }
    
    setTimeout(() => {
      if (isAddingSpecialOffer) {
        resetSpecialOfferState();
      }
    }, 150);
  };

  // Обработчик нажатия клавиш
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      resetSpecialOfferState();
    }
  };

  //@ts-ignore
  function deleteBtnHandler(goodId, goodName) {
    setGoodName(goodName);
    setIdToDelete(goodId);
    setOpenModal(true);
  }

  async function modalYesBtnHandler() {
    try {
      console.log('idToDelete=', idToDelete);

      const deleteResult = await axios.post('/admin_delete_good', {
        id: idToDelete,
      });

      if (deleteResult.data.status === 'ok') {
        const goods = await axios.get('/admin_get_goods');

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

  const itemInSectionBox = {
    mb: 3,
  };

  const cancellSaleHandler = async (goodId: string) => {
    try {
      const response = await axios.post('/admin_cancel_sale_offer', {
        goodId: goodId
      });

      if (response.data.status === 'ok') {
        // Обновляем локальное состояние товаров
        //@ts-ignore
        setAllGoods(prev => 
          prev.map(good => 
           //@ts-ignore
            good.id === goodId 
             //@ts-ignore
              ? { ...good, isSaleNow: false, saleInfo: null }
              : good
          )
        );
        
        //@ts-ignore
        setArrayGoodsForRender(prev => 
          prev.map(good => 
             //@ts-ignore
            good.id === goodId 
             //@ts-ignore
              ? { ...good, isSaleNow: false, saleInfo: null }
              : good
          )
        );

        // Показываем успешное сообщение
        setSnackbarMessage('Special offer cancelled successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        console.log('Special offer cancelled successfully');
      }
    } catch (error: any) {
      console.error('Error cancelling special offer:', error);
      setSnackbarMessage('Error cancelling special offer: ' + (error.response?.data?.error || error.message));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <NavMenu />

      <Box sx={wrapperBox}>
        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4">
            Goods settings
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Button
            variant="contained"
            startIcon={<AddCircleSharpIcon />}
            //  onClick={()=>navigate('/add_new_good-page')}>
            onClick={() => navigate('/add_new_good-page')}
          >
            Добавить новый товар
          </Button>
        </Box>

        <Box sx={itemInSectionBox}>
          <Stack direction="row" spacing={1}>
            {arrayTypesForRender.map((type: any) => (
              <Chip
                key={type.id}
                label={type.name}
                variant={selectedChipId === type.id ? 'filled' : 'outlined'}
                color={type.id === 'special_offer' ? 'warning' : 'primary'}
                clickable
                onClick={() => typePressedHandler(type.id)}
              >
                {type.name}
              </Chip>
            ))}

            <Tooltip title="Edit filters" arrow>
              <SettingsIcon
                color="primary"
                onClick={() => navigate('/filters-page')}
              />
            </Tooltip>
          </Stack>
        </Box>

<Box sx={sectionBox}>
        {arrayGoodsForRender.map((item: any) => (
          <Stack
            spacing={2}
            direction="row"
            sx={{
              border: 1,
              p: 1,
              mb: 2,
              borderRadius: 3,
              borderColor: 'lightgrey',
            }}
          >
            <Box>
              <img
                src={item.img}
                style={{ width: 100, height: 100, borderRadius: 10 }}
              />
            </Box>

            <Box>
              <div style={{ display: 'flex' }}>
                <Typography component="div" variant="h6" sx={{ mr: 1 }}>
                  {item.name}
                </Typography>

                <Chip
                  label={arrayTypesForGoodTable[item.type]}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 5 }}
                />

                {item.isSaleNow && (
                  <Chip
                    label='special offer'
                    variant="filled"
                    size="medium"
                    color='warning'
                    onDelete={() => cancellSaleHandler(item.id)}
                  />
                )}
                
              </div>
              <Typography
                variant="body1"
                component="div"
                sx={{ color: 'text.secondary' }}
              >
                {item.description_short}
              </Typography>

              <Typography
                variant="body1"
                component="div"
                sx={{ color: 'text.primary', mt: 1 }}
              >
                {item.description_long}
              </Typography>

              <Tooltip title={`Edit ${item.name}`}>
                <IconButton
                  aria-label="edit"
                  color="primary"
                  onClick={() => editBtnHandler(item.id)}
                >
                  <EditIcon />{' '}
                  <Typography component="div" variant="body1" sx={{ mr: 1 }}>
                    EDIT
                  </Typography>
                </IconButton>
              </Tooltip>

              <Tooltip title={`Delete ${item.name}`}>
                <IconButton
                  aria-label="delete"
                  sx={{ color: red[500] }}
                  onClick={() => deleteBtnHandler(item.id, item.name)}
                >
                  <DeleteForeverIcon />{' '}
                  <Typography component="div" variant="body1" sx={{ mr: 1 }}>
                    DELETE
                  </Typography>
                </IconButton>
              </Tooltip>

              {!item.isSaleNow && (
                <Tooltip title={`Click to add special offer for ${item.name}`}>
                  <IconButton
                    aria-label="add-special-offer"
                    sx={{ color: '#ed6c02' }}
                    onClick={() => handleAddSpecialOffer(item.id)}
                  >
                    <PriceChangeIcon />{' '}
                    <Typography component="div" variant="body1" sx={{ mr: 1 }}>
                      ADD SPECIAL OFFER
                    </Typography>
                  </IconButton>
                </Tooltip>
              )}

              {/* Special Offer Inputs */}
              {isAddingSpecialOffer && currentEditingGoodId === item.id && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="set sale value"
                    value={saleValue}
                    onChange={(e) => setSaleValue(e.target.value)}
                    onBlur={handleBlurSpecialOffer}
                    onKeyDown={handleKeyPress}
                    data-special-offer-input
                    sx={{ width: 200 }}
                    autoFocus
                    type="number"
                  />
                  <TextField
                    size="small"
                    placeholder="info for user on deutsch"
                    value={infoTextDe}
                    onChange={(e) => setInfoTextDe(e.target.value)}
                    onBlur={handleBlurSpecialOffer}
                    onKeyDown={handleKeyPress}
                    data-special-offer-input
                    sx={{ width: 200 }}
                  />
                  <TextField
                    size="small"
                    placeholder="info for user on english"
                    value={infoTextEn}
                    onChange={(e) => setInfoTextEn(e.target.value)}
                    onBlur={handleBlurSpecialOffer}
                    onKeyDown={handleKeyPress}
                    data-special-offer-input
                    sx={{ width: 200 }}
                  />
                  <TextField
                    size="small"
                    placeholder="info for user on russian"
                    value={infoTextRu}
                    onChange={(e) => setInfoTextRu(e.target.value)}
                    onBlur={handleBlurSpecialOffer}
                    onKeyDown={handleKeyPress}
                    data-special-offer-input
                    sx={{ width: 200 }}
                  />
                  <IconButton
                    aria-label="save"
                    color="success"
                    data-special-offer-button
                    onClick={handleSaveSpecialOffer}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    aria-label="cancel"
                    color="default"
                    data-special-offer-button
                    onClick={resetSpecialOfferState}
                  >
                    <Typography sx={{ fontSize: '18px' }}>✕</Typography>
                  </IconButton>
                </Box>
              )}

             
            
            </Box>
          </Stack>
        ))}

        </Box>


       
        {/* <Box sx={itemInSectionBox}>
          <Stack direction="column" spacing={3}>
            {arrayGoodsForRender.map((item: any) => (
              <Card sx={{ display: 'flex' }} key={item.id}>
                <CardMedia
                  component="img"
                  sx={{ width: 100, height: 100 }}
                  image={item.img}
                  alt="Live from space album cover"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <div style={{ display: 'flex' }}>
                      <Typography component="div" variant="h6" sx={{ mr: 1 }}>
                        {item.name}
                      </Typography>

                      <Chip
                        label={arrayTypesForGoodTable[item.type]}
                        variant="outlined"
                        size="small"
                      />
                    </div>

                    <Typography
                      variant="body1"
                      component="div"
                      sx={{ color: 'text.secondary' }}
                    >
                      {item.description_short}
                    </Typography>

                    <Typography
                      variant="body1"
                      component="div"
                      sx={{ color: 'text.primary', mt: 1 }}
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
                        <EditIcon />{' '}
                        <Typography
                          component="div"
                          variant="body1"
                          sx={{ mr: 1 }}
                        >
                          EDIT
                        </Typography>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete item">
                      <IconButton
                        aria-label="edit"
                        sx={{ color: red[500] }}
                        onClick={() => deleteBtnHandler(item.id, item.name)}
                      >
                        <DeleteForeverIcon />{' '}
                        <Typography
                          component="div"
                          variant="body1"
                          sx={{ mr: 1 }}
                        >
                          DELETE
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Box>
              </Card>
            ))}
          </Stack>
        </Box> */}

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
              <Button
                variant="contained"
                onClick={modalYesBtnHandler}
                color="error"
                sx={{ mr: 2 }}
              >
                Yes, delete
              </Button>
              <Button
                variant="contained"
                onClick={() => setOpenModal(false)}
                color="success"
              >
                No, leave item alone
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>

      {/* Snackbar для сообщений */}
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
