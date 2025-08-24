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
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';


interface Order {
  _id: string;
  createdAt: string;
  goods: unknown[];
  orderStatus: unknown;
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
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

export const Statistic: FC = () => {
  const navigate = useNavigate();  

  const [currentMonthOrders, setCurrentMonthOrders] = useState<Order[]>([]);
  const [dailySalesData, setDailySalesData] = useState({
    labels: [] as string[],
    datasets: [] as ChartDataset[]
  });
  const [dailySalesAmounts, setDailySalesAmounts] = useState<number[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrdersColumn, setShowOrdersColumn] = useState(true);
  const [showAmountsColumn, setShowAmountsColumn] = useState(true);
  
  // State для выбранного месяца и года
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0-11
  
  // State для управления вкладками
  const [activeTab, setActiveTab] = useState(0); // 0 - по месяцам, 1 - по годам
  
  // State для годовых данных
  const [yearlyOrders, setYearlyOrders] = useState<Order[]>([]);
  const [yearlyChart, setYearlyChart] = useState({
    labels: [] as string[],
    datasets: [] as ChartDataset[]
  });
  const [yearlyAmounts, setYearlyAmounts] = useState<number[]>([]);

  // Функция для обработки данных заказов и создания данных для диаграммы
  const processSalesData = (orders: Order[]) => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    // Создаем массив дней месяца
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Подсчитываем количество заказов и сумму продаж по дням
    const salesByDay = days.map(day => {
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getDate() === day;
      });
      return dayOrders.length;
    });

    const salesAmountsByDay = days.map(day => {
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getDate() === day;
      });
      
      // Рассчитываем общую сумму за день
      const dayTotal = dayOrders.reduce((daySum, order) => {
        const orderTotal:any = order.goods.reduce((orderSum:any, good: any) => {
          const price = good.actualPurchasePriceInEu || 0;
          const qty = good.qty || 0;
          return orderSum + (price * qty);
        }, 0);
        return daySum + orderTotal;
      }, 0);
      
      return Math.round(dayTotal * 100) / 100; // Округляем до 2 знаков после запятой
    });

    const datasets = [];
    
    if (showOrdersColumn) {
      datasets.push({
        label: 'Number of Orders',
        data: salesByDay,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      });
    }
    
    if (showAmountsColumn) {
      datasets.push({
        label: 'Sales Amount (€)',
        data: salesAmountsByDay,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      });
    }

    const chartData = {
      labels: days.map(day => day.toString()),
      datasets: datasets,
    };
    
    console.log('Chart data:', chartData);
    console.log('Sales by day:', salesByDay);
    console.log('Sales amounts by day:', salesAmountsByDay);
    
    setDailySalesData(chartData);
    setDailySalesAmounts(salesAmountsByDay);
  };

  // Функция для обработки данных заказов по годам (с разбивкой по месяцам)
  const processYearlyData = (orders: Order[]) => {
    // Подсчитываем количество заказов и сумму продаж по месяцам
    const salesByMonth = MONTHS.map((_, monthIndex) => {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === monthIndex;
      });
      return monthOrders.length;
    });

    const salesAmountsByMonth = MONTHS.map((_, monthIndex) => {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === monthIndex;
      });
      
      // Рассчитываем общую сумму за месяц
      const monthTotal = monthOrders.reduce((monthSum, order) => {
        const orderTotal:any = order.goods.reduce((orderSum:any, good: any) => {
          const price = good.actualPurchasePriceInEu || 0;
          const qty = good.qty || 0;
          return orderSum + (price * qty);
        }, 0);
        return monthSum + orderTotal;
      }, 0);
      
      return Math.round(monthTotal * 100) / 100; // Округляем до 2 знаков после запятой
    });

    const datasets = [];
    
    if (showOrdersColumn) {
      datasets.push({
        label: 'Number of Orders',
        data: salesByMonth,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      });
    }
    
    if (showAmountsColumn) {
      datasets.push({
        label: 'Sales Amount (€)',
        data: salesAmountsByMonth,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      });
    }

    const chartData = {
      labels: MONTHS,
      datasets: datasets,
    };
    
    console.log('Yearly chart data:', chartData);
    console.log('Sales by month:', salesByMonth);
    console.log('Sales amounts by month:', salesAmountsByMonth);
    
    setYearlyChart(chartData);
    setYearlyAmounts(salesAmountsByMonth);
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

      console.log('Период запроса для года:', {
        startDate: firstDayOfYear.toISOString(),
        endDate: lastDayOfYear.toISOString()
      });

      const response = await axios.get('/admin/orders', {
        params: {
          startDate: firstDayOfYear.toISOString(),
          endDate: lastDayOfYear.toISOString()
        }
      });

      console.log('Ответ от сервера (год):', response);
      console.log('Данные заказов за год:', response.data);
      console.log('Количество заказов за год:', response.data?.orders.length);
      
      setYearlyOrders(response.data.orders || []);
      processYearlyData(response.data.orders || []);
      setIsLoading(false);
      setHasError(false);
    } catch (error:any) {
      console.error(`Error loading orders for ${year}:`, error);
      console.error('Детали ошибки:', error.response?.data);
      console.error('Статус ошибки:', error.response?.status);
      
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

      console.log('Период запроса:', {
        startDate: firstDayOfMonth.toISOString(),
        endDate: lastDayOfMonth.toISOString()
      });

      const response = await axios.get('/admin/orders', {
        params: {
          startDate: firstDayOfMonth.toISOString(),
          endDate: lastDayOfMonth.toISOString()
        }
      });

      console.log('Ответ от сервера:', response);
      console.log('Данные заказов:', response.data);
      console.log('Количество заказов:', response.data?.orders.length);
      
      setCurrentMonthOrders(response.data.orders || []);
      processSalesData(response.data.orders || []);
      setIsLoading(false);
      setHasError(false);
    } catch (error:any) {
      console.error(`Error loading orders for ${MONTHS[month]} ${year}:`, error);
      console.error('Детали ошибки:', error.response?.data);
      console.error('Статус ошибки:', error.response?.status);
      
      setHasError(true);
      setIsLoading(false);
      setCurrentMonthOrders([]);
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

  // Перезагружаем данные при изменении выбранного месяца или года
  useEffect(() => {
    if (activeTab === 0) {
      fetchOrdersForMonth(selectedYear, selectedMonth);
    } else {
      fetchOrdersForYear(selectedYear);
    }
  }, [selectedYear, selectedMonth, activeTab]);

  // Перерисовываем диаграмму при изменении настроек видимости столбцов
  useEffect(() => {
    if (activeTab === 0 && currentMonthOrders.length > 0) {
      processSalesData(currentMonthOrders);
    } else if (activeTab === 1 && yearlyOrders.length > 0) {
      processYearlyData(yearlyOrders);
    }
  }, [showOrdersColumn, showAmountsColumn, currentMonthOrders, yearlyOrders, activeTab]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: activeTab === 0 
          ? `Sales Statistics for ${MONTHS[selectedMonth]} ${selectedYear}`
          : `Sales Statistics for ${selectedYear}`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const datasetLabel = context.dataset.label;
            const value = context.raw;
            
            if (datasetLabel === 'Number of Orders') {
              return `${datasetLabel}: ${value}`;
            } else if (datasetLabel === 'Sales Amount (€)') {
              return `${datasetLabel}: €${value.toFixed(2)}`;
            }
            
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: activeTab === 0 ? 'Day of Month' : 'Month'
        }
      },
      y: {
        type: 'linear' as const,
        display: showOrdersColumn,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: showOrdersColumn,
          text: 'Number of Orders'
        },
        ticks: {
          stepSize: 1,
        },
      },
      y1: {
        type: 'linear' as const,
        display: showAmountsColumn,
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: showAmountsColumn,
          text: 'Sales Amount (€)'
        },
        grid: {
          drawOnChartArea: false,
        },
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
                    // variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/router_statistic-page')}
                  >
                    back
                  </Button>
                </Box> 


        <Box sx={sectionBox}>
          <Typography variant="h4" component="h4" sx={{ mb: 3 }}>
            Sales Statistics
          </Typography>
          
          {/* Табы для переключения между видами статистики */}
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
              Error, try later
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" component="h6" sx={{ mb: 2 }}>
                {activeTab === 0 
                  ? `Sales Statistics for ${MONTHS[selectedMonth]} ${selectedYear}`
                  : `Sales Statistics for ${selectedYear}`
                }
              </Typography>
              
              <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showOrdersColumn}
                      onChange={(e) => setShowOrdersColumn(e.target.checked)}
                      sx={{
                        color: 'rgba(54, 162, 235, 1)',
                        '&.Mui-checked': {
                          color: 'rgba(54, 162, 235, 1)',
                        },
                      }}
                    />
                  }
                  label="Number of Orders"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showAmountsColumn}
                      onChange={(e) => setShowAmountsColumn(e.target.checked)}
                      sx={{
                        color: 'rgba(255, 99, 132, 1)',
                        '&.Mui-checked': {
                          color: 'rgba(255, 99, 132, 1)',
                        },
                      }}
                    />
                  }
                  label="Sales Amount (€)"
                />
              </Stack>

              <Box sx={{ height: 400 }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography>Loading data...</Typography>
                  </Box>
                ) : (activeTab === 0 && dailySalesData.labels.length > 0) ? (
                  <Bar data={dailySalesData} options={chartOptions} />
                ) : (activeTab === 1 && yearlyChart.labels.length > 0) ? (
                  <Bar data={yearlyChart} options={chartOptions} />
                ) : (
                  <Typography>No data to display</Typography>
                )}
              </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" component="h6" sx={{ mb: 2 }}>
                {activeTab === 0 
                  ? `Summary for ${MONTHS[selectedMonth]} ${selectedYear}`
                  : `Summary for ${selectedYear}`
                }
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography>Loading...</Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Total Orders: {activeTab === 0 ? currentMonthOrders.length : yearlyOrders.length}
                  </Typography>
                  <Typography variant="body1">
                    Total Sales Amount: €{
                      activeTab === 0 
                        ? dailySalesAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)
                        : yearlyAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)
                    }
                  </Typography>
                </>
              )}
            </Paper>
          </>
        )}
      </Box>
    </>
  );
};