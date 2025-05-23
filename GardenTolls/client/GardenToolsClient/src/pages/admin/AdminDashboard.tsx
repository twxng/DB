import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Stack,
  alpha,
  Container,
  Tooltip
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  ShoppingBag,
  People,
  Inventory,
  MonetizationOn,
  DateRange
} from '@mui/icons-material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import './products/style.css';

// Типи для даних
interface SalesData {
  date: string;
  sales: number;
  revenue: number;
}

interface ProductData {
  id: number;
  name: string;
  price: number;
  soldCount: number;
  stock: number;
  imageUrl: string;
}

interface OrderData {
  id: number;
  customer: string;
  date: string;
  status: string;
  total: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down';
  percent?: number;
  subtitle?: string;
}

// Заглушки даних
const salesData: SalesData[] = [
  { date: '2025-01', sales: 42, revenue: 5600 },
  { date: '2025-02', sales: 56, revenue: 7800 },
  { date: '2025-03', sales: 65, revenue: 9100 },
  { date: '2025-04', sales: 78, revenue: 10200 },
  { date: '2025-05', sales: 85, revenue: 11900 },
  { date: '2025-06', sales: 92, revenue: 13400 },
];

const topProducts: ProductData[] = [
  { id: 1, name: 'Садова лопата преміум', price: 850, soldCount: 48, stock: 37, imageUrl: '/products/shovel.jpg' },
  { id: 2, name: 'Набір інструментів для саду', price: 1250, soldCount: 35, stock: 14, imageUrl: '/products/garden-set.jpg' },
  { id: 3, name: 'Тример електричний', price: 1750, soldCount: 29, stock: 8, imageUrl: '/products/trimmer.jpg' },
  { id: 4, name: 'Газонокосарка бензинова', price: 5400, soldCount: 21, stock: 5, imageUrl: '/products/mower.jpg' },
];

const recentOrders: OrderData[] = [
  { id: 1001, customer: 'Олександр Петренко', date: '2025-06-15', status: 'Доставлено', total: 1540 },
  { id: 1002, customer: 'Ірина Коваленко', date: '2025-06-14', status: 'В дорозі', total: 3200 },
  { id: 1003, customer: 'Василь Тимошенко', date: '2025-06-14', status: 'Оплачено', total: 750 },
  { id: 1004, customer: 'Марія Сидоренко', date: '2025-06-13', status: 'Оброблюється', total: 4900 },
  { id: 1005, customer: 'Денис Шевченко', date: '2025-06-12', status: 'Доставлено', total: 2100 },
];

