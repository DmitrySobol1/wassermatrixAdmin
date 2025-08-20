import type { FC } from 'react';

import { useNavigate } from 'react-router-dom';

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


import BarChartIcon from '@mui/icons-material/BarChart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export const RouterStatistic: FC = () => {
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
            Statistic
          </Typography>
        </Box>

        <Box sx={sectionBox}>
          <Button
            variant="contained"
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/statistic-page')}
          >
            Sale statistic
          </Button>
        </Box>

        <Box sx={sectionBox}>
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={() => navigate('/goods_statistic-page')}
          >
            Goods Statistic
          </Button>
        </Box>
      </Box>
    </>
  );
};
