import type { FC } from 'react';
import axios from '../../axios';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import NavMenu from '../../components/NavMenu/NavMenu';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Order {
  _id: string;
  createdAt: string;
  goods: OrderItem[];
  orderStatus: unknown;
}

interface OrderItem {
  itemId: {
    _id: string;
    name_en: string;
    name_de: string;
    name_ru: string;
  };
  qty: number;
  actualPurchasePriceInEu: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  xAxisID?: string;
}

interface GoodsSalesData {
  [key: string]: {
    name: string;
    totalSales: number;
    totalRevenue: number;
  };
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 2; year <= currentYear + 1; year++) {
    years.push(year);
  }
  return years;
};

export const GoodsStatistic: FC = () => {
  const navigate = useNavigate();

  const [monthOrders, setMonthOrders] = useState<Order[]>([]);
  const [goodsSalesData, setGoodsSalesData] = useState({
    labels: [] as string[],
    datasets: [] as ChartDataset[]
  });
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuantityColumn, setShowQuantityColumn] = useState(true);
  const [showRevenueColumn, setShowRevenueColumn] = useState(true);
  
  // State для выбранного месяца и года
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11
  
  // State для управления вкладками
  const [activeTab, setActiveTab] = useState(0); // 0 - monthly, 1 - yearly
  
  // State для годовых данных
  const [yearlyOrders, setYearlyOrders] = useState<Order[]>([]);

  // Функция для обработки данных заказов и создания статистики по товарам
  const processGoodsSalesData = (orders: Order[]) => {
    const goodsSales: GoodsSalesData = {};
    
    // Подсчитываем количество продаж и выручку для каждого товара
    orders.forEach(order => {
      order.goods.forEach(item => {
        const goodId = item.itemId._id;
        const goodName = item.itemId.name_en || 'Unknown Product';
        const qty = item.qty || 0;
        const price = item.actualPurchasePriceInEu || 0;
        const revenue = qty * price;
        
        if (!goodsSales[goodId]) {
          goodsSales[goodId] = {
            name: goodName,
            totalSales: 0,
            totalRevenue: 0
          };
        }
        
        goodsSales[goodId].totalSales += qty;
        goodsSales[goodId].totalRevenue += revenue;
      });
    });
    
    // Сортируем товары по количеству продаж (по убыванию) и берем топ-20
    const sortedGoods = Object.values(goodsSales)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 20);
    
    const labels = sortedGoods.map(item => item.name);
    const salesData = sortedGoods.map(item => item.totalSales);
    const revenueData = sortedGoods.map(item => Math.round(item.totalRevenue * 100) / 100);
    
    const datasets = [];
    
    if (showQuantityColumn) {
      datasets.push({
        label: 'Quantity Sold',
        data: salesData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        xAxisID: 'x',
      });
    }
    
    if (showRevenueColumn) {
      datasets.push({
        label: 'Revenue (€)',
        data: revenueData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        xAxisID: 'x1',
      });
    }

    const chartData = {
      labels: labels,
      datasets: datasets,
    };
    
    console.log('Goods sales data:', goodsSales);
    console.log('Chart data:', chartData);
    
    setGoodsSalesData(chartData);
  };

  // Функция для загрузки заказов за весь год
  const fetchOrdersForYear = async (year: number) => {
    try {
      setIsLoading(true);
      setHasError(false);
      console.log(`Starting to load orders for ${year}...`);
      
      const firstDayOfYear = new Date(year, 0, 1);
      const lastDayOfYear = new Date(year, 11, 31);
      
      firstDayOfYear.setHours(0, 0, 0, 0);
      lastDayOfYear.setHours(23, 59, 59, 999);

      console.log('Request period for year:', {
        startDate: firstDayOfYear.toISOString(),
        endDate: lastDayOfYear.toISOString()
      });

      const response = await axios.get('/admin/orders', {
        params: {
          startDate: firstDayOfYear.toISOString(),
          endDate: lastDayOfYear.toISOString()
        }
      });

      console.log('Server response (year):', response);
      console.log('Orders data for year:', response.data);
      console.log('Number of orders for year:', response.data?.orders.length);
      
      setYearlyOrders(response.data.orders || []);
      processGoodsSalesData(response.data.orders || []);
      setIsLoading(false);
      setHasError(false);
    } catch (error: any) {
      console.error(`Error loading orders for ${year}:`, error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      setHasError(true);
      setIsLoading(false);
      setYearlyOrders([]);
    }
  };

  // Функция для загрузки заказов за выбранный месяц
  const fetchOrdersForMonth = async (year: number, month: number) => {
    try {
      setIsLoading(true);
      setHasError(false);
      console.log(`Starting to load orders for ${MONTHS[month]} ${year}...`);
      
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      firstDayOfMonth.setHours(0, 0, 0, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);

      console.log('Request period:', {
        startDate: firstDayOfMonth.toISOString(),
        endDate: lastDayOfMonth.toISOString()
      });

      const response = await axios.get('/admin/orders', {
        params: {
          startDate: firstDayOfMonth.toISOString(),
          endDate: lastDayOfMonth.toISOString()
        }
      });

      console.log('Server response:', response);
      console.log('Orders data:', response.data);
      console.log('Number of orders:', response.data?.orders.length);
      
      setMonthOrders(response.data.orders || []);
      processGoodsSalesData(response.data.orders || []);
      setIsLoading(false);
      setHasError(false);
    } catch (error: any) {
      console.error(`Error loading orders for ${MONTHS[month]} ${year}:`, error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      setHasError(true);
      setIsLoading(false);
      setMonthOrders([]);
    }
  };

  // Загружаем данные при первом рендере в зависимости от активной вкладки
  useEffect(() => {
    if (activeTab === 0) {
      fetchOrdersForMonth(selectedYear, selectedMonth);
    } else {
      fetchOrdersForYear(selectedYear);
    }
  }, []);

  // Перезагружаем данные при изменении выбранного месяца, года или вкладки
  useEffect(() => {
    if (activeTab === 0) {
      fetchOrdersForMonth(selectedYear, selectedMonth);
    } else {
      fetchOrdersForYear(selectedYear);
    }
  }, [selectedYear, selectedMonth, activeTab]);

  // Перерисовываем диаграмму при изменении настроек видимости столбцов
  useEffect(() => {
    if (activeTab === 0 && monthOrders.length > 0) {
      processGoodsSalesData(monthOrders);
    } else if (activeTab === 1 && yearlyOrders.length > 0) {
      processGoodsSalesData(yearlyOrders);
    }
  }, [showQuantityColumn, showRevenueColumn, monthOrders, yearlyOrders, activeTab]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // Делаем диаграмму горизонтальной
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: activeTab === 0 
          ? `Product Sales Statistics for ${MONTHS[selectedMonth]} ${selectedYear}`
          : `Product Sales Statistics for ${selectedYear}`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const datasetLabel = context.dataset.label;
            const value = context.raw;
            
            if (datasetLabel === 'Quantity Sold') {
              return `${datasetLabel}: ${value}`;
            } else if (datasetLabel === 'Revenue (€)') {
              return `${datasetLabel}: €${value.toFixed(2)}`;
            }
            
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        display: showQuantityColumn,
        position: 'bottom' as const,
        beginAtZero: true,
        title: {
          display: showQuantityColumn,
          text: 'Quantity Sold'
        },
        ticks: {
          stepSize: 1,
        },
      },
      x1: {
        type: 'linear' as const,
        display: showRevenueColumn,
        position: 'top' as const,
        beginAtZero: true,
        title: {
          display: showRevenueColumn,
          text: 'Revenue (€)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Products'
        }
      },
    },
  };

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
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/router_statistic-page')}
          >
            back
          </Button>
        </Box> 
        
        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4" sx={{ mb: 3 }}>
            Product Sales Statistics
          </Typography>
          
          {/* Вкладки для переключения между видами статистики */}
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Monthly" />
            <Tab label="Yearly" />
          </Tabs>
          
          {/* Селекторы периода */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            {activeTab === 0 && (
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {MONTHS.map((month, index) => (
                    <MenuItem key={index} value={index}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {generateYears().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {hasError ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              Error loading data, try later
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" component="h6" sx={{ mb: 2 }}>
              {activeTab === 0 
                ? `Product Sales for ${MONTHS[selectedMonth]} ${selectedYear}`
                : `Product Sales for ${selectedYear}`
              }
            </Typography>
            
            <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showQuantityColumn}
                    onChange={(e) => setShowQuantityColumn(e.target.checked)}
                    sx={{
                      color: 'rgba(54, 162, 235, 1)',
                      '&.Mui-checked': {
                        color: 'rgba(54, 162, 235, 1)',
                      },
                    }}
                  />
                }
                label="Quantity Sold"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showRevenueColumn}
                    onChange={(e) => setShowRevenueColumn(e.target.checked)}
                    sx={{
                      color: 'rgba(255, 99, 132, 1)',
                      '&.Mui-checked': {
                        color: 'rgba(255, 99, 132, 1)',
                      },
                    }}
                  />
                }
                label="Revenue (€)"
              />
            </Stack>
            
            <Box sx={{ height: 600 }}>
              {isLoading ? (
                <Typography>Loading data...</Typography>
              ) : goodsSalesData.labels.length > 0 ? (
                <Bar data={goodsSalesData} options={chartOptions} />
              ) : (
                <Typography>No data to display</Typography>
              )}
            </Box>
          </Paper>
        )}
        
        {!hasError && !isLoading && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" component="h6" sx={{ mb: 2 }}>
              {activeTab === 0 
                ? `Summary for ${MONTHS[selectedMonth]} ${selectedYear}`
                : `Summary for ${selectedYear}`
              }
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Total Orders: {activeTab === 0 ? monthOrders.length : yearlyOrders.length}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Total Products Sold: {
                activeTab === 0 
                  ? monthOrders.reduce((total, order) => {
                      return total + order.goods.reduce((orderTotal, item) => {
                        return orderTotal + (item.qty || 0);
                      }, 0);
                    }, 0)
                  : yearlyOrders.reduce((total, order) => {
                      return total + order.goods.reduce((orderTotal, item) => {
                        return orderTotal + (item.qty || 0);
                      }, 0);
                    }, 0)
              }
            </Typography>
            <Typography variant="body1">
              Total Revenue: €{
                activeTab === 0 
                  ? monthOrders.reduce((total, order) => {
                      return total + order.goods.reduce((orderTotal, item) => {
                        const qty = item.qty || 0;
                        const price = item.actualPurchasePriceInEu || 0;
                        return orderTotal + (qty * price);
                      }, 0);
                    }, 0).toFixed(2)
                  : yearlyOrders.reduce((total, order) => {
                      return total + order.goods.reduce((orderTotal, item) => {
                        const qty = item.qty || 0;
                        const price = item.actualPurchasePriceInEu || 0;
                        return orderTotal + (qty * price);
                      }, 0);
                    }, 0).toFixed(2)
              }
            </Typography>
          </Paper>
        )}
      </Box>
    </>
  );
};