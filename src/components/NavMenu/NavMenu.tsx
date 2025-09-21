// import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import Link from '@mui/material/Link';
import { Menu, MenuItem } from '@mui/material';

import { useState } from 'react';




export default function NavMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

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


   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (route: string) => {
    setAnchorEl(null);
    navigate(route);
  };


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
                href="#/crm-page"
                underline="hover"
                style={getMenuItemStyle('/crm-page')}
              >
                {'CRM'}
              </Link>
            </Typography>
            

            <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
              <Link
                component="button"
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                underline="hover"
                style={{
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  fontFamily: '"Roboto","Helvetica","Arial",sans-serif'
                }}
              >
                <KeyboardArrowDownIcon fontSize="small" />
                Loyalty system
              </Link>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  list: {
                    'aria-labelledby': 'basic-button',
                  },
                }}
              >
                <MenuItem onClick={() => handleMenuItemClick('/sales-page')}>Special offers</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/promocodes-page')}>Promocodes</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/cashback-page')}>Cashback</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/referal-page')}>Referal system</MenuItem>
              </Menu>
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

          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 2 }}
          >
            Logout
          </Button>
   
        </Toolbar>
      </AppBar>
    </Box>
  );
}
