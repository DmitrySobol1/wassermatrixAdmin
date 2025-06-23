import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

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

// import { useNavigate } from 'react-router-dom';

export const Carts: FC = () => {
  //   const navigate = useNavigate();

  const [carts, setCarts] = useState([]);
  const domen = import.meta.env.VITE_DOMEN;
  const jb_chat_url = import.meta.env.VITE_JB_CHAR_URL;

  // получить список корзин
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        // const types = await axios.get('/user_get_goodsstype');

        const carts = await axios.get('/admin_get_carts');

        //@ts-ignore
        setCarts(carts.data.carts);
        console.log('carts=', carts);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchGoodsTypesInfo();
  }, []);

  const wrapperBox = {
    // bgcolor: '#fff',
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
            Carts of users
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          {carts.map((item: any) => (
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
              <div style={{ display: 'block' }}>
                <div>
                  <Typography component="div" variant="h6">
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div>
                        <AccountCircleIcon color="primary" fontSize="large" />
                      </div>
                      <div>user: {item.tlgid}</div>
                    </div>
                  </Typography>
                </div>

                <div>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: 'text.secondary' }}
                  >
                    last update of cart: {item.formattedDate}
                  </Typography>
                </div>

                <div>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{ color: 'text.primary', mt: 1, mb: 2 }}
                  >
                    quantity of position: {item.qtyItemsInCart} {'  '} |{'  '}{' '}
                    total sum of cart: {item.totalAmount} €
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
                        Click - to show items at cart
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
                        {item.goods.map((item: any) => (
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar
                                alt="Remy Sharp"
                                src={`${domen}${item.file.url}`}
                              />
                            </ListItemAvatar>

                            <ListItemText
                              //   primary={`${item.name_en} |  ${item.price_eu} €`}
                              primary={
                                <Typography component="span" variant="body1">
                                  {`${item.name_en}                      
                                `}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color: 'text.secondary',
                                      display: 'inline',
                                    }}
                                  >
                                    {item.qty} pcs x {item.price_eu} € ={' '}
                                    {item.qty * item.price_eu} €
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
                      sx={{ mr: 3, mt: 2, border:1,borderRadius:2 }}
                      onClick={() =>
                        window.open(`${jb_chat_url}${item.jbid}`, '_blank')
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
    </>
  );
};
