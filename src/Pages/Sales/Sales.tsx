import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Modal from '@mui/material/Modal';

import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { red } from '@mui/material/colors';

export const Sales: FC = () => {
  const navigate = useNavigate();

  const [arraySalesForRender, setArraySalesForRender] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [saleTitle, setSaleTitle] = useState('');
  const [idToDelete, setIdToDelete] = useState('');

  const language = 'en';
  const domen = import.meta.env.VITE_DOMEN;

  // получить список акций
  useEffect(() => {
    const fetchSalesInfo = async () => {
      try {
        const sales = await axios.get('/admin_get_sales');

        console.log('SALES=', sales);

        //@ts-ignore
        const arraySalesForRender = sales.data.map((item) => ({
          title: item[`title_${language}`],
          subtitle: item[`subtitle_${language}`],
          info: item[`info_${language}`],
          buttonText: item[`buttonText_${language}`],
          img: `${domen}${item.file.url}`,
          id: item._id,
          dateUntil: item.dateUntil,
          isShowButton: item.isShowButton,
          good: item.good
        }));

        setArraySalesForRender(arraySalesForRender);

        console.log('formattedSales', arraySalesForRender);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      }
    };

    fetchSalesInfo();
  }, []);

  //@ts-ignore
  function editBtnHandler(saleId) {
    navigate('/editsale-page', {
      state: {
        saleId,
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
    boxShadow: 24,
    p: 4,
  };

  //@ts-ignore
  function deleteBtnHandler(saleId, saleTitle) {
    setSaleTitle(saleTitle);
    setIdToDelete(saleId);
    setOpenModal(true);
  }

  async function modalYesBtnHandler() {
    try {
      console.log('idToDelete=', idToDelete);

      const deleteResult = await axios.post('/admin_delete_sale', {
        id: idToDelete,
      });

      if (deleteResult.data.status === 'ok') {
        const sales = await axios.get('/admin_get_sales');

        //@ts-ignore
        const arraySalesForRender = sales.data.map((item) => ({
          title: item[`title_${language}`],
          subtitle: item[`subtitle_${language}`],
          info: item[`info_${language}`],
          buttonText: item[`buttonText_${language}`],
          img: `${domen}${item.file.url}`,
          id: item._id,
          dateUntil: item.dateUntil,
          isShowButton: item.isShowButton,
          good: item.good
        }));

        setArraySalesForRender(arraySalesForRender);
        setOpenModal(false);
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    }
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

//   const itemInSectionBox = {
//     mb: 3,
//   };

  return (
    <>
      <NavMenu />

      <Box sx={wrapperBox}>
        
        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4">
            Sales and special offers settings
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Button
            variant="contained"
            startIcon={<AddCircleSharpIcon />}
            onClick={() => navigate('/addsale-page')}
          >
            Add new 
          </Button>
        </Box>

        <Box sx={sectionBox}>
          {arraySalesForRender.map((item: any) => (
            <Stack
              key={item.id}
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
                  style={{
                    display: 'block',
                    height: 'auto',
                    width: 430,
                    borderRadius: 10,
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                  alt="Sale banner"
                />
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Typography component="div" variant="body1" sx={{ mb: 1 }}>
                    <Typography component="span" variant="body1" sx={{ color: 'text.secondary', mb: 1, mr: 3 }}>
                    title: 
                    </Typography>
                    {item.title}
                </Typography>

                

                <Typography
                  variant="body1"
                  component="div"
                  sx={{  mb: 1 }}
                >
                  <Typography component="span" variant="body1" sx={{ color: 'text.secondary', mb: 1, mr: 3 }}>
                    subtitle: 
                    </Typography> {item.subtitle}
                </Typography>

                <Typography
                  variant="body1"
                  component="div"
                  sx={{ mb: 1 }}
                >
                  <Typography component="span" variant="body1" sx={{ color: 'text.secondary', mb: 1, mr: 3 }}>
                    information: 
                    </Typography>{item.info}
                </Typography>

                {item.dateUntil && (
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ mb: 1 }}
                  >
                    <Typography component="span" variant="body1" sx={{ color: 'text.secondary', mb: 1, mr: 3 }}>
                     date until: 
                    </Typography> {new Date(item.dateUntil).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Typography>
                )}

                {item.isShowButton && (
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ mb: 1 }}
                  >
                    <Typography component="span" variant="body1" sx={{ color: 'text.secondary', mb: 1, mr: 3 }}>
                     button text: 
                    </Typography> {item.buttonText}
                  </Typography>
                )}

                <Box sx={{ mt: 2 }}>
                  <Tooltip title="Edit sale">
                    <IconButton
                      aria-label="edit"
                      color="primary"
                      onClick={() => editBtnHandler(item.id)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                      <Typography component="div" variant="body2" sx={{ ml: 1 }}>
                        EDIT
                      </Typography>
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete sale">
                    <IconButton
                      aria-label="delete"
                      sx={{ color: red[500] }}
                      onClick={() => deleteBtnHandler(item.id, item.title)}
                    >
                      <DeleteForeverIcon />
                      <Typography component="div" variant="body2" sx={{ ml: 1 }}>
                        DELETE
                      </Typography>
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Stack>
          ))}
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
              Are you sure you want to delete "{saleTitle}" ?
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
                No, leave sale alone
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </>
  );
};