import type { FC } from 'react';

import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const Settings: FC = () => {
  const navigate = useNavigate();

  

 const wrapperBox = {
    margin: 'auto',
    width: '90%',
    minWidth: 400,
    pt: 5,
  };

  const sectionBox = {
    mb: 5,
  };


  return (
    <>
      <NavMenu />

       <Box sx={wrapperBox}>
        
        
        <Box sx={sectionBox}>

     
          <Typography variant="h4" component="h4">
            App settings
          </Typography>
       </Box>

        <Box sx={sectionBox}>
          <Button
            variant="contained"
            startIcon={<LocalOfferIcon />}
            onClick={() => navigate('/tags-page')}
          >
            Tags for clients
          </Button>
     
        </Box>

        <Box sx={sectionBox}>
          <Button
            variant="contained"
            startIcon={<LocalShippingIcon />}
            onClick={() => navigate('/countries-page')}
          >
            Countries for delivery
          </Button>
     
        </Box>
        
        <Box sx={sectionBox}>
          <Button
            variant="contained"
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => navigate('/adminslist-page')}
          >
            Admins list
          </Button>
     
        </Box>

        </Box>
       
       

            
        
     
    </>
  );
};