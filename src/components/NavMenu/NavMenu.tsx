// import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';

// import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import Link from '@mui/material/Link';




export default function NavMenu() {
  const location = useLocation();

  // Функция для определения активного пункта меню
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Функция для получения стилей активного пункта
  const getMenuItemStyle = (path: string) => ({
    color: isActive(path) ? '#1976d2' : 'white', 
    backgroundColor: isActive(path) ? '#ffffffff' : '',
    padding: isActive(path) ? 5 : '',
    borderRadius: isActive(path) ? 5 : '',
  });

  return (
    <Box >
      <AppBar position="static">
        <Toolbar>
          
          <div style={{ display: 'flex', gap: 30, flexGrow: 1 }}>
            

            <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
              <Link
                href="#/goods-page"
                underline="hover"
                style={getMenuItemStyle('/goods-page')} 
              >
                {'Goods'}
              </Link>
            </Typography>

            <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
              <Link
                href="#/carts-page"
                underline="hover"
                style={getMenuItemStyle('/carts-page')}
              >
                {'Carts'}
              </Link>
            </Typography>

            <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
              <Link
                href="#/orders-page"
                underline="hover"
                style={getMenuItemStyle('/orders-page')}
              >
                {'Orders'}
              </Link>
            </Typography>

            <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
              <Link
                href="#/clients-page"
                underline="hover"
                style={getMenuItemStyle('/clients-page')}
              >
                {'Clients'}
              </Link>
            </Typography>
            

            <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
              <Link
                href="#/sales-page"
                underline="hover"
                id="3"
                style={getMenuItemStyle('/sales-page')}
              >
                {'Special offers'}
              </Link>
            </Typography>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
              <Link
                href="#/router_statistic-page"
                underline="hover"
                id="3"
                style={getMenuItemStyle('/router_statistic-page')}
              >
                {'Statistic'}
              </Link>
            </Typography>
          
            </div>
          <Typography variant="h6" component="div">
            <Link
              href="#/settings-page"
              underline="hover"
              id="3"
              style={getMenuItemStyle('/settings-page')}
              >
              <SettingsIcon/>{'Settings'}
            </Link>
          </Typography>

          {/* <Button color="inherit">Login</Button> */}
   
        </Toolbar>
      </AppBar>
    </Box>
  );
}