// Компонент для карток статистики
const StatCard = ({ title, value, icon, color, trend, percent, subtitle }: StatCardProps) => {
  return (
    <Card className="admin-panel-card">
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" className="admin-panel-subtitle" fontWeight="500">
            {title}
          </Typography>
          <Avatar
            sx={{
              backgroundColor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        <Typography variant="h4" fontWeight="bold" className="admin-panel-title" sx={{ mb: 1 }}>
          {typeof value === 'number' ? value.toLocaleString('uk-UA') : value}
        </Typography>
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              icon={trend === 'up' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
              label={`${percent}%`}
              size="small"
              sx={{ 
                mr: 1, 
                backgroundColor: trend === 'up' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                color: trend === 'up' ? '#4caf50' : '#f44336',
                borderColor: trend === 'up' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)',
                border: '1px solid'
              }}
            />
            <Typography variant="body2" className="admin-panel-subtitle">
              {subtitle || 'порівняно з минулим місяцем'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  // Буде використано для навігації в майбутньому
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Імітація завантаження даних
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Функція для оновлення даних, буде використана в майбутньому
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Функція для визначення кольору статусу замовлення
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Доставлено':
        return 'success';
      case 'В дорозі':
        return 'info';
      case 'Оплачено':
        return 'primary';
      case 'Оброблюється':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  return (
    <Box className="admin-panel-container">
      <Container maxWidth="xl">
        
        {loading && <LinearProgress className="admin-panel-progress" sx={{ mb: 4 }} />}
        
        {/* Статистичні картки */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ width: { xs: '100%', sm: '47%', lg: '23%' } }}>
            <StatCard
              title="Загальні продажі"
              value="382"
              icon={<ShoppingBag />}
              color="#7fffd4"
              trend="up"
              percent={12.5}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '47%', lg: '23%' } }}>
            <StatCard
              title="Дохід"
              value="₴ 58,430"
              icon={<MonetizationOn />}
              color="#4caf50"
              trend="up"
              percent={8.2}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '47%', lg: '23%' } }}>
            <StatCard
              title="Нові клієнти"
              value="124"
              icon={<People />}
              color="#2196f3"
              trend="up"
              percent={5.3}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '47%', lg: '23%' } }}>
            <StatCard
              title="Товарів в наявності"
              value="597"
              icon={<Inventory />}
              color="#ff9800"
              trend="down"
              percent={3.6}
            />
          </Box>
        </Box>
        
        {/* Графіки та таблиці */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Графік продажів */}
          <Box sx={{ width: { xs: '100%', md: '64%' } }}>
            <Card className="admin-panel-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" className="admin-panel-title">
                      Статистика продажів
                    </Typography>
                    <Typography variant="body2" className="admin-panel-subtitle">
                      <DateRange fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      Січень - Червень 2025
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label="Продажі" 
                      size="small" 
                      className="admin-panel-chip"
                    />
                    <Chip 
                      label="Дохід" 
                      size="small" 
                      className="admin-panel-chip-success"
                    />
                  </Stack>
                </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(127, 255, 212, 0.2)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255, 255, 255, 0.7)' }} />
                      <YAxis yAxisId="left" tick={{ fill: 'rgba(255, 255, 255, 0.7)' }} />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fill: 'rgba(255, 255, 255, 0.7)' }} 
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(23, 33, 25, 0.9)', 
                          borderColor: 'rgba(127, 255, 212, 0.2)',
                          color: '#fff' 
                        }}
                        formatter={(value, name) => {
                          return [
                            name === 'sales' 
                              ? `${value} шт.` 
                              : `₴ ${value.toLocaleString('uk-UA')}`,
                            name === 'sales' ? 'Продажі' : 'Дохід'
                          ];
                        }}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#7fffd4" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#4caf50" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          {/* Популярні товари */}
          <Box sx={{ width: { xs: '100%', md: '33%' } }}>
            <Card className="admin-panel-card">
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }} className="admin-panel-title">
                  Популярні товари
                </Typography>
                <List disablePadding>
                  {topProducts.map((product, index) => (
                    <Box key={product.id}>
                      {index > 0 && <Divider className="admin-panel-divider" />}
                      <ListItem sx={{ py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 56 }}>
                          <Avatar 
                            variant="rounded" 
                            alt={product.name}
                            src={product.imageUrl}
                            sx={{ width: 48, height: 48, borderRadius: 1 }}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={<Typography color="#fff">{product.name}</Typography>}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2" className="admin-panel-subtitle" sx={{ mr: 2 }}>
                                ₴ {product.price.toLocaleString('uk-UA')}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={`${product.soldCount} прод.`}
                                className="admin-panel-chip-success"
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.7rem'
                                }} 
                              />
                            </Box>
                          }
                          sx={{ my: 0 }}
                        />
                        <Tooltip title="Залишок на складі">
                          <Chip 
                            size="small" 
                            label={product.stock}
                            className={product.stock < 10 ? "admin-panel-chip-warning" : "admin-panel-chip"}
                          />
                        </Tooltip>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
          
          {/* Останні замовлення */}
          <Box sx={{ width: '100%' }}>
            <Card className="admin-panel-card">
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }} className="admin-panel-title">
                  Останні замовлення
                </Typography>
              </CardContent>
              <TableContainer>
                <Table className="admin-panel-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID замовлення</TableCell>
                      <TableCell>Клієнт</TableCell>
                      <TableCell>Дата</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell align="right">Сума</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        hover
                      >
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            size="small" 
                            className={
                              getStatusColor(order.status) === 'success' ? "admin-panel-chip-success" :
                              getStatusColor(order.status) === 'info' ? "admin-panel-chip-info" :
                              getStatusColor(order.status) === 'primary' ? "admin-panel-chip" :
                              "admin-panel-chip-warning"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">₴ {order.total.toLocaleString('uk-UA')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 