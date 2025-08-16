// import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';

// import { useState } from 'react';

import Link from '@mui/material/Link';




export default function NavMenu() {

  return (

    
    
    <Box >
      <AppBar position="static">
        <Toolbar>
          
          <div style={{ display: 'flex', gap: 40  }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link
                href="#/goods-page"
                underline="hover"
                style={{ color: 'white'}} 
              >
                {'Goods'}
              </Link>
            </Typography>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link
                href="#/carts-page"
                underline="hover"
                style={{ color: 'white'}}
                
              >
                {'Carts'}
              </Link>
            </Typography>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link
                href="#/orders-page"
                underline="hover"
                style={{ color: 'white'}}
                
              >
                {'Orders'}
              </Link>
            </Typography>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link
                href="#/countries-page"
                underline="hover"
                style={{ color: 'white'}}
                
              >
                {'Countries'}
              </Link>
            </Typography>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link
                href="#/sales-page"
                underline="hover"
                id="3"
                style={{ color: 'white'}}
              >
                {'Special offers'}
              </Link>
            </Typography>
          </div>

          {/* <Button color="inherit">Login</Button> */}
   
        </Toolbar>
      </AppBar>
    </Box>
  );
}
